import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { getCurrentQuestion } from "./question";

export type PersonalStatusData = {
  isStarted: boolean,
  isCompleted: boolean,
  questionId: number,
  submissionId: number | null,
  startTime: Date | null
}

export const statusRouter = createTRPCRouter({
  global: publicProcedure
    .query(async ({ ctx }) => {
      const currentQuestion = await getCurrentQuestion(ctx.db)
      return {
        questionExpiration: currentQuestion.endsAt
      }
    }),
  personal: privateProcedure
    .query(async ({ ctx }): Promise<PersonalStatusData> => {
      const currentQuestion = await getCurrentQuestion(ctx.db)

      const startEvent = await ctx.db.startEvent.findFirst({
        where: {
          authorId: ctx.userId,
          questionId: currentQuestion.id
        }
      })

      if (startEvent == null) {
        return {
          isStarted: false,
          isCompleted: false,
          questionId: currentQuestion.id,
          submissionId: null,
          startTime: null
        } satisfies PersonalStatusData
      }

      const submission = await ctx.db.submission.findFirst({
        where: {
          authorId: ctx.userId,
          questionId: currentQuestion.id
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
        questionId: currentQuestion.id
      } satisfies PersonalStatusData
    })
});
