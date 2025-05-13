<script setup lang="ts">
import { Button, Container, Font, Head, Hr, Html, Section, Tailwind, Text } from '@vue-email/components'

defineProps({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <Html lang="en">
    <Head>
      <title>Verify Your Email Address</title>
      <link rel="preconnect" href="https://fonts.bunny.net" />
      <link href="https://fonts.bunny.net/css?family=sofia-sans:400,500,600,800,900" rel="stylesheet" />
      <Font
        font-family="Sofia Sans"
        fallback-font-family="sans-serif"
        :web-font="{
          url: 'https://fonts.bunny.net/css?family=sofia-sans:400,500,600,800,900',
          format: 'woff2',
        }"
        :font-weight="400"
        font-style="normal"
      />
    </Head>
    <Tailwind
      :config="
        {
          theme: {
            extend: {
              fontFamily: {
                sans: ['Sofia Sans', 'sans-serif'],
              },
            },
          },
        } as any
      "
    >
      <Container
        class="relative mx-auto my-12 box-border max-w-[500px] rounded-lg border border-solid border-gray-200 p-8 font-sans antialiased"
      >
        <Section>
          <Text class="text-2xl font-bold text-gray-800">Verify Your Email Address</Text>
          <Text class="mt-4 text-gray-600">
            Thank you for registering. Please verify your email address to complete your registration and activate your
            account.
          </Text>
          <Text class="mb-6 text-gray-600"> To verify your email, click the button below: </Text>
          <div class="flex justify-center">
            <Button
              :href="url"
              class="w-full rounded-lg bg-emerald-600 px-4 py-2 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-emerald-200 focus:outline-none"
            >
              Verify Email
            </Button>
          </div>
          <Text class="mt-6 text-sm text-gray-500">
            This link will expire in 1 hour. If you need a new verification link, please make another request.
          </Text>
          <Hr class="my-6 border-gray-200" />
          <Text class="text-xs text-gray-400">
            If you're having trouble clicking the button, copy and paste this URL into your browser:
            <span class="mt-2 block break-all text-emerald-500">{{ url }}</span>
          </Text>
        </Section>
      </Container>
    </Tailwind>
  </Html>
</template>
