import { filterQuestionForClientPublic } from "~/server/helpers/filter";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { getLatestQuestion } from "./question";

export type ClientFeatureToggleState = Record<string, boolean>
export type ServerFeatureToggleState = Record<string, boolean>

export const globalStateRouter = createTRPCRouter({
  getLatestQuestion: publicProcedure
    .query(async ({ ctx }) => {
      const latestQuestion = await getLatestQuestion(ctx.db)
      return filterQuestionForClientPublic(latestQuestion)
    }),
  getFeatureToggles: publicProcedure
    .query(({ }) => {
      return getClientFeatureToggles()
    }),
});

const getClientFeatureToggles = (): ClientFeatureToggleState => {
  return {
    allowMultipleAttempts: true
  }
}

const getServerFeatureToggles = (): ServerFeatureToggleState => {
  return {
    allowMultipleAttempts: true
  }
}
