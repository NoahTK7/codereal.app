import { type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { filterQuestionForClient } from "~/server/helpers/filter";
import { getCurrentQuestionId } from "~/server/helpers/getCurrentQuestionId";

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
      if (input.id > getCurrentQuestionId())
        throw new TRPCError({ code: "NOT_FOUND" })
      const question = await getQuestionById(ctx.db, input.id)
      return filterQuestionForClient(question)
    }),
  start: privateProcedure
    .input(z.object({ questionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (input.questionId > getCurrentQuestionId())
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
    })
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
