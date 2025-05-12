import { useField, useForm } from 'vee-validate'
import { computed, ref } from 'vue'
import * as zod from 'zod'

import { toTypedSchema } from '@vee-validate/zod'

type TwoFactorFormData = {
  code: string
  trustDevice?: boolean
}

export const useTwoFactorForm = () => {
  const { t } = useI18n()
  const error = ref('')
  const { client } = useAuth()
  const router = useRouter()
  const route = useRoute()
  const localePath = useLocalePath()
  const toast = useToast()
  const isUsingRecoveryCode = ref(false)
  const showTrustedDeviceModal = ref(false)
  const pendingVerificationData = ref<TwoFactorFormData | null>(null)
  const isVerifyingViaModal = ref(false)

  const validationSchema = computed(() => {
    if (isUsingRecoveryCode.value) {
      return toTypedSchema(
        zod.object({
          code: zod.string().min(1, t('validation_recovery_code_required')),
        })
      )
    } else {
      return toTypedSchema(
        zod.object({
          code: zod
            .string()
            .min(6, t('validation_two_factor_code_required'))
            .max(6, t('validation_two_factor_code_length'))
            .regex(/^\d{6}$/, t('validation_two_factor_code_numeric')),
          trustDevice: zod.boolean().optional(),
        })
      )
    }
  })

  const { handleSubmit, errors, isSubmitting, meta, resetForm } = useForm<TwoFactorFormData>({
    validationSchema: validationSchema,
  })

  const fields = {
    code: useField<string>('code'),
    trustDevice: useField<boolean>('trustDevice'),
  } as const

  const submit = handleSubmit(async (values) => {
    if (isUsingRecoveryCode.value) {
      await client.twoFactor.verifyBackupCode(
        {
          code: values.code,
        },
        {
          async onSuccess() {
            await router.push(localePath('/dashboard'))
          },
        }
      )
    } else {
      if (values.trustDevice === undefined) {
        pendingVerificationData.value = values
        showTrustedDeviceModal.value = true
        return
      }
    }
  })

  const confirmTrustAndVerify = async (trustDeviceChoice: boolean) => {
    if (!pendingVerificationData.value) {
      error.value = t('error_unknown') // Should not happen
      return
    }
    isVerifyingViaModal.value = true
    error.value = ''
    try {
      await client.twoFactor.verifyTotp(
        {
          code: pendingVerificationData.value.code,
          trustDevice: trustDeviceChoice,
        },
        {
          async onSuccess() {
            const redirect = route.query.redirect as string
            await navigateTo(redirect || localePath('/dashboard'), { replace: true })
          },
          async onError(context) {
            if (context.response.status === 401) {
              toast.add({
                title: t('two_factor_verification_failed'),
                description: context.error.message,
                color: 'error',
              })
            } else {
              error.value = t('error_unknown')
            }
          },
        }
      )
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : t('two_factor_verification_failed')
    } finally {
      isVerifyingViaModal.value = false
      showTrustedDeviceModal.value = false
      pendingVerificationData.value = null
    }
  }

  const resetCodeField = () => {
    resetForm()
    error.value = ''
    showTrustedDeviceModal.value = false
    pendingVerificationData.value = null
    isVerifyingViaModal.value = false
  }

  const useRecoveryCode = () => {
    isUsingRecoveryCode.value = true
    resetCodeField()
  }

  const useTotpCode = () => {
    isUsingRecoveryCode.value = false
    resetCodeField()
  }

  return {
    fields,
    errors,
    isSubmitting,
    meta,
    error,
    submit,
    useRecoveryCode,
    useTotpCode,
    isUsingRecoveryCode,
    showTrustedDeviceModal,
    confirmTrustAndVerify,
    isVerifyingViaModal,
  } as const
}
