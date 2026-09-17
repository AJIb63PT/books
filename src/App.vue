<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()
const router = useRouter()

function onLogout(): void {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <RouterLink class="navbar-brand" :to="{ name: 'books' }">
        📚 Каталог книг
      </RouterLink>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNav"
        aria-controls="mainNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div id="mainNav" class="collapse navbar-collapse">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'books' }">Книги</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'authors' }">Авторы</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'top-authors' }">ТОП авторов</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'subscribe' }">Подписка</RouterLink>
          </li>
        </ul>
        <ul class="navbar-nav">
          <template v-if="auth.isAuthenticated">
            <li class="nav-item">
              <RouterLink
                v-if="auth.user"
                class="nav-link"
                :to="{ name: 'book-create' }"
              >
                Добавить книгу
              </RouterLink>
            </li>
            <li class="nav-item">
              <span class="nav-link text-light-emphasis">{{ auth.user?.username }}</span>
            </li>
            <li class="nav-item">
              <button type="button" class="nav-link btn btn-link" @click="onLogout">
                Выйти
              </button>
            </li>
          </template>
          <li v-else class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'login' }">Войти</RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <main class="container py-4 min-vh-main">
    <RouterView />
  </main>

  <footer class="border-top py-3 text-center text-secondary text-secondary-small">
    Каталог книг · Vue 3 + TypeScript + Bootstrap
  </footer>
</template>