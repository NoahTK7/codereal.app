import { createTRPCRouter } from "~/server/api/trpc";
import { statusRouter } from "./routers/status";
import { userRouter } from "./routers/user";
import { statisticsRouter } from "./routers/statistics";
import { questionRouter } from "./routers/question";
import { submissionRouter } from "./routers/submission";

// primary API router
export const appRouter = createTRPCRouter({
  status: statusRouter,
  statistics: statisticsRouter,
  question: questionRouter,
  user: userRouter,
  submission: submissionRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
