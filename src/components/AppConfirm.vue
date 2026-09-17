<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  title?: string;
  message: string;
  okText?: string;
  cancelText?: string;
  variant?: string;
}>();

const show = ref(false);
let resolver: ((value: boolean) => void) | null = null;

function open(): Promise<boolean> {
  show.value = true;
  return new Promise<boolean>((resolve) => {
    resolver = resolve;
  });
}

function close(result: boolean): void {
  show.value = false;
  resolver?.(result);
  resolver = null;
}

defineExpose({ open });
</script>

<template>
  <div
    v-if="show"
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-title"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="confirm-title">
            {{ title || "Подтверждение" }}
          </h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Закрыть"
            @click="close(false)"
          ></button>
        </div>
        <div class="modal-body">{{ message }}</div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="close(false)"
          >
            {{ cancelText || "Отмена" }}
          </button>
          <button
            type="button"
            :class="variant ? `btn btn-${variant}` : 'btn btn-danger'"
            @click="close(true)"
          >
            {{ okText || "Удалить" }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop show"></div>
</template>
