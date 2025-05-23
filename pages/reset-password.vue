<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  auth: {
    only: 'guest',
  },
})

useHead({
  title: 'Reset Password',
  meta: [
    {
      name: 'description',
      content: 'Reset your password',
    },
  ],
})

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const token = route.query.token as string
const { fields, errors, isSubmitting, meta, error, success, submit } = useResetPasswordForm(token)
const isMounted = useMounted()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="flex w-full max-w-md flex-col gap-8">
      <div class="text-center">
        <NuxtLink :to="localePath('/')" class="inline-block">
          <Icon class="!size-20 text-primary-600 dark:text-primary-400" name="tabler:topology-star-ring-3" />
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ t('reset_password_title') }}
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">
          {{ t('reset_password_description') }}
        </p>
      </div>

      <template v-if="!success">
        <form v-if="isMounted" class="flex flex-col gap-6" @submit.prevent="submit">
          <div class="flex flex-col gap-4">
            <UFormField v-slot="{ error: fieldError }" :label="t('new_password')" :error="errors.password">
              <UInput
                v-model="fields.password.value.value"
                type="password"
                :placeholder="t('enter_new_password')"
                autocomplete="new-password"
                :trailing-icon="fieldError ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
                class="w-full"
              />
            </UFormField>

            <UFormField v-slot="{ error: fieldError }" :label="t('confirm_password')" :error="errors.confirmPassword">
              <UInput
                v-model="fields.confirmPassword.value.value"
                type="password"
                :placeholder="t('confirm_new_password')"
                autocomplete="new-password"
                :trailing-icon="fieldError ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
                class="w-full"
              />
            </UFormField>
          </div>

          <div v-if="error" class="text-center text-sm text-red-500">{{ error }}</div>

          <UButton type="submit" color="primary" block :loading="isSubmitting" :disabled="isSubmitting || !meta.valid">
            {{ t('reset_password') }}
          </UButton>
        </form>

        <template v-else>
          <div class="flex flex-col gap-6">
            <template v-for="i in 2" :key="i">
              <InputFieldSkeleton />
            </template>

            <USkeleton class="h-8 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </template>
      </template>

      <div v-else class="mt-8 text-center">
        <div class="mb-4 text-green-500">
          <UIcon name="i-heroicons-check-circle" class="mx-auto !size-20" />
        </div>
        <h2 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('password_reset_success') }}
        </h2>
        <p class="mb-6 text-gray-600 dark:text-gray-300">
          {{ t('redirecting_to_login') }}
        </p>
      </div>
    </div>
  </div>
</template>
