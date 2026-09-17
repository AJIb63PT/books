<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppAlert from "../components/AppAlert.vue";
import { PAGE_SIZES } from "../constants";
import { fetchAuthors } from "../api/authors";
import { createBook, fetchBook, updateBook } from "../api/books";
import { extractApiError } from "../api/http";
import type { AuthorShort, Book } from "../types/api";

const route = useRoute();
const router = useRouter();

const isEdit = computed(() => route.name === "book-edit");
const bookId = computed(() => (isEdit.value ? Number(route.params.id) : null));

const form = reactive({
  title: "",
  year: "" as string | number,
  description: "",
  isbn: "",
  authorIds: [] as number[],
});

const cover = ref<File | null>(null);
const coverUrl = ref<string | null>(null);

const authors = ref<AuthorShort[]>([]);
const loading = ref(true);
const saving = ref(false);
const errorMessage = ref<string | null>(null);

async function loadAuthors(): Promise<void> {
  try {
    const data = await fetchAuthors({
      page: 1,
      perPage: PAGE_SIZES.DROPDOWN_LIMIT,
    });
    authors.value = data.items;
  } catch (error) {
    errorMessage.value = extractApiError(error);
  }
}

async function loadBookForEdit(): Promise<void> {
  if (!bookId.value) return;
  try {
    const book = await fetchBook(bookId.value);
    form.title = book.title;
    form.year = book.year;
    form.description = book.description ?? "";
    form.isbn = book.isbn ?? "";
    form.authorIds = book.authors.map((author) => author.id);
    coverUrl.value = book.cover_url ?? null;
  } catch (error) {
    errorMessage.value = extractApiError(error);
  }
}

function onCoverChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  cover.value = file;
  if (file) coverUrl.value = URL.createObjectURL(file);
  else coverUrl.value = null;
}

function validate(): string | null {
  if (!form.title.trim()) return "Укажите название книги";
  const year = Number(form.year);
  if (!form.year || Number.isNaN(year) || year < 1000 || year > 2100) {
    return "Укажите корректный год выпуска (1000–2100)";
  }
  if (form.authorIds.length === 0) return "Выберите хотя бы одного автора";
  if (!isEdit.value && !cover.value) return "Загрузите обложку книги";
  return null;
}

async function onSubmit(): Promise<void> {
  errorMessage.value = null;
  const validationError = validate();
  if (validationError) {
    errorMessage.value = validationError;
    return;
  }

  saving.value = true;
  try {
    const payload = {
      title: form.title.trim(),
      year: Number(form.year),
      description: form.description.trim() || undefined,
      isbn: form.isbn.trim() || undefined,
      author_ids: form.authorIds,
    };

    const saved: Book = isEdit.value
      ? await updateBook(
          bookId.value as number,
          payload,
          cover.value ?? undefined,
        )
      : await createBook(payload, cover.value as File);

    await router.push({ name: "book-detail", params: { id: saved.id } });
  } catch (error) {
    errorMessage.value = extractApiError(error);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  loading.value = true;
  await Promise.all([loadAuthors(), loadBookForEdit()]);
  loading.value = false;
});
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <h1 class="h3 mb-4">
        {{ isEdit ? "Редактирование книги" : "Новая книга" }}
      </h1>

      <AppAlert :message="errorMessage" @close="errorMessage = null" />

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка…</span>
        </div>
      </div>

      <form v-else class="card shadow-sm" @submit.prevent="onSubmit">
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label" for="title">Название *</label>
            <input
              id="title"
              v-model.trim="form.title"
              type="text"
              class="form-control"
              required
            />
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="year">Год выпуска *</label>
              <input
                id="year"
                v-model.number="form.year"
                type="number"
                class="form-control"
                min="1000"
                max="2100"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="isbn">ISBN</label>
              <input
                id="isbn"
                v-model.trim="form.isbn"
                type="text"
                class="form-control"
                placeholder="978-5-0000-0000-0"
              />
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="description">Описание</label>
            <textarea
              id="description"
              v-model.trim="form.description"
              class="form-control"
              rows="4"
            ></textarea>
          </div>

          <div class="mb-3">
            <label class="form-label" for="author-select">Авторы *</label>
            <select
              id="author-select"
              v-model="form.authorIds"
              class="form-select"
              multiple
              size="6"
              required
            >
              <option
                v-for="author in authors"
                :key="author.id"
                :value="author.id"
              >
                {{ author.full_name }}
              </option>
            </select>
            <div class="form-text">
              Удерживайте Ctrl (Cmd), чтобы выбрать несколько авторов.
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="cover"
              >Обложка {{ isEdit ? "" : "*" }}</label
            >
            <input
              id="cover"
              type="file"
              class="form-control"
              accept="image/*"
              :required="!isEdit"
              @change="onCoverChange"
            />
            <div class="form-text">
              {{
                isEdit
                  ? "Обложка меняется только при выборе нового файла."
                  : "Изображение обложки (JPEG/PNG)."
              }}
            </div>
            <div class="mt-2" v-if="coverUrl">
              <img
                :src="coverUrl"
                alt="Обложка"
                class="img-thumbnail"
                style="max-height: 180px"
              />
            </div>
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? "Сохранение…" : isEdit ? "Сохранить" : "Создать" }}
            </button>
            <RouterLink
              class="btn btn-outline-secondary"
              :to="{ name: 'books' }"
            >
              Отмена
            </RouterLink>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
