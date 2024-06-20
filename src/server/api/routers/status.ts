import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { getLatestQuestion, getQuestionById } from "./question";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { filterQuestionForClientPublic } from "~/server/helpers/filter";

export type QuestionStatusData = {
  isStarted: boolean,
  isCompleted: boolean,
  questionId: number,
  submissionId: number | null,
  startTime: Date | null
}

export const statusRouter = createTRPCRouter({
  global: publicProcedure
    .query(async ({ ctx }) => {
      const latestQuestion = await getLatestQuestion(ctx.db)
      return filterQuestionForClientPublic(latestQuestion)
    }),
  question: privateProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }): Promise<QuestionStatusData> => {
      const latestQuestion = await getLatestQuestion(ctx.db)
      if (input.id > latestQuestion.questionNum)
        throw new TRPCError({ code: "BAD_REQUEST" })

      const question = await getQuestionById(ctx.db, input.id)

      const startEvent = await ctx.db.startEvent.findFirst({
        where: {
          authorId: ctx.userId,
          questionId: question.id
        }
      })

      if (startEvent == null) {
        return {
          isStarted: false,
          isCompleted: false,
          questionId: question.questionNum,
          submissionId: null,
          startTime: null
        } satisfies QuestionStatusData
      }

      const submission = await ctx.db.submission.findFirst({
        where: {
          authorId: ctx.userId,
          questionId: question.id
        },
        select: {
          id: true
        }
      })

      return {
        isStarted: true,
        startTime: startEvent.createdAt,
        isCompleted: submission != null,
        submissionId: submission?.id ?? null,
        questionId: question.questionNum
      } satisfies QuestionStatusData
    })
});
