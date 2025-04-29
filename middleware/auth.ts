export default defineNuxtRouteMiddleware(async (to, _from) => {
  if (import.meta.server) return

  const { $authClient } = useNuxtApp()
  const { data: session, isPending } = await $authClient.useSession(useCsrfFetch)

  if (isPending || !session.value) {
    if (to.path === '/dashboard') {
      return navigateTo('/login')
    }
  }
})
