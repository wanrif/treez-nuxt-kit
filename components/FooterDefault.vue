<script setup lang="ts">
const currentYear = computed(() => new Date().getFullYear().toString())
</script>

<template>
  <footer class="bg-treez-950 py-12 text-white">
    <div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
      <p>&copy; {{ currentYear }} Treez-Nuxtkit. {{ $t('footer_rights') }}</p>
    </div>
  </footer>
</template>
