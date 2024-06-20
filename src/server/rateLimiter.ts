import { TRPCError } from "@trpc/server";
import { RateLimiterPrisma } from "rate-limiter-flexible"

import { db } from "~/server/db";

const rateLimiter = new RateLimiterPrisma({
  storeClient: db,
  tableName: "RateLimiter",
  points: 4,
  duration: 60,
})

export async function rateLimit(userId: string) {
  return await rateLimiter.penalty(userId, 1).catch(err => {
    console.log("Rate limiter error: " + err)
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Rate limiter error" })
  })
}
