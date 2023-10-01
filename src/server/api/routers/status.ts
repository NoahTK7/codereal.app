import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { getCurrentQuestionId } from "~/server/helpers/getCurrentQuestionId";

type PersonalStatusData = {
  started: {
    status: boolean,
    startTime: Date | null
  },
  completed: {
    status: boolean,
    submissionId: number | null
  }
}

export const statusRouter = createTRPCRouter({
  global: publicProcedure
    .query(() => {
      return {
        // TODO: add time til next question (?)
        numAnswered: 3, // TODO
      }
    }),
  personal: privateProcedure
    .query(async ({ ctx }): Promise<PersonalStatusData> => {
      const startEvent = await ctx.db.startEvent.findFirst({
        where: {
          authorId: ctx.userId,
          questionId: getCurrentQuestionId()
        }
      })

      if (startEvent == null) {
        return {
          started: {
            status: false,
            startTime: null
          },
          completed: {
            status: false,
            submissionId: null
          }
        } satisfies PersonalStatusData
      }

      const submission = await ctx.db.submission.findFirst({
        where: {
          authorId: ctx.userId,
          questionId: getCurrentQuestionId()
        },
        select: {
          id: true
        }
      })

      return {
        started: {
          status: true,
          startTime: startEvent.createdAt
        },
        completed: {
          status: submission != null,
          submissionId: submission?.id ?? null
        },
      } satisfies PersonalStatusData
    })
});
