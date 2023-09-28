import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { getCurrentQuestion } from "~/server/helpers/getCurrentQuestion";

export type PersonalStatusData = {
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
      // TODO
      return {
        numAnswered: 3,
      }
    }),
  personal: privateProcedure
    .query(async ({ ctx }): Promise<PersonalStatusData> => {
      const startEvent = await ctx.db.startEvent.findFirst({
        where: {
          authorId: ctx.userId,
          questionId: getCurrentQuestion()
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
          questionId: getCurrentQuestion()
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
