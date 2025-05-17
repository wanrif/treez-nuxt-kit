import { z } from 'zod'

import { accountTable } from '~/database/schema'
import { hashPassword, verifyPassword } from '~/server/utils/auth'
import { useDrizzle } from '~/server/utils/drizzle'

import { createTRPCRouter, protectedProcedure } from '../init'

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
  changePassword: protectedProcedure.input(changePasswordSchema).mutation(async ({ input, ctx }) => {
    try {
      const [account] = await useDrizzle()
        .select()
        .from(accountTable)
        .where(eq(accountTable.user_id, ctx.user.id))
        .limit(1)

      if (!account) {
        throw new AuthError('Failed to change password')
      }

      const isValidPassword = await verifyPassword(account.password, input.oldPassword)
      if (!isValidPassword) {
        throw new ValidationError('Invalid current password', {
          currentPassword: ['Current password is incorrect'],
        })
      }

      const newHashedPassword = await hashPassword(input.newPassword)
      await useDrizzle()
        .update(accountTable)
        .set({ password: newHashedPassword })
        .where(eq(accountTable.user_id, ctx.user.id))

      return createSuccessResponse('Password changed successfully', undefined, 200, ctx.transactionId)
    } catch (error) {
      throw handleError(error, { transactionId: ctx.transactionId })
    }
  }),
  viewBackupCodes: protectedProcedure.query(async ({ ctx }) => {
    try {
      const [account] = await useDrizzle()
        .select()
        .from(accountTable)
        .where(eq(accountTable.user_id, ctx.user.id))
        .limit(1)

      if (!account) {
        throw new AuthError('Failed to retrieve backup codes')
      }

      const backupCodes = await auth.api.viewBackupCodes({
        body: {
          userId: ctx.user.id,
        },
      })

      return createSuccessResponse('Backup codes retrieved successfully', backupCodes, 200, ctx.transactionId)
    } catch (error) {
      throw handleError(error, { transactionId: ctx.transactionId })
    }
  }),
})

// export type definition of API
export type AuthRouter = typeof authRouter
