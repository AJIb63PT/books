<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppAlert from '../components/AppAlert.vue'
import { extractApiError } from '../api/http'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({
  username: '',
  password: '',
})

const submitting = ref(false)
const errorMessage = ref<string | null>(null)

async function onSubmit(): Promise<void> {
  submitting.value = true
  errorMessage.value = null
  try {
    await auth.login({ username: form.username, password: form.password })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  } catch (error) {
    errorMessage.value = extractApiError(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-4">
      <div class="card shadow-sm">
        <div class="card-body">
          <h1 class="h4 card-title mb-4">Вход для пользователя</h1>

          <AppAlert :message="errorMessage" @close="errorMessage = null" />

          <form novalidate @submit.prevent="onSubmit">
            <div class="mb-3">
              <label class="form-label" for="username">Логин</label>
              <input
                id="username"
                v-model.trim="form.username"
                type="text"
                class="form-control"
                autocomplete="username"
                required
              />
            </div>
            <div class="mb-3">
              <label class="form-label" for="password">Пароль</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="form-control"
                autocomplete="current-password"
                required
              />
            </div>
            <button type="submit" class="btn btn-primary w-100" :disabled="submitting">
              {{ submitting ? 'Вход…' : 'Войти' }}
            </button>
          </form>
        </div>
      </div>
      <p class="text-secondary text-secondary-small mt-3 text-center">
        Гости могут просматривать каталог, авторов и отчёт. Полные права (CRUD) — у пользователей.
      </p>
    </div>
  </div>
</template>