import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const questionRouter = createTRPCRouter({
  submit: privateProcedure
    .input(z.object({code: z.string().max(512)}))
    .mutation(() => {
      return {
        result: "SUCCESS",
        score: 456
      }
    }),
  get: privateProcedure
    .query(() => {
      return {
        questionDescription: "Your task is to write a function, sum, that takes two integers, a and b, and returns their sum.",
        funcSignature: "function sum(a, b)"
      }
    }),
  start: privateProcedure
    .mutation(() => {
      return {
        result: true
      }
    })
});
