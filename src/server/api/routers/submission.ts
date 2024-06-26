import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { type CodeExecutionResult, executeCode } from "~/server/executeCode";
import { getQuestionById } from "./question";
import { type Question, type PrismaClient, SubmissionResult } from "@prisma/client";
import { updateQuestionStats, updateUserStats } from "./statistics";
import { rateLimit } from "~/server/rateLimiter";
import { getServerFeatureToggles } from "./state";

export const submissionRouter = createTRPCRouter({
  getById: privateProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const submission = await ctx.db.submission.findFirst({
        where: {
          id: input.id,
          authorId: ctx.userId
        }
      })
      if (submission === null) throw new TRPCError({ code: "NOT_FOUND" })
      return submission
    }),
  submit: privateProcedure
    .input(z.object({
      code: z.string().max(512),
      questionId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const rateLimitResp = await rateLimit(ctx.userId)
      if (rateLimitResp.remainingPoints === 0)
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Too many requests. Retry in ${Math.round(rateLimitResp.msBeforeNext / 1000)} seconds.` })

      if (await isQuestionAlreadySubmittedByUser(ctx.db, ctx.userId, input.questionId))
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "You already submitted this question!" })

      const question = await getQuestionById(ctx.db, input.questionId)

      const [execResult, featureToggles] = await Promise.all([
        executeCode(question, input.code),
        getServerFeatureToggles(ctx.db)
      ])
      if (!!featureToggles.allowMultipleAttempts) {
        if (execResult.errorMessage !== null) return {
          error: true,
          submissionId: -1,
          errorMessage: "Execution error: " + execResult.errorMessage
        }
        else if (execResult.accuracy < 1) return {
          error: true,
          submissionId: -1,
          errorMessage: "Incorrect solution"
        }
      }

      const solveTime = await getSolveTime(ctx.db, ctx.userId, input.questionId)
      const codeLength = getCodeLength(question, input.code)
      const score = calculateScore(execResult, solveTime, codeLength)

      let submission
      try {
        submission = await ctx.db.submission.create({
          data: {
            authorId: ctx.userId,
            questionId: question.id,
            code: input.code,
            solveTime,
            codeLength,
            score,
            ...execResult,
          }
        })
      } catch (e) {
        console.error("submissionRouter/submit", e)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      // improvement: make async (?)
      await Promise.all([
        updateQuestionStats(ctx.db, submission),
        updateUserStats(ctx.db, submission)
      ])

      return {
        error: false,
        submissionId: submission.id,
        execResult
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

const getSolveTime = async (db: PrismaClient, userId: string, questionId: number) => {
  const startEvent = await db.startEvent.findFirst({
    where: {
      authorId: userId,
      questionId: questionId
    }
  })
  if (startEvent == null) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "You never started this question!" })
  return Math.abs((new Date).getTime() - startEvent.createdAt.getTime())
}

const isQuestionAlreadySubmittedByUser = async (db: PrismaClient, userId: string, questionId: number) => {
  const num = await db.submission.count({
    where: {
      authorId: userId,
      questionId: questionId
    }
  })
  return num > 0
}

const calculateScore = (execResult: CodeExecutionResult, solveTime: number, codeLength: number) => {
  if (execResult.runResult === SubmissionResult.ERROR
    || execResult.runResult === SubmissionResult.TIMEOUT) return 0
  if (execResult.accuracy === 0) return 0

  const solveTimeScore = -1 * Math.tanh((solveTime / 1000) / 40 - 3) * 120 + 130 // 10 -> 250
  const execTimeScore = -1 * Math.tanh(execResult.execTime / 100 - 4) * 120 + 130 // 10 -> 250
  const codeLengthScore = -1 * Math.tanh(codeLength / 15 - 5) * 45 + 55 // 10 -> 100
  const accuracyScore = execResult.accuracy * 400 // 0 -> 400

  return Math.round(solveTimeScore + execTimeScore + codeLengthScore + accuracyScore)
}
