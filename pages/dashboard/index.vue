<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  auth: {
    only: 'user',
    redirectGuestTo: '/login',
  },
})

useHead({
  title: 'Dashboard',
  meta: [{ name: 'description', content: 'Dashboard page description' }],
})

interface StatCard {
  title: string
  value: string
  icon: string
  iconBgColor: string
  iconTextColor: string
  gradientFrom: string
  gradientTo: string
}

const stats: StatCard[] = [
  {
    title: 'Total Users',
    value: '6,789',
    icon: 'tabler:users',
    iconBgColor: 'bg-blue-500/10',
    iconTextColor: 'text-blue-500',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-purple-600',
  },
  {
    title: 'Total Revenue',
    value: '$23,456',
    icon: 'tabler:currency-dollar',
    iconBgColor: 'bg-green-500/10',
    iconTextColor: 'text-green-500',
    gradientFrom: 'from-green-600',
    gradientTo: 'to-teal-600',
  },
  {
    title: 'Total Orders',
    value: '1,234',
    icon: 'tabler:shopping-cart',
    iconBgColor: 'bg-purple-500/10',
    iconTextColor: 'text-purple-500',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-pink-600',
  },
  {
    title: 'Active Users',
    value: '892',
    icon: 'tabler:user-check',
    iconBgColor: 'bg-orange-500/10',
    iconTextColor: 'text-orange-500',
    gradientFrom: 'from-orange-600',
    gradientTo: 'to-red-600',
  },
]
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
    <div
      v-for="(stat, index) in stats"
      :key="index"
      class="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow duration-300 hover:shadow-lg dark:border-brand-700 dark:bg-brand-800/80"
    >
      <div class="flex items-center space-x-4">
        <div :class="['flex items-center justify-center rounded-lg p-3', stat.iconBgColor]">
          <Icon :name="stat.icon" :class="['h-6 w-6', stat.iconTextColor]" />
        </div>
        <div>
          <h3 class="font-medium text-brand-500 dark:text-brand-400">{{ stat.title }}</h3>
          <p
            :class="[
              'bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent',
              stat.gradientFrom,
              stat.gradientTo,
            ]"
          >
            {{ stat.value }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>
