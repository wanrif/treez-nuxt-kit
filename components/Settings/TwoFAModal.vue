<script lang="ts" setup>
import { useField, useForm } from 'vee-validate'
import * as zod from 'zod'

import { toTypedSchema } from '@vee-validate/zod'

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  action: {
    type: String as () => 'enable' | 'disable',
    required: true,
  },
})

type EnableTwoFAForm = {
  password: string
}

const emit = defineEmits(['update:open', 'enabled', 'disabled'])

const { t } = useI18n()
const { client } = useAuth()
const toast = useToast()

const internalOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const resetPasswordSchema = toTypedSchema(
  zod
    .object({
      password: zod
        .string()
        .min(8, t('validation_password_min'))
        .regex(/[A-Z]/, t('validation_password_uppercase'))
        .regex(/[a-z]/, t('validation_password_lowercase'))
        .regex(/[0-9]/, t('validation_password_number')),
    })
    .strict()
)

const { handleSubmit, errors, meta, isSubmitting, resetForm } = useForm<EnableTwoFAForm>({
  validationSchema: resetPasswordSchema,
})

const fields = {
  password: useField<string>('password'),
} as const

const onSubmit = handleSubmit(async (values) => {
  if (props.action === 'enable') {
    const { data, error } = await client.twoFactor.enable({
      password: values.password,
    })
    if (data) {
      emit('enabled', { totpURI: data?.totpURI, backupCodes: data?.backupCodes })
      toast.add({
        title: t('two_fa_enable_initiated'),
        color: 'success',
      })
    }
    if (error) {
      toast.add({
        title: t('two_fa_error'),
        color: 'error',
      })
    }
  } else {
    const { data, error } = await client.twoFactor.disable({
      password: values.password,
    })
    if (data) {
      emit('disabled')
      toast.add({
        title: t('two_fa_disabled_success'),
        color: 'success',
      })
    }
    if (error) {
      toast.add({
        title: t('two_fa_error'),
        color: 'error',
      })
    }
  }
  resetForm()
  emit('update:open', false)
})
</script>

<template>
  <UModal
    v-model:open="internalOpen"
    :dismissible="false"
    :title="t('two_factor_title')"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <p class="text-treez-600 dark:text-treez-300">
          {{ t(action === 'enable' ? 'enable_2fa_confirm' : 'disable_2fa_confirm') }}
        </p>
        <UFormField v-slot="{ error: fieldError }" :error="errors.password">
          <UInput
            v-model="fields.password.value.value"
            type="password"
            autocomplete="current-password"
            :placeholder="t('password_placeholder')"
            :trailing-icon="fieldError ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
            class="w-full"
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <UButton color="neutral" variant="outline" class="rounded-lg px-4 py-2" @click="emit('update:open', false)">
        {{ t('cancel') }}
      </UButton>
      <UButton
        :loading="isSubmitting"
        :disabled="isSubmitting || !meta.valid"
        :color="action === 'enable' ? 'primary' : 'error'"
        variant="subtle"
        class="flex items-center gap-x-2 rounded-lg px-4 py-2"
        @click.prevent="
          () => {
            onSubmit()
          }
        "
      >
        <span>{{ t(action === 'enable' ? 'enable' : 'disable') }}</span>
      </UButton>
    </template>
  </UModal>
</template>

<style></style>
