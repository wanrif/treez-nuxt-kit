import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { RouterClient } from '@orpc/server'

import type router from '~/server/orpc/routes'

export default defineNuxtPlugin(() => {
  const headers = useRequestHeaders()
  const { csrf } = useCsrf()
  const transactionId = generateTransactionId()

  const getCommonHeaders = () => ({
    ...headers,
    'x-csrf-token': csrf,
    'x-transaction-id': transactionId,
  })

  const link = new RPCLink({
    url: 'http://localhost:3000/api/treez-nuxtify',
    headers: getCommonHeaders(),
  })

  return {
    provide: {
      orpc: createORPCClient(link) as RouterClient<typeof router>,
    },
  }
})
