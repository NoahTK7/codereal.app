import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const statusRouter = createTRPCRouter({
  submit: privateProcedure
    .input(z.object({code: z.string().max(512)}))
    .query(() => {
      return {
        result: "SUCCESS",
        score: 456
      }
    }),
  get: privateProcedure
    .query(() => {
      return {
        questionDescription: "add 2 numbers",
        funcSignature: "function sum(a, b)"
      }
    })
});
