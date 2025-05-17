import { accountTable } from './account'
import { sessionsTable } from './session'
import { twoFactorTable } from './twoFactor'
import { usersTable } from './user'
import { verificationTable } from './verification'

export * from './account'
export * from './user'
export * from './session'
export * from './verification'
export * from './twoFactor'

export default {
  accountTable,
  sessionsTable,
  usersTable,
  verificationTable,
  twoFactorTable,
}
