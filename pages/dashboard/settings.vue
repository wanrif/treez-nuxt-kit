<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  auth: {
    only: 'user',
    redirectGuestTo: '/login',
  },
})

useHead({
  title: 'Settings',
  meta: [{ name: 'description', content: 'Settings page description' }],
})

const { user } = useAuth()
const { locale, locales, t } = useI18n()
const localePath = useLocalePath()
const isMounted = useMounted()
const showTwoFAConfirmModal = ref(false)
const currentTotpURI = ref<string | null>(null)
const currentBackupCodes = ref<string[] | null>(null)

const settings = ref({
  account: {
    email: user.value?.email || '',
    language: locale.value,
    timezone: 'UTC+7',
  },
  notifications: {
    email: true,
    push: false,
    marketing: false,
    updates: true,
  },
  appearance: {
    theme: 'system',
    compact: false,
    animations: true,
  },
  privacy: {
    profileVisibility: 'public',
    twoFactorAuth: user?.value?.twoFactorEnabled || false,
  },
})
const showBackupCodeModal = ref(false)

const handleLanguageChange = async (newLangCode: string) => {
  if (newLangCode === 'en' || newLangCode === 'id') {
    locale.value = newLangCode
    await navigateTo(localePath('/dashboard/settings'), {
      replace: true,
      external: true,
    })
  }
}

watch(
  () => settings.value.account.language,
  (newLang, oldLang) => {
    if (newLang !== oldLang && isMounted.value) {
      handleLanguageChange(newLang)
    }
  }
)

const availableLocales = computed(() => {
  return (locales.value || []).map((locale) => ({
    label: new Intl.DisplayNames([locale.code], { type: 'language' }).of(locale.code) || locale.code,
    value: locale.code,
  }))
})

const themes = computed(() => [
  { label: t('theme_system'), value: 'system' },
  { label: t('theme_light'), value: 'light' },
  { label: t('theme_dark'), value: 'dark' },
])

const visibilityOptions = computed(() => [
  { label: t('visibility_public'), value: 'public' },
  { label: t('visibility_private'), value: 'private' },
  { label: t('visibility_friends'), value: 'friends' },
])

const { currentTheme, updateTheme } = useThemeManager()

onMounted(() => {
  settings.value.appearance.theme = currentTheme.value
})

const handleThemeUpdate = (value: string) => {
  settings.value.appearance.theme = value
  updateTheme(value)
}

watch(
  currentTheme,
  (newTheme) => {
    settings.value.appearance.theme = newTheme
  },
  { immediate: true }
)

const {
  fields: passwordFields,
  errors: passwordErrors,
  isSubmitting: isChangingPassword,
  meta: passwordMeta,
  error: passwordError,
  success: passwordSuccess,
  submit: handlePasswordChange,
} = useChangePasswordForm()

const showTwoFAModal = ref(false)
const twoFAAction = ref<'enable' | 'disable'>('enable')

const initiateTwoFAChange = () => {
  if (settings.value.privacy.twoFactorAuth) {
    twoFAAction.value = 'disable'
  } else {
    twoFAAction.value = 'enable'
  }
  showTwoFAModal.value = true
}

const handleTwoFAEnabled = ({ totpURI, backupCodes }: { totpURI: string; backupCodes: string[] }) => {
  currentTotpURI.value = totpURI
  currentBackupCodes.value = backupCodes
  showTwoFAConfirmModal.value = true
}

const handleTwoFADisabled = () => {
  settings.value.privacy.twoFactorAuth = false
}

const handleTwoFAVerified = () => {
  settings.value.privacy.twoFactorAuth = true
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6 px-4 sm:px-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <template v-if="isMounted">
        <h1 class="text-2xl font-semibold text-brand-900 dark:text-white">{{ t('settings') }}</h1>
      </template>
      <template v-else>
        <div class="h-6 w-32 animate-pulse rounded bg-brand-200 dark:bg-brand-700" />
      </template>
    </div>

    <!-- Settings Content -->
    <template v-if="isMounted">
      <div class="grid gap-6">
        <!-- Account Settings -->
        <div class="rounded-xl bg-white p-6 shadow-sm dark:bg-brand-800">
          <h2 class="mb-6 text-lg font-semibold text-brand-900 dark:text-white">{{ t('account_settings') }}</h2>
          <div class="block">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="col-span-2">
                <label class="mb-1 block text-sm font-medium text-brand-700 dark:text-brand-300">
                  {{ t('account_email_address') }}
                </label>
                <UInput
                  v-model="settings.account.email"
                  type="email"
                  :placeholder="t('enter_email_address')"
                  class="w-full rounded-lg bg-white text-brand-900 disabled:opacity-50 dark:bg-brand-700 dark:text-white"
                  disabled
                />
              </div>
              <div class="block">
                <label class="mb-1 block text-sm font-medium text-brand-700 dark:text-brand-300">
                  {{ $t('account_language') }}
                </label>
                <USelect
                  v-model="settings.account.language"
                  :items="availableLocales"
                  item-attribute="label"
                  value-attribute="value"
                  size="md"
                  :ui="{
                    trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
                    content: 'ring ring-gray-100 dark:ring-brand-900',
                    item: 'data-highlighted:not-data-disabled:text-[var(--ui-text)] data-highlighted:not-data-disabled:before:bg-brand-50/50 dark:data-highlighted:not-data-disabled:before:bg-brand-800/50',
                  }"
                  class="w-full rounded-lg bg-white text-brand-900 data-[state=open]:ring-2 data-[state=open]:ring-blue-600 dark:bg-brand-700 dark:text-white dark:data-[state=open]:ring-blue-600"
                />
              </div>
              <div class="block">
                <label class="mb-1 block text-sm font-medium text-brand-700 dark:text-brand-300">
                  {{ $t('account_timezone') }}
                </label>
                <USelect
                  v-model="settings.account.timezone"
                  :items="[
                    { label: 'UTC+7', value: 'UTC+7' },
                    { label: 'UTC+0', value: 'UTC+0' },
                    { label: 'UTC+1', value: 'UTC+1' },
                  ]"
                  size="md"
                  :ui="{
                    trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
                    content: 'ring ring-gray-100 dark:ring-brand-900',
                    item: 'data-highlighted:not-data-disabled:text-[var(--ui-text)] data-highlighted:not-data-disabled:before:bg-brand-50/50 dark:data-highlighted:not-data-disabled:before:bg-brand-800/50',
                  }"
                  class="w-full rounded-lg bg-white text-brand-900 data-[state=open]:ring-2 data-[state=open]:ring-blue-600 dark:bg-brand-700 dark:text-white dark:data-[state=open]:ring-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Change Password Section -->
        <div class="rounded-xl bg-white p-6 shadow-sm dark:bg-brand-800">
          <h2 class="mb-6 text-lg font-semibold text-brand-900 dark:text-white">{{ t('change_password') }}</h2>
          <form class="max-w-md space-y-4" @submit.prevent="handlePasswordChange">
            <!-- Error/Success Messages -->
            <div
              v-if="passwordError"
              class="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
            >
              {{ passwordError }}
            </div>
            <div
              v-if="passwordSuccess"
              class="rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400"
            >
              {{ passwordSuccess }}
            </div>

            <!-- Password Fields using UFormField and UInput -->
            <UFormField
              v-slot="{ error: fieldError }"
              :label="t('current_password')"
              :error="passwordErrors.currentPassword"
            >
              <UInput
                v-model="passwordFields.currentPassword.value.value"
                type="password"
                :placeholder="t('enter_current_password')"
                autocomplete="current-password"
                color="info"
                class="w-full rounded-lg bg-white text-brand-900 disabled:opacity-50 dark:bg-brand-700 dark:text-white"
                :trailing-icon="fieldError ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
              />
            </UFormField>

            <UFormField v-slot="{ error: fieldError }" :label="t('new_password')" :error="passwordErrors.newPassword">
              <UInput
                v-model="passwordFields.newPassword.value.value"
                type="password"
                :placeholder="t('enter_new_password')"
                autocomplete="new-password"
                color="info"
                class="w-full rounded-lg bg-white text-brand-900 disabled:opacity-50 dark:bg-brand-700 dark:text-white"
                :trailing-icon="fieldError ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
              />
            </UFormField>

            <UFormField
              v-slot="{ error: fieldError }"
              :label="t('confirm_password')"
              :error="passwordErrors.confirmPassword"
            >
              <UInput
                v-model="passwordFields.confirmPassword.value.value"
                type="password"
                :placeholder="t('confirm_new_password')"
                autocomplete="new-password"
                color="info"
                class="w-full rounded-lg bg-white text-brand-900 disabled:opacity-50 dark:bg-brand-700 dark:text-white"
                :trailing-icon="fieldError ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
              />
            </UFormField>

            <!-- Submit Button using UButton -->
            <div class="pt-2">
              <UButton
                type="submit"
                color="primary"
                :loading="isChangingPassword"
                :disabled="isChangingPassword || !passwordMeta.valid"
                class="w-full sm:w-auto"
              >
                {{ isChangingPassword ? t('changing_password') : t('change_password') }}
              </UButton>
            </div>
          </form>
        </div>

        <!-- Privacy -->
        <div class="rounded-xl bg-white p-6 shadow-sm dark:bg-brand-800">
          <h2 class="mb-6 text-lg font-semibold text-brand-900 dark:text-white">{{ t('privacy_security') }}</h2>
          <div class="space-y-6">
            <div>
              <label class="mb-1 block text-sm font-medium text-brand-700 dark:text-brand-300">
                {{ t('profile_visibility') }}
              </label>
              <USelect
                v-model="settings.privacy.profileVisibility"
                :items="visibilityOptions"
                :ui="{
                  trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
                  content: 'ring ring-gray-100 dark:ring-brand-900',
                  item: 'data-highlighted:not-data-disabled:text-[var(--ui-text)] data-highlighted:not-data-disabled:before:bg-brand-50/50 dark:data-highlighted:not-data-disabled:before:bg-brand-800/50',
                }"
                class="w-full rounded-lg bg-white px-4 py-2 text-brand-900 data-[state=open]:ring-2 data-[state=open]:ring-blue-600 dark:bg-brand-700 dark:text-white dark:data-[state=open]:ring-blue-600"
              />
            </div>

            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <h3 class="text-sm font-medium text-brand-900 dark:text-white">
                    {{ t('two_factor_auth') }}
                  </h3>
                  <p class="text-sm text-brand-500 dark:text-brand-400">
                    {{ t('two_factor_auth_description') }}
                  </p>
                </div>
                <USwitch
                  :model-value="settings.privacy.twoFactorAuth"
                  color="info"
                  size="lg"
                  @update:model-value="initiateTwoFAChange"
                />
                <SettingsTwoFAModal
                  v-model:open="showTwoFAModal"
                  :action="twoFAAction"
                  @enabled="handleTwoFAEnabled"
                  @disabled="handleTwoFADisabled"
                />
                <SettingsTwoFAConfirmModal
                  v-if="currentTotpURI && currentBackupCodes"
                  v-model:open="showTwoFAConfirmModal"
                  :totp-u-r-i="currentTotpURI"
                  :backup-codes="currentBackupCodes"
                  @verified="handleTwoFAVerified"
                />
              </div>
              <div v-if="settings.privacy.twoFactorAuth" class="flex items-center justify-between">
                <div class="flex flex-col">
                  <h3 class="text-sm font-medium text-brand-900 dark:text-white">
                    {{ t('settings_view_backup_codes') }}
                  </h3>
                  <p class="text-sm text-brand-500 dark:text-brand-400">
                    {{ t('settings_view_backup_codes_description') }}
                  </p>
                </div>
                <UButton
                  :label="t('settings_view_backup_codes_button')"
                  variant="subtle"
                  @click="showBackupCodeModal = true"
                />
                <SettingsViewBackupCodeModal v-model:open="showBackupCodeModal" />
              </div>
            </div>
          </div>
        </div>

        <!-- Appearance -->
        <div class="rounded-xl bg-white p-6 shadow-sm dark:bg-brand-800">
          <h2 class="mb-6 text-lg font-semibold text-brand-900 dark:text-white">{{ t('appearance') }}</h2>
          <div class="space-y-6">
            <div>
              <label class="mb-3 block text-sm font-medium text-brand-700 dark:text-brand-300">
                {{ t('theme') }}
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="theme in themes"
                  :key="theme.value"
                  class="flex items-center justify-center rounded-lg border px-4 py-2 transition-all duration-200"
                  :class="[
                    settings.appearance.theme === theme.value
                      ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'border-brand-300 hover:border-blue-600/50 dark:border-brand-600',
                  ]"
                  @click="handleThemeUpdate(theme.value)"
                >
                  {{ theme.label }}
                </button>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-brand-900 dark:text-white">Compact Mode</h3>
                  <p class="text-sm text-brand-500 dark:text-brand-400">Reduce spacing and padding</p>
                </div>
                <USwitch v-model="settings.appearance.compact" color="info" size="lg" />
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-brand-900 dark:text-white">Enable Animations</h3>
                  <p class="text-sm text-brand-500 dark:text-brand-400">Show animations and transitions</p>
                </div>
                <USwitch v-model="settings.appearance.animations" color="info" size="lg" />
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="rounded-xl bg-white p-6 shadow-sm dark:bg-brand-800">
          <h2 class="mb-6 text-lg font-semibold text-brand-900 dark:text-white">{{ t('notifications') }}</h2>
          <div class="space-y-4">
            <div v-for="(value, key) in settings.notifications" :key="key" class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-brand-900 capitalize dark:text-white">
                  {{ t(`${key}_notifications`) }}
                </h3>
                <p class="text-sm text-brand-500 dark:text-brand-400">
                  {{ t('receive_notifications', { type: key }) }}
                </p>
              </div>
              <USwitch v-model="settings.notifications[key]" color="info" size="lg" />
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="grid gap-6">
        <div v-for="i in 4" :key="i" class="rounded-xl bg-white p-6 shadow-sm dark:bg-brand-800">
          <div class="mb-6 h-6 w-32 animate-pulse rounded bg-brand-200 dark:bg-brand-700" />
          <div class="space-y-4">
            <div v-for="j in 3" :key="j" class="flex items-center justify-between">
              <div class="space-y-2">
                <div class="h-4 w-24 animate-pulse rounded bg-brand-200 dark:bg-brand-700" />
                <div class="h-3 w-48 animate-pulse rounded bg-brand-200 dark:bg-brand-700" />
              </div>
              <div class="h-6 w-11 animate-pulse rounded-full bg-brand-200 dark:bg-brand-700" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>
