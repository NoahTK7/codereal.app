import { type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { filterQuestionForClient } from "~/server/helpers/filter";

export const getQuestionById = async (db: PrismaClient, qid: number) => {
  const question = await db.question.findFirst({
    where: {
      id: qid
    }
  })

  if (question === null) throw new TRPCError({ code: "NOT_FOUND" })

  return question
}

export const questionRouter = createTRPCRouter({
  get: privateProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const currentQuestion = await getCurrentQuestion(ctx.db)
      if (input.id > currentQuestion.id)
        throw new TRPCError({ code: "NOT_FOUND" })
      const question = await getQuestionById(ctx.db, input.id)
      return filterQuestionForClient(question)
    }),
  start: privateProcedure
    .input(z.object({ questionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const currentQuestion = await getCurrentQuestion(ctx.db)
      if (input.questionId > currentQuestion.id)
        throw new TRPCError({ code: "NOT_FOUND" })

      if (await isQuestionAlreadyStartedByUser(ctx.db, ctx.userId, input.questionId))
        return {
          result: true
        }

      try {
        const startEvent = await ctx.db.startEvent.create({
          data: {
            authorId: ctx.userId,
            questionId: input.questionId
          }
        })
        return {
          result: true,
          id: startEvent.id
        }
      } catch (e) {
        console.error("submissionRouter/submit", e)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }
    }),
  getInfinite: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).nullish(),
        cursor: z.number().nullish()
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10
      const { cursor } = input
      const questions = await ctx.db.question.findMany({
        take: limit + 1, // take an extra at end to use as next cursor
        select: {
          id: true,
          questionNum: true,
          title: true,
          startsAt: true,
          submissions: {
            where: {
              authorId: ctx.userId
            },
            select: {
              runResult: true
            }
          }
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          questionNum: 'desc',
        },
      })
      let nextCursor: typeof cursor | undefined = undefined
      if (questions.length > limit) {
        const nextItem = questions.pop()
        nextCursor = nextItem!.id
      }
      return {
        questions,
        nextCursor,
      };
    }),
});

const isQuestionAlreadyStartedByUser = async (db: PrismaClient, userId: string, questionId: number) => {
  const num = await db.startEvent.count({
    where: {
      authorId: userId,
      questionId: questionId,
    }
  })
  return num > 0
}

// This function is the source of truth
// The current question id is passed to the client via "status.personal" proc
// Otherwise, this function should only be used to validate that future questions are not being accessed/referenced
// All other procs that need a question id must get the id from the client
// This allows the user to start/submit previous questions at any time
export const getCurrentQuestion = async (db: PrismaClient) => {
  const question = await db.question.findFirst({
    where: {
      startsAt: {
        lt: new Date()
      },
      endsAt: {
        gt: new Date()
      }
    }
  })

  if (!question) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })

  return question
}
