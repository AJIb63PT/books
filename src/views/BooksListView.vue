<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { PAGE_SIZES } from "../constants";
import AppAlert from "../components/AppAlert.vue";
import AppPagination from "../components/AppPagination.vue";
import BookCard from "../components/BookCard.vue";
import { fetchAuthors } from "../api/authors";
import { fetchBooks } from "../api/books";
import { extractApiError } from "../api/http";
import { useAuthStore } from "../stores/auth";
import type { AuthorShort, Book, Pagination } from "../types/api";

const auth = useAuthStore();

const books = ref<Book[]>([]);
const pagination = ref<Pagination | null>(null);
const authors = ref<AuthorShort[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const filterError = ref<string | null>(null);

const filters = reactive({
  page: 1,
  search: "",
  year: "",
  authorId: "" as number | "",
});

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let loadSeq = 0;

async function loadBooks(): Promise<void> {
  const seq = ++loadSeq;
  loading.value = true;
  errorMessage.value = null;
  try {
    const data = await fetchBooks({
      page: filters.page,
      perPage: PAGE_SIZES.BOOKS,
      search: filters.search || undefined,
      year: filters.year ? Number(filters.year) : undefined,
      authorId: filters.authorId === "" ? undefined : Number(filters.authorId),
    });
    if (seq !== loadSeq) return;
    books.value = data.items;
    pagination.value = data.pagination;
  } catch (error) {
    if (seq !== loadSeq) return;
    errorMessage.value = extractApiError(error);
  } finally {
    if (seq === loadSeq) loading.value = false;
  }
}

function applyFilters(): void {
  filters.page = 1;
  loadBooks();
}

function scheduleReload(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(applyFilters, 400);
}

function goToPage(page: number): void {
  filters.page = page;
  loadBooks();
}

const hasActiveFilters = computed(
  () => filters.search !== "" || filters.year !== "" || filters.authorId !== "",
);

function clearFilters(): void {
  filters.search = "";
  filters.year = "";
  filters.authorId = "";
  applyFilters();
}

watch(
  () => [filters.year, filters.authorId],
  () => scheduleReload(),
);

onMounted(async () => {
  loadBooks();
  try {
    const data = await fetchAuthors({
      page: 1,
      perPage: PAGE_SIZES.DROPDOWN_LIMIT,
    });
    authors.value = data.items;
  } catch (error) {
    filterError.value = extractApiError(error);
  }
});
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h1 class="h3 mb-0">Книги</h1>
    <RouterLink
      v-if="auth.isAuthenticated"
      class="btn btn-primary"
      :to="{ name: 'book-create' }"
    >
      Добавить книгу
    </RouterLink>
  </div>

  <div class="card mb-4">
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label" for="search">Поиск</label>
          <input
            id="search"
            v-model.trim="filters.search"
            type="search"
            class="form-control"
            placeholder="Название, ISBN…"
            @input="scheduleReload"
          />
        </div>
        <div class="col-md-4">
          <label class="form-label" for="year">Год выпуска</label>
          <input
            id="year"
            v-model.trim="filters.year"
            type="number"
            class="form-control"
            min="1000"
            max="2100"
            placeholder="Например, 2024"
          />
        </div>
        <div class="col-md-4">
          <label class="form-label" for="author">Автор</label>
          <select id="author" v-model="filters.authorId" class="form-select">
            <option :value="''">Все авторы</option>
            <option
              v-for="author in authors"
              :key="author.id"
              :value="author.id"
            >
              {{ author.full_name }}
            </option>
          </select>
        </div>
      </div>
      <div class="d-flex justify-content-end mt-3">
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          :disabled="!hasActiveFilters"
          @click="clearFilters"
        >
          Очистить фильтры
        </button>
      </div>
      <AppAlert
        class="mt-3"
        :message="filterError"
        @close="filterError = null"
      />
    </div>
  </div>

  <AppAlert :message="errorMessage" @close="errorMessage = null" />

  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Загрузка…</span>
    </div>
  </div>

  <div v-else-if="books.length === 0" class="text-center text-secondary py-5">
    Книги не найдены
  </div>

  <div
    v-else
    class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-4 g-4"
  >
    <div v-for="book in books" :key="book.id" class="col">
      <BookCard :book="book" />
    </div>
  </div>

  <div v-if="pagination" class="mt-4">
    <AppPagination
      :page="pagination.page"
      :total-pages="pagination.total_pages"
      @change="goToPage"
    />
  </div>
</template>
