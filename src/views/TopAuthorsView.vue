<script setup lang="ts">
import { ref } from 'vue'
import AppAlert from '../components/AppAlert.vue'
import { extractApiError } from '../api/http'
import { fetchTopAuthors } from '../api/reports'
import type { TopAuthor } from '../types/api'

const defaultYear = String(new Date().getFullYear())
const year = ref(defaultYear)
const items = ref<TopAuthor[]>([])
const loadedYear = ref<number | null>(null)
const loading = ref(false)
const errorMessage = ref<string | null>(null)

async function loadReport(): Promise<void> {
  errorMessage.value = null
  const parsed = Number(year.value)
  if (!year.value || Number.isNaN(parsed) || parsed < 1000 || parsed > 2100) {
    errorMessage.value = 'Укажите корректный год (1000–2100)'
    return
  }

  loading.value = true
  try {
    const data = await fetchTopAuthors(parsed)
    items.value = data.items
    loadedYear.value = data.year
  } catch (error) {
    errorMessage.value = extractApiError(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <h1 class="h3 mb-4">ТОП-10 авторов по количеству книг</h1>

  <div class="card mb-4">
    <div class="card-body">
      <form class="row g-3 align-items-end" @submit.prevent="loadReport">
        <div class="col-md-3">
          <label class="form-label" for="year">Год</label>
          <input
            id="year"
            v-model.trim="year"
            type="number"
            class="form-control"
            min="1000"
            max="2100"
            required
          />
        </div>
        <div class="col-md-3">
          <button type="submit" class="btn btn-primary w-100" :disabled="loading">
            {{ loading ? 'Загрузка…' : 'Показать' }}
          </button>
        </div>
      </form>
      <AppAlert class="mt-3" :message="errorMessage" @close="errorMessage = null" />
    </div>
  </div>

  <div v-if="loadedYear !== null" class="card">
    <div class="card-header">Авторы, выпустившие больше всего книг в {{ loadedYear }} году</div>
    <div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Автор</th>
            <th scope="col" class="text-end pe-4">Книг</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.author_id">
            <td>
              <span class="badge text-bg-secondary">{{ item.rank }}</span>
            </td>
            <td>
              <RouterLink :to="{ name: 'author-detail', params: { id: item.author_id } }">
                {{ item.full_name }}
              </RouterLink>
            </td>
            <td class="text-end pe-4 fw-semibold">{{ item.books_count }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>