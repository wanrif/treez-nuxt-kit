export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const { $authClient } = useNuxtApp()
  const { data: session } = await $authClient.useSession(useCsrfFetch)

  if (session?.value) {
    return navigateTo('/dashboard')
  }
})
