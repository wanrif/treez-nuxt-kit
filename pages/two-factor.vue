<script lang="ts" setup>
definePageMeta({
  layout: 'auth',
  auth: {
    only: 'guest',
  },
})

useHead({
  title: 'Two-Factor Authentication',
  meta: [
    {
      name: 'description',
      content: 'Enter your two-factor authentication code to complete login.',
    },
  ],
})

const { t } = useI18n()
const localePath = useLocalePath()
const {
  fields,
  errors,
  isSubmitting,
  error,
  meta,
  submit,
  useRecoveryCode,
  useTotpCode,
  isUsingRecoveryCode,
  showTrustedDeviceModal,
  confirmTrustAndVerify,
  isVerifyingViaModal,
} = useTwoFactorForm()
const isMounted = useMounted()

const pinInputModel = computed({
  get: () => {
    const fieldValue = fields.code.value.value
    if (typeof fieldValue === 'string' && fieldValue.length > 0) {
      return fieldValue.split('')
    }
    return Array(6).fill('')
  },
  set: (newValue: string[]) => {
    fields.code.value.value = newValue.join('')
  },
})

const pageTitle = computed(() => (isUsingRecoveryCode.value ? t('two_factor_recovery_title') : t('two_factor_title')))
const pageDescription = computed(() =>
  isUsingRecoveryCode.value ? t('two_factor_recovery_description') : t('two_factor_description')
)
const switchButtonText = computed(() =>
  isUsingRecoveryCode.value ? t('use_authentication_code') : t('use_recovery_code')
)

const toggleCodeType = () => {
  if (isUsingRecoveryCode.value) {
    useTotpCode()
  } else {
    useRecoveryCode()
  }
}

const handleModalSubmit = async (trustDeviceChoice: boolean) => {
  await confirmTrustAndVerify(trustDeviceChoice)
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="flex w-full max-w-md flex-col gap-8">
      <div class="text-center">
        <NuxtLink :to="localePath('/')" class="inline-block">
          <Icon class="!size-20 text-primary-600 dark:text-primary-400" name="tabler:topology-star-ring-3" />
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ pageTitle }}
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">
          {{ pageDescription }}
        </p>
      </div>

      <div v-if="isMounted" class="flex flex-col gap-6">
        <UFormField v-if="!isUsingRecoveryCode" :error="errors.code" class="flex w-full items-center justify-center">
          <UPinInput v-model="pinInputModel" otp length="6" />
        </UFormField>
        <UFormField v-if="isUsingRecoveryCode" :error="errors.code" :label="t('two_factor_recovery_code_label')">
          <UInput
            v-model="fields.code.value.value"
            color="primary"
            type="text"
            :placeholder="t('two_factor_recovery_code_placeholder')"
            autocomplete="one-time-code"
            :trailing-icon="errors.code ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
            class="w-full"
            size="xl"
          />
        </UFormField>

        <div v-if="error" class="text-center text-sm text-red-500">{{ error }}</div>

        <UButton
          type="button"
          color="primary"
          block
          :loading="isSubmitting"
          :disabled="isSubmitting || !meta.valid || showTrustedDeviceModal"
          size="xl"
          @click="
            () => {
              submit()
            }
          "
        >
          {{ t('verify_code_button') }}
        </UButton>

        <div class="text-center text-sm">
          <button
            type="button"
            class="text-primary-600 hover:text-primary-500 dark:text-primary-400"
            @click="toggleCodeType"
          >
            {{ switchButtonText }}
          </button>
        </div>
        <LoginTrustedDeviceModal
          v-model:open="showTrustedDeviceModal"
          :loading="isVerifyingViaModal"
          @submit-trust="handleModalSubmit"
        />
      </div>

      <div v-else class="mt-8 flex flex-col gap-6">
        <InputFieldSkeleton />
        <USkeleton class="h-12 w-full" />
        <div class="flex justify-center">
          <USkeleton class="h-4 w-36" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
input[type='text'][pattern='[0-9]*'] {
  text-align: center;
  letter-spacing: 1rem;
}
</style>
