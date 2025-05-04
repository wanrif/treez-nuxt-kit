import { defineStore } from 'pinia'
import { parse, stringify } from 'zipson'

import type { ApiError, ChangePasswordCredentials, LoginCredentials, RegisterCredentials } from '~/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    error: null as string | null,
    loading: false,
  }),

  getters: {},

  actions: {
    async login(credentials: LoginCredentials) {
      this.error = null
      this.loading = true
      try {
        const { signIn } = useAuth()
        const { error } = await signIn.email({
          email: credentials.email,
          password: credentials.password,
        })
        if (error) throw new Error(error?.message, { cause: error })
      } catch (error: unknown) {
        const err = error as ApiError
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },
    async register(credentials: RegisterCredentials) {
      this.error = null
      try {
        const { signUp } = useAuth()
        const { error } = await signUp.email({
          name: credentials.name,
          email: credentials.email,
          password: credentials.password,
        })

        if (error) throw new Error(error?.message, { cause: error })
      } catch (error: unknown) {
        const err = error as ApiError
        this.error = err.message
        throw err
      }
    },
    async forgotPassword(email: string) {
      this.error = null
      try {
        const { client } = useAuth()
        await client.forgetPassword({
          email,
          redirectTo: '/reset-password',
        })
      } catch (error: unknown) {
        console.error('Error sending reset password email:', error)
        const err = error as ApiError
        this.error = err.message
        throw err
      }
    },
    async resetPassword(token: string, newPassword: string) {
      this.error = null
      try {
        const { client } = useAuth()
        const { error } = await client.resetPassword({
          newPassword,
          token,
        })

        if (error) throw new Error(error?.message, { cause: error })
      } catch (error: unknown) {
        const err = error as ApiError
        this.error = err.message
        throw err
      }
    },
    async changePassword(credentials: ChangePasswordCredentials) {
      const { $trpc } = useNuxtApp()
      this.error = null
      try {
        const response = await $trpc.auth.changePassword.mutate(credentials)
        return response
      } catch (error: unknown) {
        const err = error as ApiError
        this.error = err.message
        throw err
      }
    },
  },

  persist: {
    pick: [],
    serializer: {
      deserialize: parse,
      serialize: stringify,
    },
  },
})
