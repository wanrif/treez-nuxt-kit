<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { Column, Table as TanstackTableApi } from '@tanstack/vue-table'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'dashboard',
  auth: {
    only: 'admin',
    redirectUserTo: '/dashboard',
  },
})

interface UsersResponse {
  users: InferUserClient[]
  total: number | undefined
  limit: number | undefined
}
const UAvatar = resolveComponent('UAvatar')
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UserOptionModal = resolveComponent('UserOptionModal')
const UCheckbox = resolveComponent('UCheckbox')

const { client, user } = useAuth()
const { t, locale } = useI18n()
const isMounted = useMounted()
const usersResponse = ref<UsersResponse | null>(null)
const loading = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('all')
const statusOptions = ref([
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Banned', value: 'banned' },
])
const pageSizeOptions = ref([
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
])

const pagination = ref({
  pageIndex: 0,
  pageSize: 5,
})
const sorting = ref([
  {
    id: 'createdAt',
    desc: false,
  },
])

interface UTableInstance {
  tableApi: TanstackTableApi<InferUserClient>
}
const table = useTemplateRef<UTableInstance>('table')
const rowSelection = ref<Record<string, boolean>>({})

function onSelect(row: TableRow<InferUserClient>, _e?: Event) {
  /* If you decide to also select the column you can do this  */
  row.toggleSelected(!row.getIsSelected())
}

const fetchUsers = async () => {
  loading.value = true
  try {
    if (sorting.value[0].id === 'status') {
      sorting.value[0].id = 'banned'
    }
    const queryParams: Record<string, string | number | boolean> = {
      limit: pagination.value.pageSize,
      offset: pagination.value.pageIndex * pagination.value.pageSize,
      sortBy: sorting.value[0].id,
      sortDirection: sorting.value[0].desc ? 'desc' : 'asc',
    }

    if (searchQuery.value) {
      queryParams.searchValue = searchQuery.value
    }

    if (selectedStatus.value !== 'all') {
      queryParams.filterField = 'banned'
      queryParams.filterOperator = 'eq'
      queryParams.filterValue = selectedStatus.value === 'banned' ? 1 : 0
    }

    const response = await client.admin.listUsers({ query: queryParams })
    usersResponse.value = response.data as unknown as UsersResponse
    if (sorting.value[0].id === 'banned') {
      sorting.value[0].id = 'status'
    }
  } catch (error) {
    console.error('Failed to fetch users:', error)
    usersResponse.value = { users: [], total: 0, limit: pagination.value.pageSize }
  } finally {
    loading.value = false
  }
}

const users = computed(() => usersResponse.value?.users || [])

function getHeader(column: Column<InferUserClient>, label: string) {
  const isSorted = column.getIsSorted()

  return h(
    UDropdownMenu,
    {
      content: {
        align: 'start',
      },
      'aria-label': 'Actions dropdown',
      items: [
        {
          label: 'Asc',
          type: 'checkbox',
          icon: 'i-lucide-arrow-up-narrow-wide',
          checked: isSorted === 'asc',
          onSelect: () => {
            if (isSorted === 'asc') {
              column.clearSorting()
              fetchUsers()
            } else {
              column.toggleSorting(false)
              fetchUsers()
            }
          },
        },
        {
          label: 'Desc',
          icon: 'i-lucide-arrow-down-wide-narrow',
          type: 'checkbox',
          checked: isSorted === 'desc',
          onSelect: () => {
            if (isSorted === 'desc') {
              column.clearSorting()
              fetchUsers()
            } else {
              column.toggleSorting(true)
              fetchUsers()
            }
          },
        },
      ],
      ui: {
        content: 'ring-treez-50/50 dark:ring-treez-800/50',
      },
    },
    () =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label,
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class:
          '-mx-2.5 data-[state=open]:bg-treez-100/50 dark:data-[state=open]:bg-treez-800 hover:bg-treez-100/50 dark:hover:bg-treez-800',
        'aria-label': `Sort by ${isSorted === 'asc' ? 'descending' : 'ascending'}`,
      })
  )
}

const getStatusText = (banned: number | boolean): string => {
  const isBanned = !!banned
  return !isBanned ? 'Active' : 'Banned'
}

const columns: TableColumn<InferUserClient>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all',
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'aria-label': 'Select row',
      }),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => getHeader(column, 'Name'),
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h(UAvatar, {
          src:
            row.original.image ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(row.original.name)}&background=random`,
          size: 'lg',
        }),
        h('div', undefined, [
          h('div', { class: 'font-medium text-highlighted flex items-center gap-2' }, [
            row.original.name,
            row.original.id === user.value?.id
              ? h(
                  UBadge,
                  {
                    color: 'primary',
                    variant: 'subtle',
                    size: 'sm',
                  },
                  'You'
                )
              : null,
          ]),
          h('p', { class: '' }, row.original.email),
        ]),
      ])
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => getHeader(column, 'Role'),
    cell: ({ row }) => h('span', { class: 'capitalize' }, row.original?.role ?? ''),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => getHeader(column, 'Status'),
    cell: ({ row }) => {
      const isBanned = !!row.original.banned
      return h(
        UBadge,
        {
          icon: isBanned ? 'i-lucide:shield-ban' : 'i-lucide:shield-check',
          size: 'lg',
          color: isBanned ? 'error' : 'success',
          variant: 'subtle',
          class: 'rounded-full',
        },
        getStatusText(row.original.banned ?? false)
      )
    },
  },
  {
    accessorKey: 'emailVerified',
    header: ({ column }) => getHeader(column, 'Email Verified'),
    cell: ({ row }) => {
      return h('span', undefined, row.original.emailVerified ? t('verified') : t('unverified'))
    },
  },
  {
    id: 'createdAt',
    header: ({ column }) => getHeader(column, 'Created At'),
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return h('span', undefined, date.toLocaleDateString(locale.value, { dateStyle: 'medium' }))
    },
  },
  {
    accessorKey: 'action',
    header: () => h('div', { class: 'text-center' }, 'Action'),
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'flex justify-center' },
        h(UserOptionModal, {
          item: row.original,
          onFetchUser: () => fetchUsers(),
        })
      )
    },
  },
]

// Debounced version of fetchUsers for search input
const debouncedFetchUsers = useDebounceFn(fetchUsers, 300)

// Watch for changes in filters
watch(searchQuery, () => {
  pagination.value.pageIndex = 0 // Reset to first page when searching
  debouncedFetchUsers()
})

watch(selectedStatus, () => {
  pagination.value.pageIndex = 0 // Reset to first page when changing filter
  fetchUsers()
})

// Watch for page changes
watch(
  () => pagination.value.pageIndex,
  () => {
    fetchUsers()
  }
)

watch(
  () => pagination.value.pageSize,
  () => {
    pagination.value.pageIndex = 0 // Reset to first page when page size changes
    fetchUsers()
  }
)

// Fetch initial data on component mount
onMounted(() => {
  fetchUsers()
})
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
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            color="info"
            size="lg"
            variant="outline"
            placeholder="Search by name..."
            :trailing="false"
            class="w-full sm:w-72"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 sm:flex sm:gap-4">
        <USelect
          v-model="selectedStatus"
          :items="statusOptions"
          color="neutral"
          size="lg"
          class="w-full sm:w-28"
          :disabled="loading"
        />
        <USelect
          v-model="pagination.pageSize"
          :items="pageSizeOptions"
          color="neutral"
          size="lg"
          class="w-full sm:w-28"
          :disabled="loading"
        />
      </div>
    </div>

    <div v-if="isMounted" class="overflow-hidden rounded-lg shadow">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        :loading="loading"
        loading-color="primary"
        loading-animation="carousel"
        :data="users"
        :columns="columns"
        class="flex-1"
        @select="onSelect"
      />

      <div class="border-t border-default bg-default px-4 py-3.5 text-sm text-muted">
        {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of {{ usersResponse?.total || 0 }} row(s)
        selected.
      </div>
    </div>

    <div class="flex justify-center">
      <UPagination
        active-color="primary"
        active-variant="subtle"
        :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="usersResponse?.total || 0"
        @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </div>
  </div>
</template>

<style scoped></style>
