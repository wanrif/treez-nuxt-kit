import type { H3Event } from 'h3'
import { LRUCache } from 'lru-cache'
import superjson from 'superjson'
import { ZodError } from 'zod'

import { TRPCError, initTRPC } from '@trpc/server'

import { serverAuth } from '~/server/utils/auth'
import { generateTransactionId } from '~/utils/commonHelper.ts'

/**
 * @see: https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (event: H3Event) => ({
  event,
  transactionId: generateTransactionId(),
})

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<TRPCContext>().create({
  errorFormatter: ({ shape, error, ctx }) => {
    if (error.cause instanceof ZodError) {
      logger.warn('Validation error:', {
        message: error.message,
        code: error.code,
        zodErrors: error.cause.flatten(),
        statusCode: shape.data.httpStatus,
        transactionId: ctx?.transactionId,
      })
    }

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.code === 'BAD_REQUEST' && error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
      transactionId: ctx?.transactionId,
    }
  },
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
})

// Base router and procedure helpers
export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory
export const publicProcedure = t.procedure
export const middleware = t.middleware

const rateLimiter = new LRUCache<string, number>({
  max: 10000, // 10k items
  ttl: 60 * 1000, // 1 minute
})

// Middleware
const createAuthMiddleware = (requiredRole?: string) =>
  middleware(async ({ ctx, next }) => {
    const session = await serverAuth.api.getSession({
      headers: ctx.event.headers,
    })
    const user = session?.user
    if (!user || !user.role) throw new AuthError('You must be logged in to access this resource')

    if (requiredRole) {
      const hasRole = user.role === requiredRole
      if (!hasRole) {
        throw new ForbiddenError('You do not have permission to access this resource')
      }
    }

    return next({ ctx: { ...ctx, user } })
  })

const rateLimit = middleware(async ({ ctx, next }) => {
  const ip = ctx.event.node.req.socket.remoteAddress || ''
  const current = rateLimiter.get(ip) || 0

  if (current > 100) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded',
    })
  }

  rateLimiter.set(ip, current + 1)
  return next()
})

// Protected procedure
export const protectedProcedure = t.procedure.use(rateLimit).use(createAuthMiddleware())
export const adminProcedure = t.procedure.use(rateLimit).use(createAuthMiddleware('admin'))
