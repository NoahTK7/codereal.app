import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { getCurrentQuestion } from "~/server/helpers/getCurrentQuestion";

export const questionRouter = createTRPCRouter({
  get: privateProcedure
    .query(async ({ ctx }) => {
      const question = await ctx.db.question.findFirst({
        where: {
          id: getCurrentQuestion()
        }
      })

      if (question == null) throw new TRPCError({ code: "NOT_FOUND" })

      return {
        questionDescription: question.description,
        funcSignature: question.funcSig
      }
      // TODO
      return {
        questionDescription: "Your task is to write a function, sum, that takes two integers, a and b, and returns their sum.",
        funcSignature: "function sum(a, b)"
      }
    }),
  start: privateProcedure
    .mutation(async ({ ctx }) => {
      try {
        const startEvent = await ctx.db.startEvent.create({
          data: {
            authorId: ctx.userId,
            questionId: getCurrentQuestion()
          }
        })
        return {
          result: true,
          id: startEvent.id
        }
      } catch (e) {
        console.error("submissionRouter/submit", e)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }
    })
});
