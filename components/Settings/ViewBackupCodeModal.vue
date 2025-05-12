<script lang="ts" setup>
const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:open'])

const { t } = useI18n()
const { $trpc } = useNuxtApp()
const { user } = useAuth()
const toast = useToast()
const backupCodes = ref<string[]>([])
const { copy } = useClipboard()

const internalOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const fetchBackupCodes = async () => {
  try {
    const { data } = await $trpc.auth.viewBackupCodes.query()
    if (data) {
      backupCodes.value = data?.backupCodes || []
    }
  } catch (error) {
    if (error instanceof Error) {
      toast.add({
        title: t('settings_view_backup_codes_error'),
        description: error.message,
        color: 'error',
      })
    } else {
      toast.add({
        title: t('settings_view_backup_codes_error'),
        description: t('settings_view_backup_codes_error_description'),
        color: 'error',
      })
    }
  }
}

const copyCodesToClipboard = () => {
  if (backupCodes.value.length > 0) {
    copy(backupCodes.value.join('\n'))
    toast.add({
      title: t('settings_backup_codes_copied_title'),
      description: t('settings_backup_codes_copied_description'),
      icon: 'i-lucide:copy-check',
    })
  }
}

const downloadCodes = () => {
  if (backupCodes.value.length > 0) {
    const codesText = backupCodes.value.join('\n')
    const blob = new Blob([codesText], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'backup-codes.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    toast.add({
      title: t('settings_backup_codes_downloaded_title'),
      description: t('settings_backup_codes_downloaded_description'),
      icon: 'i-lucide:download',
    })
  }
}

watch(internalOpen, (value) => {
  if (value) {
    if (user.value?.id) {
      fetchBackupCodes()
    }
  } else {
    // Clear codes when modal is closed
    backupCodes.value = []
  }
})
</script>

<template>
  <UModal v-model:open="internalOpen" :prevent-close="false" :title="t('settings_view_backup_codes')">
    <template #body>
      <div class="p-4">
        <p class="mb-4 text-sm text-treez-500 dark:text-treez-100">
          {{ t('settings_view_backup_codes_instruction') }}
        </p>
        <UAlert
          icon="i-heroicons-exclamation-triangle"
          color="warning"
          variant="soft"
          :title="t('settings_backup_codes_warning_title')"
          :description="t('settings_backup_codes_warning_description')"
          class="mb-6"
        />
        <div v-if="backupCodes.length > 0" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="(code, index) in backupCodes"
              :key="index"
              class="rounded-md bg-treez-100 p-3 text-center font-mono text-lg dark:bg-treez-800"
            >
              {{ code }}
            </div>
          </div>
          <div class="mt-6 flex flex-col gap-3 sm:flex-row">
            <UButton
              icon="i-heroicons-clipboard-document"
              block
              color="primary"
              variant="subtle"
              @click="copyCodesToClipboard"
            >
              {{ t('settings_copy_backup_codes') }}
            </UButton>
            <UButton icon="i-heroicons-arrow-down-tray" block color="primary" variant="subtle" @click="downloadCodes">
              {{ t('settings_download_backup_codes') }}
            </UButton>
          </div>
        </div>
        <div v-else class="py-8 text-center">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl text-treez-500 dark:text-treez-400" />
          <p class="mt-2 text-sm text-treez-500 dark:text-treez-400">
            {{ t('loading') }}
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <UButton color="neutral" variant="ghost" @click="internalOpen = false">
        {{ t('close') }}
      </UButton>
    </template>
  </UModal>
</template>

<style></style>
