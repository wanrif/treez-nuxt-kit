export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const { $authClient } = useNuxtApp()

  const { data: session, isPending } = await $authClient.useSession(useCsrfFetch)
  if (isPending || !session.value) {
    return navigateTo('/redirect')
  }
})
