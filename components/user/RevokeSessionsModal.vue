<script lang="ts" setup>
const props = defineProps<{
  item: InferUserClient
}>()

const emit = defineEmits<{
  (_e: 'fetchUser'): void
}>()

const { client } = useAuth()
type InferSessionItem = typeof client.$Infer.Session.session

const { t } = useI18n()
const toast = useToast()
const revokeModal = ref(false)
const listSessions = ref<InferSessionItem[] | null>([])
const isLoadingSessions = ref(false)
const revokingSessionToken = ref<string | null>(null)
const isRevokingAllSessions = ref(false)

const openModal = () => {
  revokeModal.value = true
}

const fetchUserSessions = async () => {
  if (!props.item) return
  isLoadingSessions.value = true
  listSessions.value = []
  try {
    const { data, error } = await client.admin.listUserSessions({
      userId: props.item.id,
    })
    if (error) {
      toast.add({ title: t('error_fetching_sessions_title'), description: error.message, color: 'error' })
      listSessions.value = []
    } else {
      listSessions.value = data.sessions
    }
  } catch (e: unknown) {
    toast.add({ title: t('error_fetching_sessions_title'), description: (e as Error).message, color: 'error' })
    listSessions.value = []
  } finally {
    isLoadingSessions.value = false
  }
}

const revokeUserSession = async (sessionToken: string) => {
  revokingSessionToken.value = sessionToken
  try {
    const { error } = await client.admin.revokeUserSession({
      sessionToken,
    })
    if (error) {
      toast.add({ title: t('error_revoke_session_title'), description: error.message, color: 'error' })
    } else {
      toast.add({ title: t('success_revoke_session_title'), color: 'success' })
      emit('fetchUser') // Notify parent to refetch user data if needed
      await fetchUserSessions() // Refresh the session list in the modal
    }
  } catch (e: unknown) {
    toast.add({ title: t('error_revoke_session_title'), description: (e as Error).message, color: 'error' })
  } finally {
    revokingSessionToken.value = null
  }
}

const revokeAllUserSessions = async (userId: string) => {
  isRevokingAllSessions.value = true
  try {
    const { error } = await client.admin.revokeUserSessions({
      userId,
    })
    if (error) {
      toast.add({ title: t('error_revoke_all_sessions_title'), description: error.message, color: 'error' })
    } else {
      toast.add({ title: t('success_revoke_all_sessions_title'), color: 'success' })
      emit('fetchUser') // Notify parent to refetch user data if needed
      await fetchUserSessions() // Refresh the session list, likely to be empty
    }
  } catch (e: unknown) {
    toast.add({ title: t('error_revoke_all_sessions_title'), description: (e as Error).message, color: 'error' })
  } finally {
    isRevokingAllSessions.value = false
  }
}

watch(
  () => revokeModal.value,
  async (value: boolean) => {
    if (value) {
      await fetchUserSessions()
    } else {
      listSessions.value = []
    }
  }
)
</script>

<template>
  <UModal
    v-model:open="revokeModal"
    :title="t('user_manage_sessions_title', { name: item.name })"
    :description="t('user_revoke_sessions_description')"
    close-icon="i-lucide-x"
    :ui="{ content: 'sm:max-w-xl', footer: 'justify-end' }"
    @close="revokeModal = false"
  >
    <UButton
      :label="t('user_manage_sessions_button_label', 'Manage Sessions')"
      variant="subtle"
      color="secondary"
      @click="openModal"
    />

    <template #body>
      <div class="flex flex-col gap-4">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ t('user_active_sessions_count', { count: listSessions?.length || 0 }) }}
        </div>

        <div v-if="isLoadingSessions" class="flex items-center justify-center py-8">
          <UIcon name="i-lucide-loader-circle" class="h-8 w-8 animate-spin text-primary" />
        </div>
        <div
          v-else-if="!listSessions || listSessions.length === 0"
          class="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          {{ t('user_no_active_sessions', 'No active sessions found.') }}
        </div>
        <div v-else class="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
          <div
            v-for="session in listSessions"
            :key="session.token"
            class="flex flex-col gap-3 rounded-md border border-treez-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-treez-700"
          >
            <div class="flex-grow space-y-1.5">
              <div>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{
                  t('session_token_label', 'Session Token')
                }}</span>
                <p class="font-mono text-sm break-all text-gray-700 dark:text-gray-200" :title="session.token">
                  {{ session.token }}
                </p>
              </div>
              <div>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{
                  t('session_created_at_label', 'Created At')
                }}</span>
                <p class="text-sm text-gray-700 dark:text-gray-200">
                  {{ new Date(session.createdAt).toLocaleString() }}
                </p>
              </div>
              <div>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{
                  t('session_expires_at_label', 'Expires At')
                }}</span>
                <p class="text-sm text-gray-700 dark:text-gray-200">
                  {{ new Date(session.expiresAt).toLocaleString() }}
                </p>
              </div>
            </div>
            <UButton
              :label="t('revoke_button_label', 'Revoke')"
              color="error"
              variant="outline"
              size="sm"
              :loading="revokingSessionToken === session.token"
              class="flex items-center justify-center sm:ml-auto sm:flex-shrink-0"
              @click="revokeUserSession(session.token)"
            />
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <UButton
        :label="t('cancel_button_label', 'Cancel')"
        color="neutral"
        variant="outline"
        @click="revokeModal = false"
      />
      <UButton
        :label="t('user_revoke_all_sessions')"
        color="error"
        variant="solid"
        :loading="isRevokingAllSessions"
        :disabled="isLoadingSessions || !listSessions || listSessions.length === 0"
        @click="revokeAllUserSessions(item.id)"
      />
    </template>
  </UModal>
</template>

<style></style>
