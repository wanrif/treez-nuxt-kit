<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const { t } = useI18n()

useHead({
  title: t('all_products'),
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold">{{ t('all_products') }}</h1>
    <!-- Add your page content for listing products here -->
    <p>Product listing will go here.</p>
  </div>
</template>
