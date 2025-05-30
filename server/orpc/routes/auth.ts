import { eq } from 'drizzle-orm'
import { z } from 'zod/v4'

import { accountTable } from '~/database/schema'

import { authProcedure } from '../procedure'

const changePasswordSchema = z
  .strictObject({
    oldPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.confirmNewPassword === data.newPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })

const changePassword = authProcedure.input(changePasswordSchema).handler(async ({ input, context }) => {
  try {
    const [account] = await useDrizzle()
      .select()
      .from(accountTable)
      .where(eq(accountTable.user_id, context.user.id))
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
      .where(eq(accountTable.user_id, context.user.id))

    return createSuccessResponse('Password changed successfully', undefined, 200, context.transactionId)
  } catch (error) {
    throw handleError(error, { transactionId: context.transactionId })
  }
})

const viewBackupCodes = authProcedure.handler(async ({ context }) => {
  try {
    const [account] = await useDrizzle()
      .select()
      .from(accountTable)
      .where(eq(accountTable.user_id, context.user.id))
      .limit(1)

    if (!account) {
      throw new AuthError('Failed to retrieve backup codes')
    }

    const backupCodes = await serverAuth.api.viewBackupCodes({
      body: {
        userId: context.user.id,
      },
    })

    return createSuccessResponse('Backup codes retrieved successfully', backupCodes, 200, context.transactionId)
  } catch (error) {
    throw handleError(error, { transactionId: context.transactionId })
  }
})

const authRouter = authProcedure.router({
  changePassword,
  viewBackupCodes,
})

export default authRouter
