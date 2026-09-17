<script setup lang="ts">
import type { Book } from '../types/api'

defineProps<{
  book: Book
}>()
</script>

<template>
  <div class="card h-100">
    <div class="card-img-top-wrapper bg-light">
      <img v-if="book.cover_url" :src="book.cover_url" class="book-cover" :alt="book.title" />
      <div v-else class="book-cover d-flex align-items-center justify-content-center fs-1">
        📖
      </div>
    </div>
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ book.title }}</h5>
      <div class="text-secondary mb-1">{{ book.year }} г.</div>
      <p class="card-text text-secondary-small mb-3">
        <span v-for="author in book.authors" :key="author.id" class="d-block">
          {{ author.full_name }}
        </span>
      </p>
      <RouterLink
        class="btn btn-outline-primary btn-sm mt-auto"
        :to="{ name: 'book-detail', params: { id: book.id } }"
      >
        Подробнее
      </RouterLink>
    </div>
  </div>
</template>