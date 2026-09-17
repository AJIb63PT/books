<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppAlert from "../components/AppAlert.vue";
import AppConfirm from "../components/AppConfirm.vue";
import { deleteAuthor, fetchAuthor } from "../api/authors";
import { extractApiError } from "../api/http";
import { useAuthStore } from "../stores/auth";
import { countWords } from "../utils/plural";
import type { Author } from "../types/api";

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const author = ref<Author | null>(null);
const loading = ref(true);
const deleting = ref(false);
const errorMessage = ref<string | null>(null);
const confirmRef = ref<InstanceType<typeof AppConfirm> | null>(null);

const booksCount = computed(() =>
  countWords(author.value?.books?.length ?? 0, {
    one: "книга",
    few: "книги",
    many: "книг",
  }),
);

const confirmMessage = computed(() =>
  author.value ? `Удалить автора «${author.value.full_name}»?` : "",
);

async function loadAuthor(): Promise<void> {
  loading.value = true;
  errorMessage.value = null;
  try {
    author.value = await fetchAuthor(Number(route.params.id));
  } catch (error) {
    errorMessage.value = extractApiError(error);
  } finally {
    loading.value = false;
  }
}

async function onDelete(): Promise<void> {
  const confirmed = await confirmRef.value?.open();
  if (!confirmed || !author.value) return;
  deleting.value = true;
  errorMessage.value = null;
  try {
    await deleteAuthor(author.value.id);
    await router.push({ name: "authors" });
  } catch (error) {
    errorMessage.value = extractApiError(error);
  } finally {
    deleting.value = false;
  }
}

onMounted(loadAuthor);
</script>

<template>
  <AppAlert :message="errorMessage" @close="errorMessage = null" />

  <AppConfirm ref="confirmRef" :message="confirmMessage" />

  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Загрузка…</span>
    </div>
  </div>

  <div v-else-if="author">
    <div class="d-flex justify-content-between align-items-start mb-4">
      <div>
        <h1 class="h3 mb-1">{{ author.full_name }}</h1>
        <div class="text-secondary">{{ booksCount }} в каталоге</div>
      </div>
      <div v-if="auth.isAuthenticated" class="d-flex gap-2">
        <RouterLink
          class="btn btn-outline-primary"
          :to="{ name: 'author-edit', params: { id: author.id } }"
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

    <h2 class="h5 mb-3">Книги автора</h2>
    <div v-if="author.books?.length" class="grid g-3">
      <div
        v-for="book in author.books"
        :key="book.id"
        class="g-col-6 d-flex justify-content-between align-items-center border rounded p-3"
      >
        <div>
          <div class="fw-semibold">{{ book.title }}</div>
          <div class="text-secondary text-secondary-small">
            {{ book.year }} г.
          </div>
        </div>
        <RouterLink
          class="btn btn-sm btn-outline-primary"
          :to="{ name: 'book-detail', params: { id: book.id } }"
        >
          Подробнее
        </RouterLink>
      </div>
    </div>
    <div v-else class="text-secondary">Книги не найдены</div>
  </div>

  <div v-else class="text-center text-secondary py-5">Автор не найден</div>
</template>
