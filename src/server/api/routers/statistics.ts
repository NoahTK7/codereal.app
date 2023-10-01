import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

export const statisticsRouter = createTRPCRouter({
  global: publicProcedure // TODO cache response
    .query(() => {
      // TODO
      return {
        topFive: [
          { username: "user1", score: 500 },
          { username: "user2", score: 400 },
        ]
      }
    }),
  personal: privateProcedure
    .query(() => {
      // TODO
      return {
        totalAnswered: 3,
        highScore: 500
      }
    })
});
