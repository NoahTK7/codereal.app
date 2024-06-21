import { filterQuestionForClientPublic } from "~/server/helpers/filter";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { getLatestQuestion } from "./question";
import { type PrismaClient } from "@prisma/client";

export type ClientFeatureToggleState = Record<string, boolean>
export type ServerFeatureToggleState = Record<string, boolean>

export const globalStateRouter = createTRPCRouter({
  getLatestQuestion: publicProcedure
    .query(async ({ ctx }) => {
      const latestQuestion = await getLatestQuestion(ctx.db)
      return filterQuestionForClientPublic(latestQuestion)
    }),
  getFeatureToggles: publicProcedure
    .query(async ({ ctx }) => {
      return await getClientFeatureToggles(ctx.db)
    }),
});

const getClientFeatureToggles = async (db: PrismaClient): Promise<ClientFeatureToggleState> => {
  const records = await db.featureToggle.findMany({
    where: {
      type: "CLIENT"
    }
  })
  const out = {} as ClientFeatureToggleState
  for (const record of records) {
    out[record.key] = record.value
  }
  return out
}

const getServerFeatureToggles = async (db: PrismaClient): Promise<ServerFeatureToggleState> => {
  const records = await db.featureToggle.findMany({
    where: {
      type: "SERVER"
    }
  })
  const out = {} as ClientFeatureToggleState
  for (const record of records) {
    out[record.key] = record.value
  }
  return out
}
