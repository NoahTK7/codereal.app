import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { getCurrentQuestionExp, getCurrentQuestionId } from "~/server/helpers/getCurrentQuestionId";

export type PersonalStatusData = {
  isStarted: boolean,
  isCompleted: boolean,
  questionId: number,
  submissionId: number | null,
  startTime: Date | null
}

export const statusRouter = createTRPCRouter({
  global: publicProcedure // TODO cache response (5 mins)
    .query(() => {
      const currentQuestionId = getCurrentQuestionId()
      return {
        questionExpiration: getCurrentQuestionExp(currentQuestionId),
      }
    }),
  personal: privateProcedure
    .query(async ({ ctx }): Promise<PersonalStatusData> => {
      const currentQuestionId = getCurrentQuestionId()

      const startEvent = await ctx.db.startEvent.findFirst({
        where: {
          authorId: ctx.userId,
          questionId: currentQuestionId
        }
      })

      if (startEvent == null) {
        return {
          isStarted: false,
          isCompleted: false,
          questionId: currentQuestionId,
          submissionId: null,
          startTime: null
        } satisfies PersonalStatusData
      }

      const submission = await ctx.db.submission.findFirst({
        where: {
          authorId: ctx.userId,
          questionId: currentQuestionId
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
        questionId: currentQuestionId
      } satisfies PersonalStatusData
    })
});
