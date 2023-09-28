import { SubmissionResult } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { getCurrentQuestion } from "~/server/helpers/getCurrentQuestion";

export const submissionRouter = createTRPCRouter({
  get: privateProcedure
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
      const currentQuestion = getCurrentQuestion()
      const execResult = executeCode(currentQuestion, input.code)

      try {
        const submission = await ctx.db.submission.create({
          data: {
            authorId: ctx.userId,
            questionId: getCurrentQuestion(),
            code: input.code,
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
});

type CodeExecutionResult = {
  runResult: SubmissionResult,
  score: number,
  codeLength: number,
  solveTime: number,
  execTime: number,
}
const executeCode = (_questionId: number, _code: string) => {
  return {
    runResult: SubmissionResult.CORRECT,
    score: 456,
    codeLength: 23,
    solveTime: 7135,
    execTime: 342
  } satisfies CodeExecutionResult
}
