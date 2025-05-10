import superjson from 'superjson'
import { createTRPCNuxtClient, httpBatchLink, httpLink } from 'trpc-nuxt/client'

import type { AppRouter } from '~/server/trpc/routers'

export default defineNuxtPlugin(() => {
  const endpoint = '/api/treez'
  const headers = useRequestHeaders()
  const { csrf } = useCsrf()
  const transactionId = generateTransactionId()

  const getCommonHeaders = () => ({
    ...headers,
    'x-csrf-token': csrf,
    'x-transaction-id': transactionId,
  })

  const createLinkConfig = () => ({
    url: endpoint,
    headers: getCommonHeaders(),
    async fetch(url: URL | RequestInfo, options?: RequestInit): Promise<Response> {
      try {
        const response = await fetch(url, options)

        return response
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('API request failed:', message)
        throw createError({ message: `API request failed: ${message}` })
      }
    },
    transformer: superjson,
  })

  const trpc = createTRPCNuxtClient<AppRouter>({
    links: [httpLink(createLinkConfig())],
  })

  const trpcBatch = createTRPCNuxtClient<AppRouter>({
    links: [httpBatchLink(createLinkConfig())],
  })

  return {
    provide: {
      trpc,
      trpcBatch,
    },
  }
})
