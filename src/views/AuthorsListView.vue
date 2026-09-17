<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import AppAlert from '../components/AppAlert.vue'
import AppPagination from '../components/AppPagination.vue'
import { deleteAuthor, fetchAuthors } from '../api/authors'
import { extractApiError } from '../api/http'
import { useAuthStore } from '../stores/auth'
import type { AuthorShort, Pagination } from '../types/api'

const auth = useAuthStore()

const authors = ref<AuthorShort[]>([])
const pagination = ref<Pagination | null>(null)
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const deletingId = ref<number | null>(null)

const filters = reactive({
  page: 1,
  search: '',
})

let debounceTimer: ReturnType<typeof setTimeout> | undefined

async function loadAuthors(): Promise<void> {
  loading.value = true
  errorMessage.value = null
  try {
    const data = await fetchAuthors({
      page: filters.page,
      perPage: 20,
      search: filters.search || undefined,
    })
    authors.value = data.items
    pagination.value = data.pagination
  } catch (error) {
    errorMessage.value = extractApiError(error)
  } finally {
    loading.value = false
  }
}

function handleSearchChange(): void {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    filters.page = 1
    loadAuthors()
  }, 400)
}

function goToPage(page: number): void {
  filters.page = page
  loadAuthors()
}

async function onDelete(author: AuthorShort): Promise<void> {
  if (!window.confirm(`Удалить автора «${author.full_name}»?`)) return
  deletingId.value = author.id
  errorMessage.value = null
  try {
    await deleteAuthor(author.id)
    if (authors.value.length === 1 && filters.page > 1) filters.page -= 1
    await loadAuthors()
  } catch (error) {
    errorMessage.value = extractApiError(error)
  } finally {
    deletingId.value = null
  }
}

onMounted(loadAuthors)
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h1 class="h3 mb-0">Авторы</h1>
    <RouterLink
      v-if="auth.isAuthenticated"
      class="btn btn-primary"
      :to="{ name: 'author-create' }"
    >
      Добавить автора
    </RouterLink>
  </div>

  <div class="card mb-4">
    <div class="card-body">
      <label class="form-label" for="search">Поиск по ФИО</label>
      <input
        id="search"
        v-model.trim="filters.search"
        type="search"
        class="form-control"
        placeholder="Начните вводить ФИО…"
        @input="handleSearchChange"
      />
    </div>
  </div>

  <AppAlert :message="errorMessage" @close="errorMessage = null" />

  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Загрузка…</span>
    </div>
  </div>

  <div v-else-if="authors.length === 0" class="text-center text-secondary py-5">
    Авторы не найдены
  </div>

  <div v-else class="card">
    <div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead>
          <tr>
            <th scope="col" class="ps-3">ФИО</th>
            <th scope="col" class="text-end pe-3">
              <span class="visually-hidden">Действия</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="author in authors" :key="author.id">
            <td class="ps-3">
              <RouterLink :to="{ name: 'author-detail', params: { id: author.id } }">
                {{ author.full_name }}
              </RouterLink>
            </td>
            <td class="text-end pe-3">
              <template v-if="auth.isAuthenticated">
                <RouterLink
                  class="btn btn-sm btn-outline-primary me-1"
                  :to="{ name: 'author-edit', params: { id: author.id } }"
                >
                  Изменить
                </RouterLink>
                <button
                  class="btn btn-sm btn-outline-danger"
                  :disabled="deletingId === author.id"
                  @click="onDelete(author)"
                >
                  {{ deletingId === author.id ? 'Удаление…' : 'Удалить' }}
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-if="pagination" class="mt-4">
    <AppPagination :page="pagination.page" :total-pages="pagination.total_pages" @change="goToPage" />
  </div>
</template>