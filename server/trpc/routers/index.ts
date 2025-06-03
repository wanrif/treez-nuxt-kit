import { TRPCRouter } from '../init'
import { authRouter } from './auth'

export const appRouter = TRPCRouter({
  auth: authRouter,
})

export type AppRouter = typeof appRouter
