import { createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "./routers/user";
import { statisticsRouter } from "./routers/statistics";
import { questionRouter } from "./routers/question";
import { submissionRouter } from "./routers/submission";
import { globalStateRouter } from "./routers/state";

// primary API router
export const appRouter = createTRPCRouter({
  globalState: globalStateRouter,
  statistics: statisticsRouter,
  question: questionRouter,
  user: userRouter,
  submission: submissionRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
