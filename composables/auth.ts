import { createAuthClient } from 'better-auth/client'
import type { ClientOptions, InferSessionFromClient } from 'better-auth/client'
import { adminClient } from 'better-auth/client/plugins'
import { defu } from 'defu'
import type { RouteLocationRaw } from 'vue-router'

import type { AuthUser } from '~/types'

interface RuntimeAuthConfig {
  redirectUserTo: RouteLocationRaw | string
  redirectGuestTo: RouteLocationRaw | string
}

export function useAuth() {
  const toast = useToast()
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders() : undefined
  const { csrf } = useCsrf()

  const client = createAuthClient({
    baseURL: url.origin,
    fetchOptions: {
      headers: {
        ...headers,
        'x-csrf-token': csrf,
      },
    },
    plugins: [adminClient()],
  })

  const options = defu(useRuntimeConfig().public.auth as Partial<RuntimeAuthConfig>, {
    redirectUserTo: '/',
    redirectGuestTo: '/',
  })
  const session = useState<InferSessionFromClient<ClientOptions> | null>('auth:session', () => null)
  const user = useState<AuthUser | null>('auth:user', () => null)
  const sessionFetching = import.meta.server ? ref(false) : useState('auth:sessionFetching', () => false)

  const fetchSession = async () => {
    if (sessionFetching.value) {
      // eslint-disable-next-line no-console
      console.log('already fetching session')
      return
    }
    sessionFetching.value = true
    const { data } = await client.getSession({
      fetchOptions: {
        headers: {
          ...headers,
          'x-csrf-token': csrf,
        },
      },
    })
    session.value = data?.session || null
    user.value = (data?.user as unknown as AuthUser) || null
    sessionFetching.value = false
    return data
  }

  if (import.meta.client) {
    client.$store.listen('$sessionSignal', async (signal) => {
      if (!signal) return
      await fetchSession()
    })
  }

  return {
    session,
    user,
    loggedIn: computed(() => !!session.value),
    signIn: client.signIn,
    signUp: client.signUp,
    async signOut({ redirectTo }: { redirectTo?: RouteLocationRaw } = {}) {
      const { data: res, error } = await client.signOut()
      if (error) {
        toast.add({ title: 'Error signing out', description: error.message, color: 'error' })
        return null
      }
      session.value = null
      user.value = null
      if (redirectTo) {
        toast.add({ title: 'Signed out successfully' })
        await navigateTo(redirectTo)
      }
      return res
    },
    options,
    fetchSession,
    client,
  }
}
