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

      // TODO just return question db record
      return {
        id: question.id,
        questionDescription: question.description,
        funcSignature: question.funcSig
      }
    }),
  start: privateProcedure
    .mutation(async ({ ctx }) => {
      // TODO check if already started
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
