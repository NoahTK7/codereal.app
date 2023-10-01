import { type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { filterQuestionForClient } from "~/server/helpers/filter";
import { getCurrentQuestionId } from "~/server/helpers/getCurrentQuestionId";

export const getQuestionById = async (db: PrismaClient, qid: number) => {
  const question = await db.question.findFirst({
    where: {
      id: qid
    }
  })

  if (question == null) throw new TRPCError({ code: "NOT_FOUND" })

  return question
}

export const questionRouter = createTRPCRouter({
  get: privateProcedure
    .query(async ({ ctx }) => {
      const question = await getQuestionById(ctx.db, getCurrentQuestionId())
      return filterQuestionForClient(question)
    }),
  start: privateProcedure
    .mutation(async ({ ctx }) => {
      // TODO check if already started
      try {
        const startEvent = await ctx.db.startEvent.create({
          data: {
            authorId: ctx.userId,
            questionId: getCurrentQuestionId()
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
