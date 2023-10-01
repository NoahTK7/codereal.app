import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { type CodeExecutionResult, executeCode } from "~/server/executeCode";
import { getQuestionById } from "./question";
import { type Question, type PrismaClient } from "@prisma/client";
import { getCurrentQuestionId } from "~/server/helpers/getCurrentQuestionId";

export const submissionRouter = createTRPCRouter({
  getById: privateProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const submission = await ctx.db.submission.findFirstOrThrow({
        where: {
          id: input.id
        }
      })
      return submission
    }),
  submit: privateProcedure
    .input(z.object({ code: z.string().max(512) }))
    .mutation(async ({ ctx, input }) => {
      const currentQuestionId = getCurrentQuestionId()

      if (await getSubmissionCountByQuestionId(ctx.db, currentQuestionId) > 0)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "you already submitted this question" })

      const currentQuestion = await getQuestionById(ctx.db, currentQuestionId)

      const [solveTime, execResult] = await Promise.all([
        getSolveTime(ctx),
        executeCode(currentQuestion, input.code)
      ])
      const codeLength = getCodeLength(currentQuestion, input.code)

      const score = calculateScore(execResult, solveTime, codeLength)

      try {
        const submission = await ctx.db.submission.create({
          data: {
            authorId: ctx.userId,
            questionId: currentQuestion.id,
            code: input.code,
            solveTime,
            codeLength,
            score,
            ...execResult,
          }
        })
        return {
          submissionId: submission.id
        }
      } catch (e) {
        console.error("submissionRouter/submit", e)
        return new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
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
      const submissions = await ctx.db.submission.findMany({
        take: limit + 1, // take an extra at end to use as next cursor
        where: {
          authorId: ctx.userId
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          id: 'desc',
        },
      })
      let nextCursor: typeof cursor | undefined = undefined
      if (submissions.length > limit) {
        const nextItem = submissions.pop()
        nextCursor = nextItem!.id
      }
      return {
        submissions,
        nextCursor,
      };
    }),
});

const getCodeLength = (question: Question, userCode: string) => {
  return userCode.length - question.funcSig.length - 5;
}

const getSolveTime = async (ctx: { db: PrismaClient, userId: string }) => {
  const startEvent = await ctx.db.startEvent.findFirst({
    where: {
      authorId: ctx.userId,
      questionId: getCurrentQuestionId()
    }
  })
  if (startEvent == null) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "looks like you never started this question" })
  return Math.abs((new Date).getTime() - startEvent.createdAt.getTime())
}

const getSubmissionCountByQuestionId = (db: PrismaClient, qId: number) => {
  return db.submission.count({
    where: {
      questionId: qId
    }
  })
}

const calculateScore = (execResult: CodeExecutionResult, solveTime: number, codeLength: number) => {
  const solveTimeScore = -1 * Math.tanh((solveTime / 1000) / 40 - 3) * 120 + 130 // 10 -> 250
  const execTimeScore = -1 * Math.tanh(execResult.execTime / 100 - 4) * 120 + 130 // 10 -> 250
  const codeLengthScore = -1 * Math.tanh(codeLength / 15 - 5) * 45 + 55 // 10 -> 100
  const accuracyScore = execResult.accuracy * 400 // 0 -> 400

  return Math.round(solveTimeScore + execTimeScore + codeLengthScore + accuracyScore)
}
