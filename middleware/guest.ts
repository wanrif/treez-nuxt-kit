export default defineNuxtRouteMiddleware(async (to, _from) => {
  const { $authClient } = useNuxtApp()

  const { data: session } = await $authClient.useSession(useCsrfFetch)
  if (session.value) {
    if (to.path === '/login') {
      return navigateTo('/dashboard')
    }
  }
})
