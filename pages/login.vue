<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  auth: {
    only: 'guest',
  },
})

useHead({
  title: 'Login',
  meta: [
    {
      name: 'description',
      content: 'Login to your account',
    },
  ],
})

const localePath = useLocalePath()
const { t } = useI18n()
const route = useRoute()
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

const handleLoginSuccess = async () => {
  const redirect = route.query.redirect as string
  await navigateTo(redirect || localePath('/dashboard'), { replace: true })
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <NuxtLink :to="localePath('/')" class="inline-block">
          <Icon class="!size-20 text-primary-600 dark:text-primary-400" name="tabler:topology-star-ring-3" />
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ t('login') }}</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">{{ t('login_welcome') }}</p>
      </div>

      <LoginForm v-if="mounted" @success="handleLoginSuccess" />

      <div v-else class="mt-8 space-y-6">
        <template v-for="i in 2" :key="i">
          <InputFieldSkeleton />
        </template>

        <USkeleton class="h-8" />

        <div class="flex items-center justify-center gap-2">
          <USkeleton class="h-4 w-28" />
          <USkeleton class="h-4 w-4 rounded-full" />
          <USkeleton class="h-4 w-24" />
        </div>
      </div>
    </div>
  </div>
</template>
