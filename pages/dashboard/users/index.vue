<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { useDebounceFn } from '@vueuse/core'

import type { AuthUser } from '~/types'

definePageMeta({
  layout: 'dashboard',
  auth: {
    only: 'admin',
    redirectUserTo: '/dashboard',
  },
})

const { client, user } = useAuth()

interface UsersResponse {
  users: AuthUser[]
  total: number | undefined
  limit: number | undefined
}

const usersResponse = ref<UsersResponse | null>(null)
const loading = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('all')
const statusOptions = ref([
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Banned', value: 'banned' },
])

// Add pagination state
const page = ref(1)
const itemsPerPage = ref(10)

// Function to fetch users based on current filters
const fetchUsers = async () => {
  loading.value = true
  try {
    const queryParams: Record<string, string | number> = {
      limit: itemsPerPage.value,
      offset: (page.value - 1) * itemsPerPage.value,
    }

    if (searchQuery.value) {
      queryParams.searchField = 'name'
      queryParams.searchOperator = 'contains'
      queryParams.searchValue = searchQuery.value
    }

    if (selectedStatus.value !== 'all') {
      queryParams.filterField = 'banned'
      queryParams.filterOperator = 'eq'
      queryParams.filterValue = selectedStatus.value === 'banned' ? 1 : 0
    }

    const response = await client.admin.listUsers({ query: queryParams })
    usersResponse.value = response.data as unknown as UsersResponse
  } catch (error) {
    console.error('Failed to fetch users:', error)
    usersResponse.value = { users: [], total: 0, limit: itemsPerPage.value }
  } finally {
    loading.value = false
  }
}

// Computed property for users
const users = computed(() => usersResponse.value?.users || [])
const totalUsers = computed(() => usersResponse.value?.total || 0)

// Debounced version of fetchUsers for search input
const debouncedFetchUsers = useDebounceFn(fetchUsers, 300)

// Watch for changes in filters
watch(searchQuery, () => {
  page.value = 1 // Reset to first page when searching
  debouncedFetchUsers()
})

watch(selectedStatus, () => {
  page.value = 1 // Reset to first page when changing filter
  fetchUsers() // Fetch immediately on status change
})

// Watch for page changes
watch(page, () => {
  fetchUsers()
})

// Fetch initial data on component mount
onMounted(() => {
  fetchUsers()
})

const getStatusText = (banned: number | boolean): string => {
  const isBanned = !!banned
  return !isBanned ? 'Active' : 'Banned'
}
</script>

<template>
  <div class="flex flex-col gap-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Users Management</h1>
      <UButton variant="subtle" color="primary" size="lg" class="flex items-center gap-2">
        <Icon name="i-lucide:user-round-plus" class="h-5 w-5" />
        Add User
      </UButton>
    </div>

    <div class="flex flex-col gap-4 sm:flex-row">
      <div class="flex-1">
        <div class="relative">
          <Icon name="tabler:search" class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass-20-solid"
            size="lg"
            color="info"
            variant="outline"
            :trailing="false"
            placeholder="Search by name..."
            :disabled="loading"
            :ui="{
              base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-50 border-0 shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 pl-10',
            }"
          />
        </div>
      </div>
      <USelect
        v-model="selectedStatus"
        :items="statusOptions"
        color="neutral"
        size="lg"
        class="w-28"
        :disabled="loading"
        :ui="{
          base: 'shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 capitalize disabled:cursor-not-allowed disabled:opacity-50',
        }"
      />
    </div>

    <div class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
      <div class="overflow-x-auto">
        <div v-if="loading" class="p-4 text-center text-gray-500 dark:text-gray-400">Loading users...</div>
        <table v-else class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
              >
                User
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
              >
                Role
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
              >
                Status
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
              >
                Verified
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody v-if="users.length > 0" class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in users" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 flex-shrink-0">
                    <img
                      class="h-10 w-10 rounded-full"
                      :src="
                        item.image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`
                      "
                      :alt="`${item.name}'s avatar`"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="flex items-center gap-2">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">{{ item.name }}</div>
                      <UBadge v-if="item.id === user?.id" color="primary" variant="subtle" size="sm">You</UBadge>
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ item.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 capitalize dark:text-white">{{ item.role }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :icon="item.banned ? 'i-lucide:shield-ban' : 'i-lucide:shield-check'"
                  size="lg"
                  :color="item.banned ? 'error' : 'success'"
                  variant="subtle"
                  class="rounded-full"
                >
                  {{ getStatusText(item.banned ?? false) }}
                </UBadge>
              </td>
              <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                {{ item.emailVerified ? 'Verified' : 'Not Verified' }}
              </td>
              <td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                <!-- Start Option Modal -->
                <UModal :title="item.name" :description="item.email" close-icon="i-lucide-x">
                  <UButton label="Options" variant="ghost" color="secondary" />

                  <template #body>
                    <div class="box-border flex flex-col gap-4">
                      <div class="grid grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <p class="col-span-1">User ID</p>
                        <span class="col-auto text-gray-900 dark:text-white">{{ item.id }}</span>
                      </div>
                      <div class="grid grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <p class="col-span-1">Role</p>
                        <span class="col-auto text-gray-900 dark:text-white">{{ item.role }}</span>
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

                        <UserBannedModal :item="item" @fetch-user="fetchUsers" />
                      </div>
                    </div>
                  </template>
                </UModal>
                <!-- End Option Modal -->
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No users found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <UPagination
      v-if="totalUsers > 0"
      v-model="page"
      active-color="primary"
      active-variant="subtle"
      size="lg"
      :total="totalUsers"
      :items-per-page="itemsPerPage"
      class="mt-4"
    />
  </div>
</template>

<style scoped></style>
