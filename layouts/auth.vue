<script setup lang="ts">
useHead({
  bodyAttrs: {
    class: 'bg-white dark:bg-brand-900',
  },
})
</script>

<template>
  <div class="min-h-screen">
    <header class="fixed top-0 right-0 flex gap-4 p-4">
      <ThemeSwitcher />
      <LanguageSwitcher />
    </header>
    <slot />
  </div>
</template>
