import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "~/env.mjs";
import { appRouter } from "~/server/api/appRouter";
import { createTRPCContext } from "~/server/api/trpc";

type CacheConfigs = Record<string, {
  maxage: number;
}>
const cacheConfigs: CacheConfigs = {
  'status.global': {
    maxage: 60 * 5,
  }
}


// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
        console.error(
          `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
        );
      }
      : undefined,
  responseMeta({ paths, type, errors }) {
    if (!paths || paths.length !== 1) return {}

    const isSuccess = errors.length === 0
    const isQuery = type === 'query'

    if (isSuccess && isQuery) {
      const path = paths[0] ?? ''
      const config = cacheConfigs[path] ?? { maxage: 0 }
      return {
        headers: {
          'Cache-Control': `max-age=${config.maxage}`,
          'CDN-Cache-Control': `max-age=${config.maxage}`,
          'Vercel-CDN-Cache-Control': `max-age=${config.maxage}`,
        }
      }
    }
    return {};
  },
})
