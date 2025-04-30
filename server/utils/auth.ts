import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { render } from '@vue-email/render'

import ResetPasswordTemplate from '~/server/email/resetPasswordTemplate.vue'
import { useDrizzle } from '~/server/utils/drizzle'

import { accountTable, sessionsTable, usersTable, verificationTable } from '../database/schema'
import { sendEmail } from './email'

const db = useDrizzle()
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'mysql', // or "pg", "sqlite"
    schema: {
      accounts: accountTable,
      sessions: sessionsTable,
      users: usersTable,
      verifications: verificationTable,
    },
    usePlural: true,
  }),
  advanced: {
    cookiePrefix: 'treeznuxtkit',
  },
  rateLimit: {
    window: 60, // time window in seconds
    max: 100, // max requests in the window
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url, token }, _request) => {
      const html = await render(
        ResetPasswordTemplate,
        {
          title: 'Reset Your Password',
          url: `${url}?token=${token}`,
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
  trustedOrigins: [],
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
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
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
