<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'

const { locale } = useI18n()

const lang = computed(() => locales[locale.value].code)
const dir = computed(() => locales[locale.value].dir)

useHead({
  htmlAttrs: {
    lang,
    dir,
  },
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | Treez-Nuxtkit` : 'Treez-Nuxtkit'
  },
  meta: [
    {
      name: 'description',
      content: 'This is Treez-Nuxtkit, let me tell you all about it.',
    },
    {
      property: 'og:title',
      content: 'Treez-Nuxtkit',
    },
    {
      property: 'og:description',
      content: 'This is Treez-Nuxtkit, let me tell you all about it.',
    },
    {
      property: 'og:image',
      content: 'https://Treez-Nuxtkit.com/image.png',
    },
  ],
})
</script>

<template>
  <NuxtLoadingIndicator />
  <UApp :locale="locales[locale]">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
