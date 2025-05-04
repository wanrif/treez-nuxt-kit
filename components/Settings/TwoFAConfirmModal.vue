<script lang="ts" setup>
import { useField, useForm } from 'vee-validate'
import type { PropType } from 'vue'
import * as zod from 'zod'

import { toTypedSchema } from '@vee-validate/zod'
import { useQRCode } from '@vueuse/integrations/useQRCode'

type EnableTwoFAConfirm = {
  code: string
}

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  totpURI: {
    type: String,
    required: true,
  },
  backupCodes: {
    type: Array as PropType<string[]>,
    required: true,
  },
})

const { t } = useI18n()
const qrcode = useQRCode(() => props.totpURI || '')

const copied = ref(false)
const secretCopied = ref(false)

const emit = defineEmits(['update:open', 'verified'])

const internalOpen = computed({
  get: () => props.open,
  set: (value) => {
    if (!value) {
      // Reset form when modal is closed
      resetForm()
    }
    emit('update:open', value)
  },
})

function copyBackupCodes() {
  if (props.backupCodes && props.backupCodes.length > 0) {
    navigator.clipboard.writeText(props.backupCodes.join('\n'))
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

function copySecretKey() {
  if (props.totpURI) {
    navigator.clipboard.writeText(props.totpURI)
    secretCopied.value = true
    setTimeout(() => {
      secretCopied.value = false
    }, 2000)
  }
}

function downloadBackupCodes() {
  if (props.backupCodes && props.backupCodes.length > 0) {
    const textContent = props.backupCodes.join('\n')
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'backup-codes.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

const { client } = useAuth()
const toast = useToast()

const twoFactorConfirmSchema = toTypedSchema(
  zod
    .object({
      code: zod
        .string()
        .min(6, t('validation_two_factor_code_required'))
        .max(6, t('validation_two_factor_code_length'))
        .regex(/^\d{6}$/, t('validation_two_factor_code_numeric')),
    })
    .strict()
)

const { handleSubmit, errors, meta, isSubmitting, resetForm } = useForm<EnableTwoFAConfirm>({
  validationSchema: twoFactorConfirmSchema,
})

const fields = {
  code: useField<string>('code'),
} as const

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

const onSubmit = handleSubmit(async (values) => {
  const { data, error } = await client.twoFactor.verifyTotp({
    code: values.code,
  })
  if (data) {
    emit('verified')
    toast.add({ title: t('two_fa_enabled_success'), color: 'success' })
    emit('update:open', false)
  }
  if (error) {
    toast.add({
      title: t('two_fa_error'),
      description: error.message,
      color: 'error',
    })
  }
  resetForm()
})
</script>

<template>
  <UModal
    v-model:open="internalOpen"
    :title="t('two_factor_title')"
    :ui="{ footer: 'justify-end', content: 'max-w-2xl' }"
  >
    <template #body>
      <div class="space-y-6 p-4">
        <div>
          <p class="mb-2 text-sm text-brand-700 dark:text-brand-300">
            {{ t('two_factor_scan_qr_instruction') }}
          </p>
          <div class="flex justify-center">
            <img
              v-if="qrcode"
              :src="qrcode"
              alt="Two FA QR Code"
              class="h-48 w-48 rounded-lg border border-brand-200 p-2 dark:border-brand-700"
            />
            <div
              v-else
              class="flex h-48 w-48 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 dark:border-brand-700 dark:bg-brand-800"
            >
              <UIcon name="i-heroicons-qr-code" class="h-16 w-16 text-brand-400 dark:text-brand-500" />
            </div>
          </div>
        </div>

        <div class="mt-4">
          <p class="mb-1 text-sm text-brand-700 dark:text-brand-300">
            {{ t('two_factor_manual_entry_instruction') }}
          </p>
          <div
            class="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 p-3 text-pretty dark:border-brand-700 dark:bg-brand-800/50"
          >
            <span class="font-mono text-sm text-pretty break-all text-brand-700 dark:text-brand-300">{{
              props.totpURI
            }}</span>
            <UButton
              variant="link"
              size="xs"
              :icon="secretCopied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
              :label="secretCopied ? t('secret_key_copied') : t('copy_secret_key')"
              @click="copySecretKey"
            />
          </div>
        </div>

        <div>
          <h3 class="mb-2 text-sm font-semibold text-brand-800 dark:text-brand-200">
            {{ t('two_factor_backup_codes_title') }}
          </h3>
          <p class="mb-3 text-xs text-brand-600 dark:text-brand-400">
            {{ t('two_factor_backup_codes_instruction') }}
          </p>
          <div class="rounded-lg border border-brand-200 bg-brand-50 p-3 dark:border-brand-700 dark:bg-brand-800/50">
            <div class="grid grid-cols-2 gap-x-4 gap-y-1">
              <span
                v-for="code in props.backupCodes"
                :key="code"
                class="font-mono text-sm text-brand-700 dark:text-brand-300"
              >
                {{ code }}
              </span>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <UButton
                variant="link"
                size="sm"
                :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
                :label="copied ? t('copied_to_clipboard') : t('settings_copy_backup_codes')"
                @click="copyBackupCodes"
              />
              <UButton
                variant="link"
                size="sm"
                icon="i-lucide-download"
                :label="t('settings_download_backup_codes')"
                @click="downloadBackupCodes"
              />
            </div>
          </div>
        </div>

        <div>
          <p class="mb-2 text-sm text-brand-700 dark:text-brand-300">
            {{ t('two_factor_enter_code_instruction') }}
          </p>
          <UFormField required :error="errors.code" :label="t('two_factor_code_label')">
            <UPinInput v-model="pinInputModel" length="6" input-class="text-center" />
          </UFormField>
        </div>
      </div>
    </template>
    <template #footer>
      <UButton color="neutral" variant="outline" class="rounded-lg px-4 py-2" @click="internalOpen = false">
        {{ t('cancel') }}
      </UButton>
      <UButton
        :loading="isSubmitting"
        :disabled="isSubmitting || !meta.valid"
        color="primary"
        variant="subtle"
        class="flex items-center gap-x-2 rounded-lg px-4 py-2"
        @click.prevent="
          () => {
            onSubmit()
          }
        "
      >
        <span>{{ t('verify_code_button') }}</span>
      </UButton>
    </template>
  </UModal>
</template>

<style></style>
