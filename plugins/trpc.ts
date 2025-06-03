import superjson from 'superjson'
import { createTRPCNuxtClient, httpBatchLink, httpLink } from 'trpc-nuxt/client'

import { loggerLink } from '@trpc/client'

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
    transformer: superjson,
  })

  const trpc = createTRPCNuxtClient<AppRouter>({
    links: [
      loggerLink({
        enabled: (opts) =>
          (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),
      httpLink(createLinkConfig()),
    ],
  })

  const trpcBatch = createTRPCNuxtClient<AppRouter>({
    links: [
      loggerLink({
        enabled: (opts) =>
          (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),
      httpBatchLink(createLinkConfig()),
    ],
  })

  return {
    provide: {
      trpc,
      trpcBatch,
    },
  }
})
