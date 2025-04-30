import { nanoid } from 'nanoid'
import { z } from 'zod'

import { hash, verify } from '@node-rs/argon2'

import {
  COOK_ACCESS_TOKEN,
  COOK_REFRESH_TOKEN,
  INVALID_REFRESH_TOKEN,
  INVALID_USER_REFRESH_TOKEN,
} from '~/constant/jwt'
import { rolesTable, usersTable } from '~/database/schema'
import { useDrizzle } from '~/server/utils/drizzle'
import {
  ACCESS_TOKEN_EXPIRATION_SEC,
  REFRESH_TOKEN_EXPIRATION_SEC,
  generateJWT,
  generateRefreshJWT,
} from '~/server/utils/jwt'

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../init'

interface IToken {
  token: {
    accessToken: string
    refreshToken: string
  }
}

const loginSchema = z
  .object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .strict()

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .strict()
  .refine((data) => data.confirmPassword === data.password, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const forgotPasswordSchema = z
  .object({
    email: z.string().email('Invalid email format'),
  })
  .strict()

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .strict()

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmNewPassword: z.string(),
  })
  .strict()
  .refine((data) => data.confirmNewPassword === data.newPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })

export const authRouter = createTRPCRouter({
  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    try {
      const user = await useDrizzle()
        .select({
          id: usersTable.id,
          email: usersTable.email,
          role: {
            id: rolesTable.id,
            name: rolesTable.name,
          },
        })
        .from(usersTable)
        .innerJoin(rolesTable, eq(usersTable.role_id, rolesTable.id))
        .where(eq(usersTable.email, input.email))
        .limit(1)
        .prepare()
        .execute()
        .then((rows) => rows[0])

      if (!user) throw new BusinessError('Invalid email or password')

      const isValidPassword = await verify(user.password, input.password)
      if (!isValidPassword) throw new BusinessError('Invalid email or password')

      const deviceInfo = getDeviceInfo(ctx.event)
      const accessToken = await generateJWT({
        id: user.id,
        email: user.email,
        role: user.role.name,
      })
      const refreshToken = await generateRefreshJWT({
        id: user.id,
        email: user.email,
        role: user.role.name,
      })

      await storeRefreshToken(user.id, refreshToken, getRefreshTokenExpiration(), deviceInfo)

      // Set HTTP-only cookies
      setCookie(ctx.event, COOK_ACCESS_TOKEN, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ACCESS_TOKEN_EXPIRATION_SEC,
      })

      setCookie(ctx.event, COOK_REFRESH_TOKEN, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: REFRESH_TOKEN_EXPIRATION_SEC,
      })

      return createSuccessResponse<IToken>(
        'Login successful',
        {
          token: { accessToken, refreshToken },
        },
        200,
        ctx.transactionId
      )
    } catch (error) {
      throw handleError(error, { transactionId: ctx.transactionId })
    }
  }),

  register: publicProcedure.input(registerSchema).mutation(async ({ input, ctx }) => {
    try {
      const prepareExisting = useDrizzle()
        .select({
          email: usersTable.email,
        })
        .from(usersTable)
        .where(eq(usersTable.email, input.email))
        .limit(1)
        .prepare()

      const [existingUser] = await prepareExisting.execute()

      if (existingUser) {
        throw new ValidationError('Registration failed, email already registered', {
          email: ['Email already registered'],
        })
      }

      const hashPassword = await hash(input.password)
      const findUserRole = await useDrizzle().select().from(rolesTable).where(eq(rolesTable.name, 'user')).limit(1)

      const user = {
        name: input.name,
        email: input.email,
        password: hashPassword,
        role_id: findUserRole[0].id,
      }

      await useDrizzle().insert(usersTable).values(user)

      return createSuccessResponse('Registration successful', undefined, 201, ctx.transactionId)
    } catch (error) {
      throw handleError(error, { transactionId: ctx.transactionId })
    }
  }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    try {
      const refresh_token = getCookie(ctx.event, COOK_REFRESH_TOKEN) || ''
      await deleteRefreshToken(refresh_token)

      deleteCookie(ctx.event, COOK_ACCESS_TOKEN)
      deleteCookie(ctx.event, COOK_REFRESH_TOKEN)

      return createSuccessResponse('Logout successful', undefined, 200, ctx.transactionId)
    } catch (error) {
      throw handleError(error, { transactionId: ctx.transactionId })
    }
  }),

  forgotPassword: publicProcedure.input(forgotPasswordSchema).mutation(async ({ ctx }) => {
    try {
      const mockToken = nanoid()
      return createSuccessResponse(
        'Password reset link has been sent to your email',
        { token: mockToken },
        200,
        ctx.transactionId
      )
    } catch (error) {
      throw handleError(error, { transactionId: ctx.transactionId })
    }
  }),

  resetPassword: publicProcedure.input(resetPasswordSchema).mutation(async ({ input, ctx }) => {
    try {
      const hashedPassword = await hash(input.password)
      await useDrizzle().update(usersTable).set({ password: hashedPassword }).where(eq(usersTable.id, input.token))

      return createSuccessResponse('Password has been reset successfully', undefined, 200, ctx.transactionId)
    } catch (error) {
      throw handleError(error, { transactionId: ctx.transactionId })
    }
  }),

  refreshToken: publicProcedure.mutation(async ({ ctx }) => {
    try {
      const refresh_token = getCookie(ctx.event, COOK_REFRESH_TOKEN) || ''
      const decoded = await verifyRefreshJWT(refresh_token)

      const storedToken = await findRefreshToken(refresh_token)
      if (!storedToken) {
        throw new AuthError(INVALID_REFRESH_TOKEN)
      }

      // Update last used time
      await updateTokenLastUsed(refresh_token)

      // Delete old refresh token
      await deleteRefreshToken(refresh_token)

      const prepared = useDrizzle()
        .select({
          id: usersTable.id,
          email: usersTable.email,
          role: {
            id: rolesTable.id,
            name: rolesTable.name,
          },
        })
        .from(usersTable)
        .innerJoin(rolesTable, eq(usersTable.role_id, rolesTable.id))
        .where(eq(usersTable.id, decoded.id))
        .limit(1)
        .prepare()

      const [user] = await prepared.execute()

      if (!user) {
        throw new AuthError(INVALID_USER_REFRESH_TOKEN)
      }

      const accessToken = await generateJWT({
        id: user.id,
        email: user.email,
        role: user.role.name,
      })
      const refreshToken = await generateRefreshJWT({
        id: user.id,
        email: user.email,
        role: user.role.name,
      })

      await storeRefreshToken(user.id, refreshToken, getRefreshTokenExpiration(), storedToken.device_info)

      setCookie(ctx.event, COOK_ACCESS_TOKEN, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ACCESS_TOKEN_EXPIRATION_SEC,
      })

      setCookie(ctx.event, COOK_REFRESH_TOKEN, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: REFRESH_TOKEN_EXPIRATION_SEC,
      })

      return createSuccessResponse<IToken>(
        'Token refreshed successfully',
        {
          token: { accessToken, refreshToken },
        },
        200,
        ctx.transactionId
      )
    } catch (error) {
      deleteCookie(ctx.event, COOK_ACCESS_TOKEN)
      deleteCookie(ctx.event, COOK_REFRESH_TOKEN)
      if (error instanceof AuthError) throw error
      throw new AuthError(INVALID_REFRESH_TOKEN)
    }
  }),

  cleanupTokens: protectedProcedure
    .input(
      z.object({
        unusedDays: z.number().min(1).default(30),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await cleanupUnusedTokens(ctx.user.id, input.unusedDays)
      return createSuccessResponse('Unused tokens cleaned up successfully', undefined, 200, ctx.transactionId)
    }),

  changePassword: protectedProcedure.input(changePasswordSchema).mutation(async ({ input, ctx }) => {
    try {
      const [user] = await useDrizzle().select().from(usersTable).where(eq(usersTable.id, ctx.user.id)).limit(1)

      if (!user) {
        throw new AuthError('User not found')
      }

      const isValidPassword = await verify(user.password, input.oldPassword)
      if (!isValidPassword) {
        throw new AuthError('Current password is incorrect')
      }

      const newHashedPassword = await hash(input.newPassword)
      await useDrizzle().update(usersTable).set({ password: newHashedPassword }).where(eq(usersTable.id, ctx.user.id))

      return createSuccessResponse('Password changed successfully', undefined, 200, ctx.transactionId)
    } catch (error) {
      throw handleError(error, { transactionId: ctx.transactionId })
    }
  }),

  activeSessions: protectedProcedure.query(async ({ ctx }) => {
    const sessions = await getUserActiveTokens(ctx.user.id)
    return createSuccessResponse(
      'Active sessions retrieved',
      {
        sessions: sessions.map((s) => s.device_info),
      },
      200,
      ctx.transactionId
    )
  }),

  logoutAll: protectedProcedure.mutation(async ({ ctx }) => {
    await deactivateUserTokens(ctx.user.id)
    return createSuccessResponse('Logged out from all devices', undefined, 200, ctx.transactionId)
  }),
})

// export type definition of API
export type AuthRouter = typeof authRouter
