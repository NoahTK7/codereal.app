import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { executeCode } from "~/server/executeCode";

export type ExecuteRouter = typeof executeRouter

export const executeRouter = createTRPCRouter({
  execute: privateProcedure
    .mutation(async () => {
      console.time('execute-sandbox')
      const res = await executeCode()
      console.timeEnd('execute-sandbox')
      return res
    })
})
