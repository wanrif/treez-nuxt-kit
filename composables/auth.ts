import { createAuthClient } from 'better-auth/client'
import { adminClient, inferAdditionalFields, twoFactorClient } from 'better-auth/client/plugins'
import { defu } from 'defu'
import type { RouteLocationRaw } from 'vue-router'

interface RuntimeAuthConfig {
  redirectUserTo: RouteLocationRaw | string
  redirectGuestTo: RouteLocationRaw | string
}

export function useAuth() {
  const toast = useToast()
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders() : undefined
  const { csrf } = useCsrf()
  const localePath = useLocalePath()

  const client = createAuthClient({
    baseURL: url.origin,
    fetchOptions: {
      headers: {
        ...headers,
        'x-csrf-token': csrf,
      },
      onError: async (context) => {
        const { response } = context
        if (response.status === 429) {
          const retryAfter = response.headers.get('X-Retry-After')
          // eslint-disable-next-line no-console
          console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`)
        }
      },
    },
    plugins: [
      inferAdditionalFields<typeof auth>(),
      adminClient(),
      twoFactorClient({
        onTwoFactorRedirect() {
          navigateTo(localePath('/two-factor'), { replace: true, external: true })
        },
      }),
    ],
  })

  type InferSession = typeof client.$Infer.Session.session
  type InferUser = typeof client.$Infer.Session.user

  const options = defu(useRuntimeConfig().public.auth as Partial<RuntimeAuthConfig>, {
    redirectUserTo: '/',
    redirectGuestTo: '/',
  })
  const session = useState<InferSession | null>('auth:session', () => null)
  const user = useState<InferUser | null>('auth:user', () => null)
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
    user.value = (data?.user as InferUser) || null
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

// Export the type derived from the client instance within the composable scope
// Note: This requires the `auth` type definition from the server to be available or inferred correctly.
// If `auth` isn't directly importable, you might need a different approach,
// potentially defining a base User type and using type assertion/casting where needed.
// Assuming `auth` type can be inferred or imported:
export type InferUserClient = ReturnType<typeof useAuth>['client']['$Infer']['Session']['user']
