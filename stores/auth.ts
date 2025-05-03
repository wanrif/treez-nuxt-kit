import { defineStore } from 'pinia'
import { parse, stringify } from 'zipson'

import type {
  ApiError,
  ChangePasswordCredentials,
  IUser,
  LoginCredentials,
  RegisterCredentials,
  UpdateProfileCredentials,
} from '~/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as IUser | null,
    error: null as string | null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async login(credentials: LoginCredentials) {
      this.error = null
      this.loading = true
      try {
        const { signIn } = useAuth()
        const { data, error } = await signIn.email({
          email: credentials.email,
          password: credentials.password,
        })
        if (error) throw new Error(error?.message, { cause: error })
        if (!data?.token) throw new Error('No token received')
        // await this.fetchProfile()
      } catch (error: unknown) {
        const err = error as ApiError
        this.error = err.message
        this.user = null
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
    async logout() {
      const { $trpc } = useNuxtApp()
      try {
        await $trpc.auth.logout.mutate()
        this.user = null
        navigateTo('/login')
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
    // async fetchProfile() {
    //   const { $trpc } = useNuxtApp()
    //   this.error = null
    //   try {
    //     const response = await $trpc.user.profile.query()
    //     if (!response.data?.user) throw new Error('No user received')
    //     this.user = response.data.user as IUser
    //   } catch (error: unknown) {
    //     const err = error as ApiError
    //     this.error = err.message
    //   }
    // },
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
    async updateProfile(profile: UpdateProfileCredentials) {
      const { $trpc } = useNuxtApp()
      this.error = null
      try {
        profile.id = this.user?.id
        // const response = await $trpc.user.update.mutate(profile)
        // if (!response.data?.user) {
        //   throw new Error('No user data in response')
        // }
        // this.user = response.data.user as IUser
        // return response
      } catch (error: unknown) {
        const err = error as ApiError
        this.error = err.message
        throw err
      }
    },
  },

  persist: {
    pick: ['user', 'token'],
    serializer: {
      deserialize: parse,
      serialize: stringify,
    },
  },
})
