<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'

const runtimeConfig = useRuntimeConfig()
const { locale } = useI18n()

const lang = computed(() => locales[locale.value].code)
const dir = computed(() => locales[locale.value].dir)

useHead({
  htmlAttrs: {
    lang,
    dir,
  },
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | ${runtimeConfig.public.appName}` : runtimeConfig.public.appName
  },
  meta: [
    {
      name: 'description',
      content: `This is ${runtimeConfig.public.appName}, let me tell you all about it.`,
    },
    {
      property: 'og:title',
      content: runtimeConfig.public.appName,
    },
    {
      property: 'og:description',
      content: `This is ${runtimeConfig.public.appName}, let me tell you all about it.`,
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
