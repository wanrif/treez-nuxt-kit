import { RPCHandler } from '@orpc/server/node'

import router from '~/server/orpc/routes'
import { generateTransactionId } from '~/utils/commonHelper'

const handler = new RPCHandler(router)

export default defineEventHandler(async (event) => {
  const { matched } = await handler.handle(event.node.req, event.node.res, {
    prefix: '/api/treez-nuxtify',
    context: {
      event,
      transactionId: (event.node.req.headers['x-transaction-id'] as string) || generateTransactionId(),
    }, // Provide initial context if needed
  })

  if (matched) {
    return
  }

  setResponseStatus(event, 404, 'Not Found')
  return 'Not found'
})
