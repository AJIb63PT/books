<script setup lang="ts">
defineProps<{
  message: string | null
  variant?: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <div
    v-if="message"
    :class="['alert', `alert-${variant || 'danger'}`, 'alert-dismissible', 'fade', 'show']"
    role="alert"
  >
    {{ message }}
    <button type="button" class="btn-close" aria-label="Закрыть" @click="$emit('close')"></button>
  </div>
</template>