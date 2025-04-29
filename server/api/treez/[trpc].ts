import { createTRPCNuxtHandler } from 'trpc-nuxt/server'

import { createTRPCContext } from '~/server/trpc/init'
import { appRouter } from '~/server/trpc/routers'

export default createTRPCNuxtHandler({
  endpoint: '/api/treez',
  router: appRouter,
  createContext: createTRPCContext,
})
