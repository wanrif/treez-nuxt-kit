<script lang="ts" setup>
import { AUTH_TRUSTED_PERIOD } from '~/constant'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'submitTrust'])

const { t } = useI18n()

const internalOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const handleTrustChoice = (trust: boolean) => {
  emit('submitTrust', trust)
  // The parent component will handle closing the modal by setting modelValue to false
  // after processing the submitTrust event.
}
</script>

<template>
  <UModal v-model:open="internalOpen" :prevent-close="props.loading">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base leading-6 font-semibold text-gray-900 dark:text-white">
              {{ t('trusted_device_modal_title') }}
            </h3>
          </div>
        </template>

        <div class="flex flex-col items-center gap-4 p-4 text-center">
          <UIcon name="i-lucide:monitor-smartphone" class="text-5xl text-primary-500 dark:text-primary-400" />
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('trusted_device_modal_description', { period: AUTH_TRUSTED_PERIOD }) }}
          </p>
        </div>

        <template #footer>
          <div class="flex w-full gap-3">
            <UButton
              :label="t('trusted_device_modal_option_no')"
              color="neutral"
              variant="solid"
              class="flex-1 justify-center"
              :loading="props.loading"
              :disabled="props.loading"
              @click="handleTrustChoice(false)"
            />
            <UButton
              :label="t('trusted_device_modal_option_yes')"
              color="primary"
              variant="solid"
              class="flex-1 justify-center"
              :loading="props.loading"
              :disabled="props.loading"
              @click="handleTrustChoice(true)"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<style></style>
