<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppAlert from '../components/AppAlert.vue'
import { createAuthor, fetchAuthor, updateAuthor } from '../api/authors'
import { extractApiError } from '../api/http'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => route.name === 'author-edit')
const authorId = computed(() => (isEdit.value ? Number(route.params.id) : null))

const form = reactive({ fullName: '' })
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref<string | null>(null)

async function loadForEdit(): Promise<void> {
  if (!authorId.value) return
  try {
    const author = await fetchAuthor(authorId.value)
    form.fullName = author.full_name
  } catch (error) {
    errorMessage.value = extractApiError(error)
  }
}

function validate(): string | null {
  if (!form.fullName.trim()) return 'Укажите ФИО автора'
  return null
}

async function onSubmit(): Promise<void> {
  errorMessage.value = null
  const validationError = validate()
  if (validationError) {
    errorMessage.value = validationError
    return
  }

  saving.value = true
  try {
    const payload = { full_name: form.fullName.trim() }
    const saved = isEdit.value
      ? await updateAuthor(authorId.value as number, payload)
      : await createAuthor(payload)
    await router.push({ name: 'author-detail', params: { id: saved.id } })
  } catch (error) {
    errorMessage.value = extractApiError(error)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true
  await loadForEdit()
  loading.value = false
})
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-lg-6">
      <h1 class="h3 mb-4">
        {{ isEdit ? 'Редактирование автора' : 'Новый автор' }}
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
            <label class="form-label" for="fullName">ФИО *</label>
            <input
              id="fullName"
              v-model.trim="form.fullName"
              type="text"
              class="form-control"
              placeholder="Иванов Иван Иванович"
              required
            />
          </div>
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать' }}
            </button>
            <RouterLink class="btn btn-outline-secondary" :to="{ name: 'authors' }">
              Отмена
            </RouterLink>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>