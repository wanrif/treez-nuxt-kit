<script setup lang="ts">
useHead({
  bodyAttrs: {
    class: 'bg-white dark:bg-treez-900',
  },
})
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-t from-primary-50 to-white backdrop-blur-sm dark:from-treez-950 dark:to-treez-900"
  >
    <header class="fixed top-0 right-0 flex gap-4 p-4">
      <ThemeSwitcher />
      <LanguageSwitcher />
    </header>
    <slot />
  </div>
</template>
