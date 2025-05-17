<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  auth: {
    only: 'user',
    redirectGuestTo: '/login',
  },
})

useHead({
  title: 'Profile',
  meta: [{ name: 'description', content: 'User profile page description' }],
})

const { client, user } = useAuth()
const isMounted = useMounted()
const toast = useToast()
const { t } = useI18n()

const { fields, errors, isSubmitting, meta, submit, resetForm } = useProfileForm(
  {
    name: user.value?.name ?? '',
    phone: user.value?.phone ?? '',
    location: user.value?.location ?? '',
    website: user.value?.website ?? '',
    bio: user.value?.bio ?? '',
  },
  async (values: ProfileFormData) => {
    try {
      await client.updateUser({
        name: values.name,
        phone: values.phone,
        location: values.location,
        website: values.website,
        bio: values.bio,
      })
      toast.add({ title: t('profile_toast_success'), color: 'primary', icon: 'ph:check-circle-bold' })
    } catch {
      toast.add({ title: t('profile_toast_error'), color: 'error', icon: 'ph:x-circle-bold' })
    }
  }
)

const {
  fields: emailFields,
  errors: emailErrors,
  isSubmitting: isEmailSubmitting,
  meta: emailMeta,
  submit: submitEmail,
  resetForm: resetEmailForm,
} = useEmailForm(
  {
    email: user.value?.email ?? '',
  },
  async (values: EmailForm) => {
    try {
      await client.changeEmail({
        newEmail: values.email,
      })
      toast.add({ title: t('profile_email_toast_success'), color: 'primary', icon: 'ph:check-circle-bold' })
    } catch {
      toast.add({ title: t('profile_email_toast_error'), color: 'error', icon: 'ph:x-circle-bold' })
    }
  }
)

const cancelEdit = () => {
  resetForm()
}

const isEditingEmail = ref(false)

const startEditEmail = () => {
  isEditingEmail.value = true
}
const cancelEmailEdit = () => {
  resetEmailForm()
  isEditingEmail.value = false
}

const afterEmailChange = () => {
  isEditingEmail.value = false
}

const isMobile = ref(false)

onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
  }

  checkMobile()
  window.addEventListener('resize', checkMobile)

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })
})
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-y-8 px-4 py-8 sm:px-8">
    <template v-if="isMounted">
      <!-- Profile Header Card -->
      <div
        class="relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl bg-white p-6 shadow sm:flex-row sm:items-start sm:p-8 dark:bg-treez-950"
      >
        <!-- Avatar -->
        <div class="group relative">
          <div class="h-24 w-24 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-1 sm:h-28 sm:w-28">
            <div
              class="flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-treez-900"
            >
              <span
                class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl"
              >
                {{
                  user?.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                }}
              </span>
            </div>
          </div>
          <div
            class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600/50 to-purple-600/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <Icon name="tabler:camera" class="h-6 w-6 text-white" />
          </div>
        </div>
        <!-- Info -->
        <div class="flex flex-1 flex-col items-center gap-2 sm:items-start">
          <h1
            class="bg-gradient-to-r from-treez-900 to-treez-700 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl dark:from-white dark:to-treez-300"
          >
            {{ user?.name }}
          </h1>
          <div
            class="flex flex-col items-center gap-2 text-sm text-treez-600 sm:flex-row sm:items-start dark:text-treez-400"
          >
            <div class="flex items-center gap-1">
              <Icon name="tabler:mail" class="h-4 w-4" />
              <span>{{ user?.email }}</span>
            </div>
            <span v-if="user?.location" class="hidden sm:inline">·</span>
            <div class="flex items-center gap-1">
              <Icon name="tabler:map-pin" class="h-4 w-4" />
              <span>{{ user?.location || '-' }}</span>
            </div>
          </div>
          <p v-if="user?.bio" class="mt-2 text-center text-sm text-treez-600 sm:text-left dark:text-treez-400">
            {{ user?.bio }}
          </p>
        </div>
      </div>

      <!-- Email Change Card -->
      <div class="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow dark:bg-treez-950">
        <div class="mb-2 flex items-center gap-2">
          <Icon name="tabler:mail" class="h-5 w-5 text-blue-500" />
          <h2 class="text-lg font-semibold text-treez-900 dark:text-white">
            {{ t('profile_email_section_title') || t('Email address') }}
          </h2>
        </div>
        <p class="mb-2 text-sm text-treez-500 dark:text-treez-400">
          {{
            t('profile_email_section_desc') ||
            t('Your email is used for login and notifications. Changing your email requires verification.')
          }}
        </p>
        <form
          v-if="isEditingEmail"
          @submit.prevent="
            async () => {
              await submitEmail()
              afterEmailChange()
            }
          "
        >
          <UFormField v-slot="{ error: fieldError }" :label="t('profile_email_label')" :error="emailErrors.email">
            <UInput
              v-model="emailFields.email.value.value"
              type="email"
              color="info"
              variant="outline"
              size="lg"
              autofocus
              class="!w-full"
              :trailing-icon="fieldError ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
              :ui="{
                base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-50 border-0 shadow-xs bg-gray-50 dark:bg-treez-950 text-treez-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-treez-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
              }"
            />
          </UFormField>
          <div class="mt-4 flex flex-col justify-end gap-3 sm:flex-row">
            <UButton
              type="button"
              variant="outline"
              color="neutral"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-treez-700 transition hover:bg-gray-50 sm:w-auto dark:border-treez-600 dark:text-treez-300 dark:hover:bg-treez-950"
              @click="cancelEmailEdit"
            >
              {{ t('cancel') }}
            </UButton>
            <UButton
              :disabled="isEmailSubmitting || !emailMeta.valid || !emailMeta.dirty"
              type="submit"
              icon="tabler:mail-forward"
              class="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-medium text-white transition hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {{ t('profile_email_change_btn') || t('Change Email') }}
            </UButton>
          </div>
          <div class="mt-2 flex items-center gap-1 text-xs text-treez-500 dark:text-treez-400">
            <Icon name="tabler:info-circle" class="h-4 w-4" />
            {{ t('profile_email_change_info') || t('You will receive a verification link at your new email.') }}
          </div>
        </form>
        <div v-else class="flex items-center gap-3">
          <UInput
            :model-value="emailFields.email.value.value"
            type="email"
            readonly
            color="info"
            variant="outline"
            size="lg"
            class="!w-full"
            :ui="{
              base: 'relative block w-full bg-gray-50 dark:bg-treez-950 text-treez-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-treez-700',
            }"
          />
          <UButton
            type="button"
            icon="tabler:edit"
            class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-medium text-white transition hover:from-blue-700 hover:to-purple-700"
            @click="startEditEmail"
          >
            {{ t('profile_email_edit_btn') || t('Edit') }}
          </UButton>
        </div>
      </div>

      <!-- Personal Info Card -->
      <div class="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow dark:bg-treez-950">
        <div class="mb-2 flex items-center gap-2">
          <Icon name="tabler:user" class="h-5 w-5 text-purple-500" />
          <h2 class="text-lg font-semibold text-treez-900 dark:text-white">
            {{ t('personal_info') }}
          </h2>
        </div>
        <form @submit.prevent="submit">
          <div class="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <template v-for="(field, key) in fields" :key="key">
              <UFormField
                v-slot="{ error: fieldError }"
                :label="t(`profile_${key}_label`)"
                :error="errors[key]"
                :class="{ 'md:col-span-2': ['bio'].includes(key) }"
              >
                <template v-if="key === 'bio'">
                  <UTextarea
                    v-model="field.value.value"
                    :rows="4"
                    color="info"
                    variant="outline"
                    size="lg"
                    class="!w-full"
                    :ui="{
                      base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-50 border-0 shadow-xs bg-gray-50 dark:bg-treez-950 text-treez-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-treez-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
                    }"
                  />
                </template>
                <template v-else>
                  <UInput
                    v-model="field.value.value"
                    type="text"
                    color="info"
                    variant="outline"
                    size="lg"
                    class="!w-full"
                    :trailing-icon="fieldError ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
                    :ui="{
                      base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-50 border-0 shadow-xs bg-gray-50 dark:bg-treez-950 text-treez-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-treez-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
                    }"
                  />
                </template>
              </UFormField>
            </template>
          </div>
          <div class="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
            <UButton
              type="button"
              variant="outline"
              color="neutral"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-treez-700 transition hover:bg-gray-50 sm:w-auto dark:border-treez-600 dark:text-treez-300 dark:hover:bg-treez-950"
              @click="cancelEdit"
            >
              {{ t('cancel') }}
            </UButton>
            <UButton
              :disabled="isSubmitting || !meta.valid || !meta.dirty"
              type="submit"
              icon="tabler:device-floppy"
              class="flex w-full items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-medium text-white transition hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {{ t('save_changes') }}
            </UButton>
          </div>
        </form>
      </div>
    </template>

    <template v-else>
      <!-- Skeletons -->
      <div
        class="mb-6 flex flex-col items-center gap-6 rounded-2xl bg-white p-6 shadow-lg sm:flex-row dark:bg-treez-900"
      >
        <div class="h-24 w-24 animate-pulse rounded-2xl bg-treez-200 sm:h-28 sm:w-28 dark:bg-treez-950" />
        <div class="flex-1 space-y-2">
          <div class="h-8 w-48 animate-pulse rounded bg-treez-200 dark:bg-treez-950" />
          <div class="h-4 w-32 animate-pulse rounded bg-treez-200 dark:bg-treez-950" />
        </div>
      </div>
      <div class="mb-6 rounded-2xl bg-white p-6 shadow dark:bg-treez-900">
        <div class="mb-2 h-4 w-24 animate-pulse rounded bg-treez-200 dark:bg-treez-950" />
        <div class="h-10 w-full animate-pulse rounded bg-treez-200 dark:bg-treez-950" />
      </div>
      <div class="rounded-2xl bg-white p-6 shadow dark:bg-treez-900">
        <div class="mb-6 h-6 w-40 animate-pulse rounded bg-treez-200 dark:bg-treez-950" />
        <div class="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          <div v-for="i in 6" :key="i" class="space-y-2">
            <div class="h-4 w-24 animate-pulse rounded bg-treez-200 dark:bg-treez-950" />
            <div class="h-10 w-full animate-pulse rounded bg-treez-200 dark:bg-treez-950" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Add smooth transitions for responsive changes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Improve form input touch targets on mobile */
@media (max-width: 640px) {
  input,
  textarea {
    font-size: 16px; /* Prevent zoom on iOS */
    min-height: 44px; /* Better touch targets */
  }
}

/* Add smooth transform transitions */
.transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Add gradient animation */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.bg-gradient-animate {
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}
</style>
