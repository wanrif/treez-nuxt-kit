<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

import type { MenuItem } from '~/types/menu'

const props = defineProps<{
  item: MenuItem
  isExpanded: boolean
  isMobile: boolean
  isActive: boolean
}>()

const emit = defineEmits<{
  (_e: 'toggle'): void
}>()

const itemRef = ref(null)

onClickOutside(itemRef, () => {
  if (props.isActive) {
    emit('toggle')
  }
})
</script>

<template>
  <div ref="itemRef" class="group/menu relative">
    <!-- Menu Item -->
    <NuxtLink
      v-if="item.to"
      :to="item.to"
      :class="[
        'flex items-center rounded-lg px-6 py-3 text-treez-600 dark:text-treez-300',
        'relative cursor-pointer overflow-hidden hover:bg-blue-100 dark:hover:bg-treez-900',
        'transform-gpu transition-all duration-300 ease-in-out',
        isExpanded || isMobile ? 'gap-x-3' : 'justify-center',
      ]"
    >
      <Icon :name="item.icon" class="h-5 w-5 flex-shrink-0 transition-transform duration-300" />
      <span
        class="origin-left transform-gpu truncate"
        :class="[
          isExpanded || isMobile ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
          'transition-all duration-300 ease-in-out',
        ]"
      >
        {{ item.label }}
      </span>
    </NuxtLink>
    <div
      v-else
      :class="[
        'flex items-center rounded-lg px-6 py-3 text-treez-600 dark:text-treez-300',
        'relative cursor-pointer overflow-hidden hover:bg-blue-100 dark:hover:bg-treez-900',
        'transform-gpu transition-all duration-300 ease-in-out',
        isExpanded || isMobile ? 'gap-x-3' : 'justify-center',
      ]"
      @click="item.subMenu ? emit('toggle') : null"
    >
      <div
        class="flex w-full min-w-0 items-center transition-all duration-300 ease-in-out"
        :class="isExpanded || isMobile ? 'justify-between' : 'justify-center'"
      >
        <div class="flex min-w-0 items-center gap-x-3">
          <Icon :name="item.icon" class="h-5 w-5 flex-shrink-0 transition-transform duration-300" />
          <span
            class="origin-left transform-gpu truncate"
            :class="[
              isExpanded || isMobile ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
              'transition-all duration-300 ease-in-out',
            ]"
          >
            {{ item.label }}
          </span>
        </div>
        <Icon
          v-if="(isExpanded || isMobile) && item.subMenu"
          name="tabler:chevron-down"
          class="h-4 w-4 flex-shrink-0 transition-transform duration-200"
          :class="{ 'rotate-180': isActive }"
        />
      </div>
    </div>

    <!-- Tooltip for collapsed state -->
    <div
      v-if="!isMobile && !isExpanded && !item.subMenu"
      class="absolute top-1/2 left-full z-[999] mx-2 -translate-y-1/2 scale-95 rounded-md bg-treez-900 px-2 py-1 text-sm whitespace-nowrap text-white opacity-0 shadow-lg transition-all duration-200 ease-in-out group-hover/menu:scale-100 group-hover/menu:opacity-100"
    >
      {{ item.label }}
    </div>

    <!-- Submenu -->
    <Transition
      name="submenu"
      @enter="(el: Element) => ((el as HTMLElement).style.height = `${(el as HTMLElement).scrollHeight}px`)"
      @leave="(el: Element) => ((el as HTMLElement).style.height = '0px')"
    >
      <div
        v-if="item.subMenu && (isExpanded || isMobile) && isActive"
        class="mt-2 overflow-hidden rounded-lg bg-treez-50/50 transition-all duration-300 dark:bg-treez-900"
      >
        <TransitionGroup name="submenu-items" tag="div" class="space-y-1 py-2">
          <NuxtLink
            v-for="subItem in item.subMenu"
            :key="subItem.label"
            :to="subItem.to"
            class="group flex items-center py-2 pr-4 pl-14 text-sm text-treez-600 transition-all duration-200 hover:bg-white/50 hover:text-blue-600 dark:text-treez-400 dark:hover:bg-treez-950 dark:hover:text-blue-400"
          >
            <Icon :name="subItem.icon" class="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            <span class="transition-transform duration-200 group-hover:translate-x-1">
              {{ subItem.label }}
            </span>
          </NuxtLink>
        </TransitionGroup>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@reference "../../assets/css/main.css";

.overflow-hidden {
  overflow: hidden;
  will-change: height, opacity;
}

/* Submenu transition */
.submenu-enter-active,
.submenu-leave-active {
  transition:
    height 0.3s ease,
    opacity 0.3s ease;
  overflow: hidden;
}

.submenu-enter-from,
.submenu-leave-to {
  height: 0;
  opacity: 0;
}

/* Submenu items transition */
.submenu-items-enter-active,
.submenu-items-leave-active {
  transition: all 0.3s ease;
}

.submenu-items-enter-from,
.submenu-items-leave-to {
  opacity: 0;
  transform: translateX(-15px);
}

.submenu-items-move {
  transition: transform 0.3s ease;
}

/* Add tooltip styles */
.group-hover\/menu\:opacity-100 {
  @apply shadow-lg;
}

.absolute.left-full {
  margin-left: 0.5rem;
  transform-origin: left center;
}
</style>
