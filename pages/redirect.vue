<script lang="ts" setup>
definePageMeta({
  layout: false,
})

const { $authClient } = useNuxtApp()
const localePath = useLocalePath()

onMounted(async () => {
  const { data: session, isPending } = await $authClient.useSession(useCsrfFetch)

  watchEffect(() => {
    if (!isPending) {
      if (session.value) {
        navigateTo(localePath('/dashboard'), { replace: true })
      } else {
        navigateTo(localePath('/login'), { replace: true })
      }
    }
  })
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="text-center">
      <Icon
        name="tabler:topology-star-ring-3"
        class="mx-auto !size-16 animate-pulse text-primary-500 dark:text-primary-400"
      />
      <p class="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Please wait...</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">We're redirecting you.</p>
    </div>
  </div>
</template>

<style scoped></style>
