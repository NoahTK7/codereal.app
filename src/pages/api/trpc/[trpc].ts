import { createNextApiHandler } from "@trpc/server/adapters/next";

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
  onError: ({ error }) => {
    console.error(
      `tRPC error: ${error.message}`
    );
  },
  responseMeta({ paths, type, errors }) {
    if (!paths || paths.length !== 1) return {}

    const isSuccess = errors.length === 0
    const isQuery = type === 'query'

    if (isSuccess && isQuery) {
      const path = paths[0] ?? ''
      const config = cacheConfigs[path]
      if (config) {
        console.log(`setting cache time to ${config.maxage}`)
        return {
          headers: {
            'Cache-Control': `max-age=${config.maxage}`,
            'CDN-Cache-Control': `max-age=${config.maxage}`,
            'Vercel-CDN-Cache-Control': `max-age=${config.maxage}`,
          }
        }
      }
    }
    return {};
  },
})
