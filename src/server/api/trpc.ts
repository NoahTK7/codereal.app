import { getAuth } from "@clerk/nextjs/server";
import { TRPCError, initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/server/db";

export const createTRPCContext = (
  opts: CreateNextContextOptions
) => {
  const auth = getAuth(opts.req)
  const userId = auth.userId;
  return {
    db,
    userId,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  return next({
    ctx: {
      userId: ctx.userId,
    },
  });
});

export const privateProcedure = t.procedure.use(enforceUserIsAuthed);
