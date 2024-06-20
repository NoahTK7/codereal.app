import { PrismaClient } from "@prisma/client";
import { log as axiom } from "next-axiom";

import { env } from "~/env.mjs";

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'info', emit: 'event' },
      { level: 'warn', emit: 'event' },
      { level: 'error', emit: 'event' }
    ]
  });

  client.$on('query', e => {
    if (env.NODE_ENV !== 'development') {
      axiom.info("query", { ...e })
    } else {
      console.log(e)
    }
  })

  client.$on('info', e => {
    if (env.NODE_ENV !== 'production') {
      console.log(e)
    }
  })

  client.$on('warn', e => {
    if (env.NODE_ENV !== 'production') {
      console.log(e)
    }
  })

  client.$on('error', e => {
    console.log(e)
  })

  return client
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const db = globalThis.prismaGlobal ?? prismaClientSingleton()

if (env.NODE_ENV === 'development') globalThis.prismaGlobal = db
