import type { H3Event } from 'h3'

import { ORPCError, os } from '@orpc/server'

const authMiddleware = os
  .$context<{ event: H3Event; transactionId: string }>() // <-- define dependent-context
  .middleware(async ({ context, next }) => {
    // Execute logic before the handler
    const session = await serverAuth.api.getSession({
      headers: context.event.headers,
    })

    if (!session?.user) {
      throw new ORPCError('UNAUTHORIZED', {
        message: 'You must be logged in to access this resource',
      })
    }

    const result = await next({
      context: {
        user: session.user,
        transactionId: context.transactionId,
        event: context.event,
      },
    })

    // Execute logic after the handler

    return result
  })

export default authMiddleware
