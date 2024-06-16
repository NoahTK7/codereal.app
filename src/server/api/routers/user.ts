
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filter";

export const userRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const { data: [user] } = await clerkClient.users.getUserList({
        username: [input.username],
      })

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        })
      }

      return filterUserForClient(user)
    })
});

export const getUserById = async (id: string) => {
  const user = await clerkClient.users.getUser(id)
  return filterUserForClient(user)
}
