import { inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'

export const authClient = createAuthClient({
  fetchOptions: {
    onRequest(context) {
      const { csrf } = useCsrf()
      context.headers.set('x-csrf-token', csrf)
    },
    onError: async (context) => {
      const { response } = context
      if (response.status === 429) {
        const retryAfter = response.headers.get('X-Retry-After')
        // eslint-disable-next-line no-console
        console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`)
      }
    },
  },
  plugins: [inferAdditionalFields<typeof auth>()],
})
