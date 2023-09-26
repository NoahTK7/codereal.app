import { createTRPCRouter } from "~/server/api/trpc";
import { statusRouter } from "./routers/status";
import { userRouter } from "./routers/user";
import { statisticsRouter } from "./routers/statistics";
import { questionRouter } from "./routers/question";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  status: statusRouter,
  statistics: statisticsRouter,
  question: questionRouter,
  user: userRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
