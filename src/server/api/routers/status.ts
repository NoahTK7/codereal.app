import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

export const statusRouter = createTRPCRouter({
  global: publicProcedure
    .query(() => {
      return {
        numAnswered: 3,
      }
    }),
  personal: privateProcedure
    .query(() => {
      return {
        completed: {
          status: false,
          submissionId: -1
        },
        started: {
          status: true,
          startTime: new Date()
        }
      }
    })
});
