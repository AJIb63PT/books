<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  totalPages: number
}>()

const emit = defineEmits<{
  change: [page: number]
}>()

function range(from: number, to: number): number[] {
  const result: number[] = []
  for (let i = from; i <= to; i += 1) result.push(i)
  return result
}

const items = computed<Array<number | '...'>>(() => {
  const { page, totalPages } = props
  if (totalPages <= 7) return range(1, totalPages)
  const start = Math.max(2, page - 2)
  const end = Math.min(totalPages - 1, page + 2)
  return [
    1,
    ...(start > 2 ? (['...'] as const) : []),
    ...range(start, end),
    ...(end < totalPages - 1 ? (['...'] as const) : []),
    totalPages,
  ]
})

function go(next: number): void {
  if (next < 1 || next > props.totalPages || next === props.page) return
  emit('change', next)
}
</script>

<template>
  <nav v-if="totalPages > 1" aria-label="Пагинация">
    <ul class="pagination justify-content-center">
      <li class="page-item" :class="{ disabled: page <= 1 }">
        <button type="button" class="page-link" aria-label="Назад" @click="go(page - 1)">‹</button>
      </li>
      <li
        v-for="(item, index) in items"
        :key="index"
        class="page-item"
        :class="{ active: item === page, disabled: item === '...' }"
      >
        <button
          v-if="item !== '...'"
          type="button"
          class="page-link"
          @click="go(item)"
          :aria-current="item === page ? 'page' : undefined"
        >
          {{ item }}
        </button>
        <span v-else class="page-link">…</span>
      </li>
      <li class="page-item" :class="{ disabled: page >= totalPages }">
        <button type="button" class="page-link" aria-label="Вперёд" @click="go(page + 1)">›</button>
      </li>
    </ul>
  </nav>
</template>