<script lang="ts" setup>
defineProps<{
  item: InferUserClient
}>()

const emit = defineEmits<{
  (_e: 'fetchUser'): void
}>()

const open = ref(false)
</script>

<template>
  <UModal v-model:open="open" :title="item.name" :description="item.email" close-icon="i-lucide-x">
    <UButton label="Options" variant="ghost" color="secondary" />

    <template #body>
      <div class="box-border flex flex-col gap-4">
        <div class="grid grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p class="col-span-1">User ID</p>
          <span class="col-span-2 w-full text-pretty break-all text-gray-900 dark:text-white">{{ item.id }}</span>
        </div>
        <div class="grid grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p class="col-span-1">Role</p>
          <span class="col-span-2 text-gray-900 dark:text-white">{{ item.role }}</span>
        </div>
        <template v-if="item.banned">
          <div class="grid grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p class="col-span-1">Banned</p>
            <span class="col-auto text-gray-900 dark:text-white">Yes</span>
          </div>
          <div class="grid grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p class="col-span-1">Banned Reason</p>
            <span class="col-auto text-gray-900 dark:text-white">
              {{ item.banReason || 'No reason provided' }}
            </span>
          </div>
          <div class="grid grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p class="col-span-1">Banned Expires</p>
            <span class="col-auto text-gray-900 dark:text-white">
              {{ item.banExpires ? new Date(item.banExpires).toLocaleString() : 'Never' }}
            </span>
          </div>
        </template>
        <div class="grid grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p class="col-span-1">Action</p>

          <div class="flex items-center gap-2">
            <UserBannedModal :item="item" @fetch-user="emit('fetchUser')" />
            <UserRevokeSessionsModal :item="item" @fetch-user="emit('fetchUser')" />
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style></style>
