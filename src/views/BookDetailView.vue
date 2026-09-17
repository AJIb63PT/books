<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppAlert from "../components/AppAlert.vue";
import AppConfirm from "../components/AppConfirm.vue";
import { deleteBook, fetchBook } from "../api/books";
import { extractApiError } from "../api/http";
import { useAuthStore } from "../stores/auth";
import type { Book } from "../types/api";

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const book = ref<Book | null>(null);
const loading = ref(true);
const deleting = ref(false);
const errorMessage = ref<string | null>(null);
const confirmRef = ref<InstanceType<typeof AppConfirm> | null>(null);

const confirmMessage = computed(() =>
  book.value ? `Удалить книгу «${book.value.title}»?` : "",
);

async function loadBook(): Promise<void> {
  loading.value = true;
  errorMessage.value = null;
  try {
    book.value = await fetchBook(Number(route.params.id));
  } catch (error) {
    errorMessage.value = extractApiError(error);
  } finally {
    loading.value = false;
  }
}

async function onDelete(): Promise<void> {
  const confirmed = await confirmRef.value?.open();
  if (!confirmed || !book.value) return;
  deleting.value = true;
  errorMessage.value = null;
  try {
    await deleteBook(book.value.id);
    await router.push({ name: "books" });
  } catch (error) {
    errorMessage.value = extractApiError(error);
  } finally {
    deleting.value = false;
  }
}

onMounted(loadBook);
</script>

<template>
  <AppAlert :message="errorMessage" @close="errorMessage = null" />

  <AppConfirm ref="confirmRef" :message="confirmMessage" />

  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Загрузка…</span>
    </div>
  </div>

  <div v-else-if="book" class="row g-4">
    <div class="col-md-4">
      <div class="card-img-top-wrapper rounded border bg-light">
        <img
          v-if="book.cover_url"
          :src="book.cover_url"
          class="book-cover"
          :alt="book.title"
        />
        <div
          v-else
          class="book-cover d-flex align-items-center justify-content-center fs-1"
        >
          📖
        </div>
      </div>
    </div>

    <div class="col-md-8">
      <h1 class="h3 mb-2">{{ book.title }}</h1>
      <div class="text-secondary mb-3">
        {{ book.year }} г., ISBN: {{ book.isbn || "—" }}
      </div>

      <h2 class="h5 mb-2">Авторы</h2>
      <p v-if="book.authors.length" class="mb-3">
        <RouterLink
          v-for="author in book.authors"
          :key="author.id"
          :to="{ name: 'author-detail', params: { id: author.id } }"
          class="btn btn-sm btn-outline-secondary me-2 mb-1"
        >
          {{ author.full_name }}
        </RouterLink>
      </p>
      <p v-else class="text-secondary mb-3">Авторы не указаны</p>

      <h2 class="h5 mb-2">Описание</h2>
      <p class="text-secondary">
        {{ book.description || "Описание отсутствует" }}
      </p>

      <div v-if="auth.isAuthenticated" class="mt-4 d-flex gap-2">
        <RouterLink
          class="btn btn-outline-primary"
          :to="{ name: 'book-edit', params: { id: book.id } }"
        >
          Редактировать
        </RouterLink>
        <button
          class="btn btn-outline-danger"
          :disabled="deleting"
          @click="onDelete"
        >
          {{ deleting ? "Удаление…" : "Удалить" }}
        </button>
      </div>
    </div>
  </div>

  <div v-else class="text-center text-secondary py-5">Книга не найдена</div>
</template>
