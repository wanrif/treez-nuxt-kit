<script lang="ts" setup>
definePageMeta({
  layout: 'auth',
  auth: false,
})

const { client } = useAuth()
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const token = route.query.token as string
const verificationStatus = ref<'loading' | 'success' | 'error'>('loading')
const errorTitle = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

const handleVerifyEmail = async (): Promise<void> => {
  verificationStatus.value = 'loading'
  if (!token) {
    errorTitle.value = t('verify_email_error_title')
    errorMessage.value = t('verify_email_invalid_token')
    verificationStatus.value = 'error'
    return
  }
  await client.verifyEmail({
    query: {
      token,
    },
    fetchOptions: {
      onSuccess: () => {
        verificationStatus.value = 'success'
      },
      onError(context) {
        if (context.error?.code === 'INVALID_TOKEN') {
          errorTitle.value = t('verify_email_error_title')
          errorMessage.value = t('verify_email_error_message')
        } else if (context.error.status === 403 && context.error?.code === 'BANNED_USER') {
          errorTitle.value = t('verify_email_banned_user_title')
          errorMessage.value = t('verify_email_banned_user_message')
        } else {
          errorTitle.value = t('verify_email_error_title')
          errorMessage.value = context.error.message || t('verify_email_error_message')
        }
        verificationStatus.value = 'error'
      },
    },
  })
}

onMounted(async () => {
  await handleVerifyEmail()
})
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
      <div class="mb-6 text-center">
        <NuxtLink :to="localePath('/')" class="inline-block">
          <Icon class="!size-16 text-primary-600 dark:text-primary-400" name="tabler:mail-check" />
        </NuxtLink>
      </div>

      <template v-if="verificationStatus === 'loading'">
        <div class="text-center">
          <LoadingSpinner class="mx-auto !size-12 text-primary-500" />
          <h1 class="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-200">
            {{ t('verify_email_loading') }}
          </h1>
        </div>
      </template>

      <template v-else-if="verificationStatus === 'success'">
        <div class="text-center">
          <Icon name="tabler:circle-check-filled" class="mx-auto !size-16 text-green-500" />
          <h1 class="mt-4 text-2xl font-bold text-gray-800 dark:text-white">
            {{ t('verify_email_success_title') }}
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-300">
            {{ t('verify_email_success_message') }}
          </p>
          <UButton color="primary" class="mt-6 flex w-full items-center justify-center" :to="localePath('/dashboard')">
            {{ t('go_to_dashboard') }}
          </UButton>
        </div>
      </template>

      <template v-else-if="verificationStatus === 'error'">
        <div class="text-center">
          <Icon name="tabler:alert-triangle-filled" class="mx-auto !size-16 text-red-500" />
          <h1 class="mt-4 text-2xl font-bold text-gray-800 dark:text-white">
            {{ errorTitle || t('verify_email_error_title') }}
          </h1>
          <p class="mt-2 text-red-500 dark:text-red-400">
            {{ errorMessage || t('verify_email_error_message') }}
          </p>
          <UButton color="primary" variant="outline" class="mt-6 w-full" :to="localePath('/')">
            {{ t('return_home') }}
          </UButton>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Add any page-specific styles here */
</style>
