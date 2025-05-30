import type { H3Event } from 'h3'

import { os } from '@orpc/server'

import authMiddleware from './middleware/auth'

const base = os.$context<{ event: H3Event; transactionId: string }>().use(({ context, next }) => {
  console.log('Base middleware executed', context.event.headers)
  return next()
})

export const authProcedure = base.use(authMiddleware)
export const publicProcedure = base
