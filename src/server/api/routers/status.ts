import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

export const statusRouter = createTRPCRouter({
  global: publicProcedure
    .query(() => {
      return {
        numAnswered: 3,
      }
    }),
  personal: privateProcedure
    .query(({ ctx }) => {
      return {
        userId: ctx.userId,
        isCompleted: false,
        isStarted: false
      }
    })
});
