import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, twoFactor } from 'better-auth/plugins'

import { hash, verify } from '@node-rs/argon2'
import { render } from '@vue-email/render'

import { AUTH_OTP_LENGTH, AUTH_OTP_PERIOD } from '~/constant'
import { accountTable, sessionsTable, twoFactorTable, usersTable, verificationTable } from '~/database/schema'
import { EmailVerificationTemplate, ResetPasswordTemplate } from '~/server/email'
import { useDrizzle } from '~/server/utils/drizzle'
import sendEmail from '~/server/utils/email'
import { useRedis } from '~/server/utils/redis'

const db = useDrizzle()
const redis = useRedis()
const runtimeConfig = useRuntimeConfig()

export const hashPassword = async (password: string) => {
  const hashedPassword = await hash(password, {
    algorithm: 2, // Argon2id
    memoryCost: 19456, // 19 MiB
    timeCost: 2,
    parallelism: 1,
    outputLen: 32,
  })
  return hashedPassword
}

export const verifyPassword = async (password: string, hashedPassword: string) => {
  const isValid = await verify(hashedPassword, password, {
    algorithm: 2, // Argon2id
    memoryCost: 19456, // 19 MiB
    timeCost: 2,
    parallelism: 1,
    outputLen: 32,
  })
  return isValid
}

export const serverAuth = betterAuth({
  account: {
    fields: {
      password: 'password',
      accountId: 'account_id',
      providerId: 'provider_id',
      userId: 'user_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  advanced: {
    cookiePrefix: 'treez-nuxtify',
  },
  appName: 'Treez Nuxtify',
  database: drizzleAdapter(db, {
    provider: 'mysql', // or "pg", "sqlite"
    schema: {
      accounts: accountTable,
      sessions: sessionsTable,
      users: usersTable,
      verifications: verificationTable,
      twoFactors: twoFactorTable,
    },
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 3600, // 1 hour
    password: {
      hash(password) {
        return hashPassword(password)
      },
      verify(data) {
        return verifyPassword(data.password, data.hash)
      },
    },
    sendResetPassword: async ({ user, token }, _request) => {
      const { baseUrl } = runtimeConfig.public
      const html = await render(
        ResetPasswordTemplate,
        {
          title: 'Reset Your Password',
          url: `${baseUrl}/reset-password?token=${token}`,
        },
        {
          pretty: true,
        }
      )
      await sendEmail({
        to: user.email,
        subject: 'Reset Your Password',
        html,
      })
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, token }, _request) => {
      const { baseUrl } = runtimeConfig.public
      const html = await render(
        EmailVerificationTemplate,
        {
          title: 'Verify Your Email Address',
          url: `${baseUrl}/verify-email?token=${token}`,
        },
        {
          pretty: true,
        }
      )
      await sendEmail({
        to: user.email,
        subject: 'Verify your email address',
        html,
      })
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // 1 hour
  },
  logger: {
    log(level, message, ...args) {
      logger[level](`Better Auth | ${message}`, { cause: { error: { ...args } } })
    },
  },
  plugins: [
    admin({
      defaultRole: 'user',
      adminRoles: ['admin', 'superadmin'],
    }),
    twoFactor({
      totpOptions: {
        digits: AUTH_OTP_LENGTH,
        period: AUTH_OTP_PERIOD,
      },
      schema: {
        twoFactor: {
          fields: {
            userId: 'user_id',
            secret: 'secret',
            backupCodes: 'backupCodes',
          },
        },
      },
    }),
  ],
  rateLimit: {
    window: 60, // time window in seconds
    max: 100, // max requests in the window
  },
  secondaryStorage: {
    get: async (key) => {
      const value = await redis.get(key)
      return value ? value : null
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(key, value, 'EX', ttl)
      else await redis.set(key, value)
    },
    delete: async (key) => {
      await redis.del(key)
    },
  },
  session: {
    fields: {
      id: 'id',
      token: 'token',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      userId: 'user_id',
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
    freshAge: 60 * 5, // 5 minutes (the session is fresh if created within the last 5 minutes)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes (Cache duration in seconds)
    },
  },
  trustedOrigins: [],
  user: {
    fields: {
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    additionalFields: {
      phone: { type: 'string', fieldName: 'phone', returned: true, input: true, required: false },
      location: { type: 'string', fieldName: 'location', returned: true, input: true, required: false },
      website: { type: 'string', fieldName: 'website', returned: true, input: true, required: false },
      bio: { type: 'string', fieldName: 'bio', returned: true, input: true, required: false },
    },
    changeEmail: {
      enabled: true,
    },
  },
  verification: {
    fields: {
      id: 'id',
      userId: 'user_id',
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      identifier: 'identifier',
      value: 'value',
    },
  },
})
