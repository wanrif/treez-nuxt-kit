export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const { $authClient } = useNuxtApp()
  const session = $authClient.useSession()

  if (session?.value.data) {
    return navigateTo('/dashboard')
  }
})
