<template>
  <div class="relative flex min-h-screen flex-col scroll-smooth bg-white antialiased dark:bg-treez-950">
    <NavigationBar
      class="sticky top-0 z-50 bg-gradient-to-t from-primary-50 to-white backdrop-blur-sm dark:border-treez-800 dark:bg-treez-950 dark:bg-gradient-to-t dark:from-treez-950 dark:to-treez-950"
    />
    <main class="flex-grow">
      <slot />
    </main>
    <FooterDefault />
  </div>
</template>

<script setup></script>

<style>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
