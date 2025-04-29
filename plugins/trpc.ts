import superjson from 'superjson'
import { createTRPCNuxtClient, httpBatchLink, httpLink } from 'trpc-nuxt/client'

import { INVALID_REFRESH_TOKEN, INVALID_TOKEN, TOKEN_EXPIRED } from '~/constant/jwt'
import type { AppRouter } from '~/server/trpc/routers'

interface TRPCErrorResponse {
  error: {
    json?: {
      message: string
    }
  }
}

export default defineNuxtPlugin(() => {
  const endpoint = '/api/treez'
  const headers = useRequestHeaders()
  const { csrf } = useCsrf()
  const authStore = useAuthStore()
  const transactionId = generateTransactionId()

  const getCommonHeaders = () => ({
    ...headers,
    'x-csrf-token': csrf,
    'x-transaction-id': transactionId,
  })

  const handleTokenRefresh = async (isBatch: boolean): Promise<string | null> => {
    try {
      const { $trpc, $trpcBatch } = useNuxtApp()
      const client = isBatch ? $trpcBatch : $trpc
      const result = await client.auth.refreshToken.mutate()

      if (!result.data) {
        throw new Error('Token refresh failed: No data received')
      }

      return result.data.token.accessToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      authStore.$reset()
      return null
    }
  }

  const createLinkConfig = (isBatch: boolean) => ({
    url: endpoint,
    headers: getCommonHeaders,
    async fetch(url: URL | RequestInfo, options?: RequestInit): Promise<Response> {
      try {
        const response = await fetch(url, options)

        if (response.status === 401) {
          const data = (await response.clone().json()) as TRPCErrorResponse | TRPCErrorResponse[]
          const errorMessage = isBatch
            ? (data as TRPCErrorResponse[])[0]?.error?.json?.message
            : (data as TRPCErrorResponse)?.error?.json?.message

          if (errorMessage === TOKEN_EXPIRED) {
            const newAccessToken = await handleTokenRefresh(isBatch)
            if (newAccessToken) {
              return fetch(url, {
                ...options,
                headers: {
                  ...options?.headers,
                  ...getCommonHeaders(),
                },
              })
            }
          }

          if (errorMessage === INVALID_TOKEN || errorMessage === INVALID_REFRESH_TOKEN) {
            authStore.$reset()
            navigateTo('/login')
          }
        }

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
    links: [httpLink(createLinkConfig(false))],
  })

  const trpcBatch = createTRPCNuxtClient<AppRouter>({
    links: [httpBatchLink(createLinkConfig(true))],
  })

  return {
    provide: {
      trpc,
      trpcBatch,
    },
  }
})
