<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { PAGE_SIZES } from "../constants";
import AppAlert from "../components/AppAlert.vue";
import { fetchAuthors } from "../api/authors";
import { extractApiError } from "../api/http";
import { sendSms } from "../api/sms";
import { isValidPhone } from "../utils/phone";
import type { AuthorShort } from "../types/api";

const authors = ref<AuthorShort[]>([]);
const loadingAuthors = ref(true);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const sending = ref(false);

const form = reactive({
  authorId: "" as number | "",
  phone: "",
});

async function loadAuthors(): Promise<void> {
  loadingAuthors.value = true;
  try {
    const data = await fetchAuthors({
      page: 1,
      perPage: PAGE_SIZES.DROPDOWN_LIMIT,
    });
    authors.value = data.items;
  } catch (error) {
    errorMessage.value = extractApiError(error);
  } finally {
    loadingAuthors.value = false;
  }
}

function validate(): string | null {
  if (form.authorId === "") return "Выберите автора";
  const author = authors.value.find((item) => item.id === form.authorId);
  if (!author) return "Автор не найден";
  if (!isValidPhone(form.phone)) {
    return "Укажите телефон в формате +7XXXXXXXXXX (11 цифр)";
  }
  return null;
}

async function onSubmit(): Promise<void> {
  errorMessage.value = null;
  successMessage.value = null;

  const validationError = validate();
  if (validationError) {
    errorMessage.value = validationError;
    return;
  }

  const author = authors.value.find(
    (item) => item.id === form.authorId,
  ) as AuthorShort;
  const text = `Вы подписались на новые книги автора ${author.full_name} в каталоге книг.`;

  sending.value = true;
  try {
    await sendSms(form.phone, text);
    successMessage.value =
      "Подписка оформлена — SMS-уведомление отправлено (ключ-эмулятор smspilot, реальная отправка не происходит).";
  } catch (error) {
    errorMessage.value = extractApiError(error);
  } finally {
    sending.value = false;
  }
}

onMounted(loadAuthors);
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-lg-6">
      <h1 class="h3 mb-3">Подписка на новые книги</h1>
      <p class="text-secondary">
        Подпишитесь на автора и получайте SMS о появлении его новых книг.<br />
        Уведомления отправляются через
        <a href="https://sms-pilot.ru/" target="_blank" rel="noreferrer"
          >smspilot.ru</a
        >
        — в демо используется ключ-эмулятор, реальные SMS не отправляются.
      </p>

      <AppAlert
        :message="errorMessage"
        variant="danger"
        @close="errorMessage = null"
      />
      <AppAlert
        :message="successMessage"
        variant="success"
        @close="successMessage = null"
      />

      <div v-if="loadingAuthors" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка…</span>
        </div>
      </div>

      <form v-else class="card shadow-sm" @submit.prevent="onSubmit">
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label" for="author">Автор *</label>
            <select
              id="author"
              v-model="form.authorId"
              class="form-select"
              required
            >
              <option value="" disabled>Выберите автора…</option>
              <option
                v-for="author in authors"
                :key="author.id"
                :value="author.id"
              >
                {{ author.full_name }}
              </option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label" for="phone">Номер телефона *</label>
            <input
              id="phone"
              v-model.trim="form.phone"
              type="tel"
              class="form-control"
              placeholder="+7XXXXXXXXXX"
              required
            />
            <div class="form-text">
              На этот номер будут приходить SMS о новых книгах.
            </div>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="sending">
            {{ sending ? "Отправка…" : "Подписаться" }}
          </button>
        </div>
      </form>

      <div class="alert alert-light text-secondary text-secondary-small mt-3">
        Примечание: в спецификации бэкенда нет endpoint'а для хранения подписок,
        поэтому подписка реализована на фронте — отправка SMS напрямую через
        smspilot. В production хранение подписок и отправку SMS логичнее
        выносить на бэкенд.
      </div>
    </div>
  </div>
</template>
