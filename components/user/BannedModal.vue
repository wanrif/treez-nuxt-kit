<script lang="ts" setup>
import { z } from 'zod'

defineProps<{
  item: InferUserClient
}>()

const emit = defineEmits<{
  (_e: 'fetchUser'): void
}>()

const { client } = useAuth()
const toast = useToast()
const bannedModal = ref(false)
const bannedReason = ref(['Spamming', 'Inappropriate Content', 'Harassment', 'Other'])
const bannedExpiration = ref([
  { label: '1 Day', value: 86400 },
  { label: '3 Day', value: 259200 },
  { label: '1 Week', value: 604800 },
  { label: '1 Month', value: 2592000 },
])

const selectedUser = ref<InferUserClient | null>(null)

const bannedSchema = z.object({
  userId: z.string(),
  bannedReason: z.string().optional(),
  customReason: z.string().optional(),
  banExpiresIn: z.number().optional(),
})

type BannedSchema = z.output<typeof bannedSchema>

const bannedForm = reactive<Partial<BannedSchema>>({
  userId: '',
  bannedReason: '',
  customReason: '',
  banExpiresIn: undefined,
})

const openBanModal = (user: InferUserClient) => {
  selectedUser.value = user
  bannedForm.userId = user.id
  bannedForm.bannedReason = ''
  bannedForm.customReason = ''
  bannedForm.banExpiresIn = undefined
  bannedModal.value = true
}

const onSubmitBanAction = async () => {
  if (!selectedUser.value) return

  if (selectedUser.value.banned) {
    await onSubmitUnbanned(selectedUser.value.id)
  } else {
    await onSubmitbanned(selectedUser.value.id)
  }
}

const onSubmitbanned = async (userId: string) => {
  const { data, error } = await client.admin.banUser({
    userId,
    banReason: bannedForm.bannedReason === 'Other' ? bannedForm.customReason : bannedForm.bannedReason, // Optional (if not provided, the default ban reason will be used - No reason)
    banExpiresIn: bannedForm.banExpiresIn, // Optional (if not provided, the ban will never expire)
  })
  if (data) {
    bannedModal.value = false
    toast.add({ title: 'User banned successfully', color: 'success' })
    emit('fetchUser')
  }
  if (error) {
    bannedModal.value = false
    toast.add({ title: 'Failed to ban user', description: error.message, color: 'error' })
  }
}

const onSubmitUnbanned = async (userId: string) => {
  const { data, error } = await client.admin.unbanUser({
    userId,
  })
  if (data) {
    bannedModal.value = false
    toast.add({ title: 'User unbanned successfully', color: 'success' })
    emit('fetchUser')
  }
  if (error) {
    bannedModal.value = false
    toast.add({ title: 'Failed to unban user', color: 'error' })
  }
}
</script>

<template>
  <UModal
    v-model:open="bannedModal"
    :title="selectedUser?.banned ? `Unban User ${selectedUser?.name}` : `Ban User ${selectedUser?.name}`"
    :description="`Are you sure you want to ${selectedUser?.banned ? 'unban' : 'ban'} this user?`"
    close-icon="i-lucide-x"
    :ui="{ footer: 'justify-end' }"
    class="w-full bg-primary"
    @close="bannedModal = false"
  >
    <UButton
      :label="item.banned ? 'Unban' : 'Ban'"
      color="error"
      variant="subtle"
      class="w-fit"
      @click="openBanModal(item)"
    />
    <template #body>
      <div v-if="selectedUser?.banned">
        <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
          This will remove all restrictions from the user's account and restore their access to the platform.
        </p>
      </div>
      <UForm v-else :schema="bannedSchema" :state="bannedForm" class="space-y-4">
        <UFormField
          label="Ban Reason"
          name="bannedReason"
          help="Optional (if not provided, the default ban reason will be used - No reason)"
        >
          <USelect v-model="bannedForm.bannedReason" :items="bannedReason" class="w-full" />
        </UFormField>
        <UFormField v-if="bannedForm.bannedReason === 'Other'" label="Custom Ban Reason" name="customReason">
          <UInput v-model="bannedForm.customReason" type="text" placeholder="Enter reason" class="w-full" />
        </UFormField>
        <UFormField
          label="Ban Expires In"
          name="banExpiresIn"
          help="Optional (if not provided, the ban will never expire)"
        >
          <USelect v-model="bannedForm.banExpiresIn" :items="bannedExpiration" class="w-full" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <UButton label="Cancel" color="neutral" variant="outline" @click="bannedModal = false" />
      <UButton
        :label="selectedUser?.banned ? 'Unban User' : 'Ban User'"
        color="error"
        variant="solid"
        @click="onSubmitBanAction"
      />
    </template>
  </UModal>
</template>

<style></style>
