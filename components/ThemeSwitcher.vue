<script lang="ts" setup>
const { isDark, updateTheme } = useThemeManager()
const isAnimating = ref(false)
const isMounted = useMounted()

const toggleTheme = () => {
  isAnimating.value = true
  updateTheme(isDark.value ? 'light' : 'dark')
  setTimeout(() => {
    isAnimating.value = false
  }, 500)
}
</script>

<template>
  <UButton
    v-if="isMounted"
    :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
    variant="ghost"
    aria-label="Theme"
    :class="[
      'transition-all duration-300 ease-in-out',
      'hover:scale-110 hover:rotate-12',
      isAnimating && 'animate-theme-switch',
    ]"
    @click="toggleTheme"
  />

  <USkeleton v-else class="h-8 w-8 bg-gray-200 dark:bg-gray-700" />
</template>

<style scoped>
@keyframes theme-switch {
  0% {
    transform: rotate(0) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(0.8);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

.animate-theme-switch {
  animation: theme-switch 0.5s ease-in-out;
}
</style>
