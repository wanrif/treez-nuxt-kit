<script setup lang="ts">
import type { MenuItem } from '~/types/menu'

defineProps<{
  isSidebarExpanded: boolean
  isMobileMenuOpen: boolean
  isMobile: boolean
  activeSubmenu: string | null
  menuItems: MenuItem[]
}>()

defineEmits(['toggle-sidebar', 'toggle-mobile-menu', 'toggle-submenu'])

const isMounted = useMounted()
</script>

<template>
  <nav
    :class="[
      'fixed top-0 left-0 z-50 h-screen overflow-y-auto',
      'bg-white/90 dark:bg-treez-950/95',
      'md:translate-x-0',
      isSidebarExpanded ? 'w-64' : 'w-20',
      isMobileMenuOpen && isMobile ? 'w-64 translate-x-0' : isMobile ? '-translate-x-full' : 'translate-x-0',
      'transition-all duration-300 ease-in-out',
    ]"
  >
    <div class="flex h-16 items-center overflow-hidden px-4">
      <div class="min-w-0 flex-1">
        <h1
          class="transform-gpu bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bungee text-2xl font-bold whitespace-nowrap text-transparent"
          :class="[
            isSidebarExpanded || isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0',
            'transition-all duration-300 ease-in-out',
          ]"
        >
          Dashboard
        </h1>
      </div>
      <button
        v-show="!isMobile"
        class="flex flex-shrink-0 items-center justify-center rounded-lg p-2 transition-all duration-300 ease-in-out hover:bg-treez-100 dark:hover:bg-treez-700/50"
        :class="{ 'rotate-180': !isSidebarExpanded }"
        @click="$emit('toggle-sidebar')"
      >
        <Icon name="tabler:chevron-left" class="h-5 w-5 text-treez-600 dark:text-treez-300" />
      </button>
    </div>

    <div v-if="isMounted" class="flex flex-col gap-1 px-2 pt-4 pb-24">
      <DashboardMenuItem
        v-for="item in menuItems"
        :key="item.label"
        :item="item"
        :is-expanded="isSidebarExpanded"
        :is-mobile="isMobile"
        :is-active="activeSubmenu === item.label"
        @toggle="$emit('toggle-submenu', item.label)"
      />
    </div>
  </nav>
</template>

<style scoped>
/* Hide scrollbar but allow scrolling */
nav {
  scrollbar-width: none; /* Firefox */
}
nav::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}
</style>
