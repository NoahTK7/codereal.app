import { type PrismaClient, Prisma } from "@prisma/client"

export const withTransaction = async <T>(db: PrismaClient, func: (tx: Omit<PrismaClient, ITXClientDenyList>, data: T) => Promise<unknown>, data: T, options: { retries: number }) => {
  const MAX_RETRIES = options.retries
  let currentRetries = 0

  let result
  while (currentRetries < MAX_RETRIES) {
    try {
      result = await db.$transaction((tx) => func(tx, data), {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      })
      break
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2034') { // transaction error: https://www.prisma.io/docs/reference/api-reference/error-reference#p2034
          currentRetries++
          continue
        }
        throw error
      }
    }
  }
  return result
}

declare const denylist: readonly ["$connect", "$disconnect", "$on", "$transaction", "$use", "$extends"];
type ITXClientDenyList = (typeof denylist)[number];
export type TransactionPrismaClient = Omit<PrismaClient, ITXClientDenyList>
