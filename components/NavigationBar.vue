<script lang="ts" setup>
const localePath = useLocalePath()
const { signOut, loggedIn } = useAuth()
const isOpen = ref(false)
const isMounted = useMounted()

interface NavLink {
  to: string
  text: string
  icon: string
  onClick?: () => Promise<void> | void
}

const handleSignOut = async () => {
  await signOut({
    redirectTo: localePath('/login'),
  })
}

const linkList = computed<NavLink[]>(() => {
  const links: NavLink[] = [{ to: localePath('/'), text: 'navbar_home', icon: 'ph:house' }]

  if (loggedIn.value) {
    links.push(
      { to: localePath('/dashboard'), text: 'navbar_dashboard', icon: 'ph:gauge' },
      {
        to: '',
        text: 'navbar_logout',
        icon: 'ph:sign-out',
        onClick: handleSignOut,
      }
    )
  } else {
    links.push({ to: localePath('/login'), text: 'navbar_login', icon: 'ph:sign-in' })
  }

  return links
})

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const handleLinkClick = async (link: NavLink, closeMenu = false): Promise<void> => {
  if (link.onClick) {
    await link.onClick()
  }
  if (closeMenu) {
    isOpen.value = false
  }
}
</script>

<template>
  <nav class="w-full">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo Section -->
        <NuxtLink :to="localePath('/')" class="flex items-center space-x-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <span class="font-bungee text-xl text-white">N</span>
          </div>
          <span class="font-bungee text-xl tracking-wide text-treez-900 dark:text-white">NuxTreez</span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <div class="hidden items-center gap-x-8 md:flex">
          <template v-if="isMounted">
            <ULink
              v-for="link in linkList"
              :key="link.to"
              :to="link.onClick ? undefined : link.to"
              class="flex items-center space-x-2 rounded-lg px-3 py-2 transition-all duration-300 hover:bg-primary-50 dark:hover:bg-treez-800"
              :class="
                !link.onClick && link.to === $route.path
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-treez-700 dark:text-treez-300'
              "
              @click="link.onClick ? handleLinkClick(link) : undefined"
            >
              <Icon :name="link.icon" class="h-5 w-5" />
              <span class="font-medium">{{ $t(link.text) }}</span>
            </ULink>
          </template>

          <div v-if="isMounted" class="flex items-center space-x-4">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>

          <template v-else>
            <template v-for="link in linkList" :key="link.to">
              <USkeleton class="flex items-center space-x-2 rounded-lg bg-treez-200 px-3 py-2 dark:bg-treez-700">
                <USkeleton class="h-5 w-5" />
                <USkeleton class="h-4 w-24" />
              </USkeleton>
            </template>
            <USkeleton class="h-8 w-8 bg-treez-200 dark:bg-treez-700" />
            <USkeleton class="h-8 w-8 bg-treez-200 dark:bg-treez-700" />
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <div class="flex items-center space-x-4 md:hidden">
          <template v-if="isMounted">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </template>
          <button
            v-if="isMounted"
            class="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-treez-100 dark:hover:bg-treez-800"
            @click="toggleMenu"
          >
            <Icon :name="isOpen ? 'ph:x-bold' : 'ph:list-bold'" class="h-6 w-6 text-treez-700 dark:text-treez-300" />
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <template v-if="isMounted">
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div v-if="isOpen" class="py-2 md:hidden">
            <div class="space-y-1">
              <ULink
                v-for="link in linkList"
                :key="link.to"
                :to="link.onClick ? undefined : link.to"
                class="flex items-center space-x-2 rounded-lg px-4 py-3 transition-colors"
                :class="
                  !link.onClick && link.to === $route.path
                    ? 'bg-primary-50 text-primary-600 dark:bg-treez-800 dark:text-primary-400'
                    : 'text-treez-700 hover:bg-treez-50 dark:text-treez-300 dark:hover:bg-treez-800'
                "
                @click="handleLinkClick(link, true)"
              >
                <Icon :name="link.icon" class="h-5 w-5" />
                <span class="font-medium">{{ $t(link.text) }}</span>
              </ULink>
            </div>
          </div>
        </transition>
      </template>
    </div>
  </nav>
</template>

<style></style>
