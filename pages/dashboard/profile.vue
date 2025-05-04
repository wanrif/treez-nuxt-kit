<script lang="ts" setup>
import type { ProfileFormData } from '~/composables/useProfileForm'

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

const { user } = useAuth()
const authStore = useAuthStore()
const mounted = ref(false)
const toast = useToast()
const { t } = useI18n()

const isEditing = ref(false)

const { fields, errors, isSubmitting, meta, submit, resetForm } = useProfileForm(
  {
    name: user.value?.name ?? '',
    email: user.value?.email ?? '',
    phone: user.value?.phone ?? '',
    location: user.value?.location ?? '',
    website: user.value?.website ?? '',
    bio: user.value?.bio ?? '',
  },
  async (values: ProfileFormData) => {
    try {
      await authStore.updateProfile(values)
      toast.add({ title: t('profile_toast_success'), color: 'primary', icon: 'ph:check-circle-bold' })
      isEditing.value = false
    } catch {
      toast.add({ title: t('profile_toast_error'), color: 'error', icon: 'ph:x-circle-bold' })
    }
  }
)

const cancelEdit = () => {
  resetForm()
  isEditing.value = false
}

const isMobile = ref(false)

onMounted(() => {
  mounted.value = true
})

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
  <div class="mx-auto max-w-4xl px-4 sm:px-6">
    <template v-if="mounted">
      <!-- Profile Header -->
      <div class="relative mb-6 overflow-hidden rounded-xl bg-white p-6 shadow sm:p-8 dark:bg-brand-800">
        <!-- Decorative Elements -->
        <div class="absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 transform">
          <div class="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl" />
        </div>

        <div class="relative z-10">
          <div class="flex flex-col items-center space-y-6 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <!-- Profile Info Section -->
            <div class="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-6">
              <!-- Avatar Section -->
              <div class="group relative">
                <div class="h-24 w-24 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-1 sm:h-28 sm:w-28">
                  <div
                    class="flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-brand-800"
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

              <!-- User Info -->
              <div class="space-y-2 text-center sm:text-left">
                <h1
                  class="bg-gradient-to-r from-brand-900 to-brand-700 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl dark:from-white dark:to-brand-300"
                >
                  {{ user?.name }}
                </h1>
                <div
                  class="flex flex-col items-center space-y-2 text-sm sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4"
                >
                  <div class="flex items-center space-x-2 text-brand-600 dark:text-brand-400">
                    <Icon name="tabler:mail" class="h-4 w-4" />
                    <span>{{ user?.email }}</span>
                  </div>
                  <div class="flex items-center space-x-2 text-brand-600 dark:text-brand-400">
                    <Icon name="tabler:map-pin" class="h-4 w-4" />
                    <span>{{ user?.location ? user?.location : '-' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <button
              v-if="!isEditing"
              class="transform rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 font-medium text-white transition duration-200 hover:scale-[1.02] hover:from-blue-700 hover:to-purple-700"
              @click="isEditing = true"
            >
              {{ $t('edit_profile') }}
            </button>
          </div>

          <!-- Bio Section -->
          <div class="mt-6 border-t border-brand-200 pt-6 dark:border-brand-700">
            <p class="text-sm leading-relaxed text-brand-600 dark:text-brand-400">
              {{ user?.bio }}
            </p>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div class="rounded-xl bg-white p-4 shadow sm:p-6 dark:bg-brand-800">
        <form @submit.prevent="submit">
          <div class="space-y-6">
            <!-- Personal Information -->
            <div>
              <h2 class="mb-4 text-lg font-semibold text-brand-900 dark:text-white">
                {{ $t('personal_info') }}
              </h2>
              <div class="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                <template v-for="(field, key) in fields" :key="key">
                  <UFormField
                    v-slot="{ error: fieldError }"
                    :label="$t(`profile_${key}_label`)"
                    :error="errors[key]"
                    :class="{ 'md:col-span-2': ['website', 'bio'].includes(key) }"
                  >
                    <template v-if="key === 'bio'">
                      <UTextarea
                        v-model="field.value.value"
                        :disabled="!isEditing"
                        :rows="4"
                        color="info"
                        variant="outline"
                        size="lg"
                        class="!w-full"
                        :ui="{
                          base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-50 border-0 shadow-xs bg-gray-50 dark:bg-brand-700 text-brand-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-brand-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
                        }"
                      />
                    </template>
                    <template v-else>
                      <UInput
                        v-model="field.value.value"
                        :type="key === 'email' ? 'email' : 'text'"
                        :disabled="!isEditing"
                        color="info"
                        variant="outline"
                        size="lg"
                        class="!w-full"
                        :trailing-icon="fieldError ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
                        :ui="{
                          base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-50 border-0 shadow-xs bg-gray-50 dark:bg-brand-700 text-brand-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-brand-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
                        }"
                      />
                    </template>
                  </UFormField>
                </template>
              </div>
            </div>

            <!-- Action Buttons -->
            <div v-if="isEditing" class="flex flex-col space-y-3 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                class="order-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-brand-700 transition duration-200 hover:bg-gray-50 sm:order-1 sm:w-auto dark:border-brand-600 dark:text-brand-300 dark:hover:bg-brand-700"
                @click="cancelEdit"
              >
                {{ $t('cancel') }}
              </button>
              <button
                :disabled="isSubmitting || !meta.valid || !meta.dirty"
                type="submit"
                class="order-1 w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-medium text-white transition duration-200 hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:order-2 sm:w-auto"
              >
                {{ $t('save_changes') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </template>

    <template v-else>
      <!-- Profile Header Skeleton -->
      <div class="mb-6 rounded-xl bg-white p-6 shadow-lg sm:p-8 dark:bg-brand-800">
        <div class="flex flex-col items-center space-y-6 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div class="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
            <div class="h-24 w-24 animate-pulse rounded-2xl bg-brand-200 sm:h-28 sm:w-28 dark:bg-brand-700" />
            <div class="space-y-2 text-center sm:text-left">
              <div class="h-8 w-48 animate-pulse rounded bg-brand-200 dark:bg-brand-700" />
              <div class="h-4 w-32 animate-pulse rounded bg-brand-200 dark:bg-brand-700" />
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Content Skeleton -->
      <div class="rounded-xl bg-white p-4 shadow-sm sm:p-6 dark:bg-brand-800">
        <div class="mb-6 h-6 w-40 animate-pulse rounded bg-brand-200 dark:bg-brand-700" />
        <div class="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          <div v-for="i in 6" :key="i" class="space-y-2">
            <div class="h-4 w-24 animate-pulse rounded bg-brand-200 dark:bg-brand-700" />
            <div class="h-10 w-full animate-pulse rounded bg-brand-200 dark:bg-brand-700" />
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
