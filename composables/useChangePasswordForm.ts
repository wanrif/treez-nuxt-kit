import { useField, useForm } from 'vee-validate'
import * as zod from 'zod'

import { toTypedSchema } from '@vee-validate/zod'

type ChangePasswordFormData = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const useChangePasswordForm = () => {
  const { t } = useI18n()
  const error = ref('')
  const success = ref('')
  const authStore = useAuthStore()

  const passwordSchema = toTypedSchema(
    zod
      .object({
        currentPassword: zod.string().min(1, t('validation_current_password_required')), // Min 1 as it just needs to be present
        newPassword: zod
          .string()
          .min(8, t('validation_password_min'))
          .regex(/[A-Z]/, t('validation_password_uppercase'))
          .regex(/[a-z]/, t('validation_password_lowercase'))
          .regex(/[0-9]/, t('validation_password_number')),
        confirmPassword: zod.string().min(1, t('validation_confirm_password_required')),
      })
      .refine((data) => data.newPassword === data.confirmPassword, {
        message: t('passwords_not_match'),
        path: ['confirmPassword'],
      })
  )

  const { handleSubmit, errors, isSubmitting, meta, resetForm } = useForm<ChangePasswordFormData>({
    validationSchema: passwordSchema,
  })

  const fields = {
    currentPassword: useField<string>('currentPassword'),
    newPassword: useField<string>('newPassword'),
    confirmPassword: useField<string>('confirmPassword'),
  } as const

  const submit = handleSubmit(async (values: ChangePasswordFormData): Promise<void> => {
    try {
      error.value = ''
      success.value = ''
      await authStore.changePassword({
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword,
      })
      success.value = t('password_changed')
      resetForm()
    } catch (e: unknown) {
      const err = e as Error & {
        data?: { zodError?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] } }
      }
      if (err.data?.zodError) {
        const fieldErrors = err.data?.zodError?.fieldErrors
        const formErrors = err.data?.zodError?.formErrors

        if (formErrors && formErrors.length > 0) {
          error.value = formErrors[0]
        } else if (fieldErrors) {
          const firstField = Object.keys(fieldErrors)[0]
          if (firstField && fieldErrors[firstField].length > 0) {
            error.value = fieldErrors[firstField][0]
          }
        } else {
          error.value = t('password_error') // Fallback if no specific Zod error
        }
      } else {
        error.value = err.message || t('password_error')
      }
      success.value = '' // Clear success message on error
    }
  })

  return {
    fields,
    errors,
    isSubmitting,
    meta,
    error,
    success,
    submit,
  } as const
}
