<script setup lang="ts">
import type { MenuItem } from '~/types/menu'

const { user } = useAuth()
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { isSidebarExpanded, isMobileMenuOpen, isMobile, activeSubmenu, toggleSidebar, toggleMobileMenu, toggleSubmenu } =
  useSidebar()
const isMounted = useMounted()

watch(
  () => route.fullPath,
  () => (isMobileMenuOpen.value = false)
)

const MENU_ITEMS: MenuItem[] = [
  { label: 'dashboard', icon: 'tabler:layout-dashboard', to: '/dashboard' },
  { label: 'users', icon: 'tabler:users', to: '/dashboard/users', adminOnly: true },
  {
    label: 'products',
    icon: 'tabler:package',
    subMenu: [
      { label: 'all_products', to: '/dashboard/products', icon: 'tabler:list' },
      { label: 'add_product', to: '/dashboard/products/add', icon: 'tabler:plus' },
      { label: 'categories', to: '/dashboard/products/categories', icon: 'tabler:category' },
    ],
  },
  { label: 'orders', icon: 'tabler:shopping-cart', to: '/dashboard/orders' },
]

const menuItems = computed(() =>
  MENU_ITEMS.filter((item) => {
    return !item.adminOnly || user.value?.role === 'admin'
  }).map((item) => ({
    ...item,
    label: t(item.label),
    to: item.to ? localePath(item.to) : undefined,
    subMenu: item.subMenu?.map((sub) => ({ ...sub, label: t(sub.label), to: localePath(sub.to) })),
  }))
)
</script>

<template>
  <div class="flex h-screen w-full bg-gradient-to-t from-white to-treez-50 dark:from-treez-950 dark:to-treez-900">
    <LoadingSpinner size="lg" :show="!isMounted" />

    <div v-show="isMounted" class="flex h-full w-full">
      <!-- Mobile Menu Overlay -->
      <Transition name="fade">
        <div
          v-show="isMobileMenuOpen"
          class="fixed inset-0 z-40 bg-treez-950/50 backdrop-blur-sm md:hidden"
          @click="toggleMobileMenu"
        />
      </Transition>

      <!-- Sidebar Navigation -->
      <DashboardSidebar
        :is-sidebar-expanded="isSidebarExpanded"
        :is-mobile-menu-open="isMobileMenuOpen"
        :is-mobile="isMobile"
        :active-submenu="activeSubmenu"
        :menu-items="menuItems"
        @toggle-sidebar="toggleSidebar"
        @toggle-mobile-menu="toggleMobileMenu"
        @toggle-submenu="toggleSubmenu"
      />

      <!-- Main Content -->
      <div
        :class="[
          'flex h-screen flex-1 flex-col overflow-y-auto',
          !isMobile && 'md:ml-20',
          { 'md:ml-64': !isMobile && isSidebarExpanded },
          'transition-all duration-300 ease-in-out',
        ]"
      >
        <!-- Header -->
        <header
          class="sticky top-0 z-30 bg-white/90 shadow-sm backdrop-blur-md dark:bg-treez-950/95 dark:shadow-treez-800/20"
        >
          <div class="flex h-16 items-center justify-between px-4">
            <!-- Mobile Menu Button -->
            <button
              class="flex items-center justify-center rounded-lg p-2 hover:bg-treez-100 md:hidden dark:hover:bg-treez-700/50"
              @click="toggleMobileMenu"
            >
              <Icon name="tabler:menu-2" class="h-6 w-6 text-treez-600 dark:text-treez-300" />
            </button>

            <h2
              class="hidden bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-lg font-semibold text-transparent sm:block"
            >
              {{ t('welcome') }}
            </h2>

            <div class="flex items-center space-x-4">
              <ThemeSwitcher />
              <DashboardProfileDropdown />
            </div>
          </div>
        </header>

        <main class="flex-1 p-4 md:p-6">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<style>
@reference "../assets/css/main.css";

.router-link-active {
  @apply bg-white dark:bg-treez-700/50;
}

.router-link-active.router-link-exact-active {
  @apply bg-transparent text-blue-600 dark:text-blue-400;
}

/* Performance optimizations */
.transition-transform {
  will-change: transform;
  backface-visibility: hidden;
}

.menu-enter-active,
.menu-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
