import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { LoginRequest, UserInfo } from '../types/api'
import { login as loginApi } from '../api/auth'
import {
  clearAuth,
  readStoredToken,
  readStoredUser,
  storeAuth,
} from '../api/http'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(readStoredToken())
  const user = ref<UserInfo | null>(readStoredUser())

  const isAuthenticated = computed(() => Boolean(token.value))
  const isGuest = computed(() => !isAuthenticated.value)

  async function login(credentials: LoginRequest): Promise<UserInfo> {
    const data = await loginApi(credentials)
    token.value = data.token
    user.value = data.user
    storeAuth(data.token, data.user)
    return data.user
  }

  function logout(): void {
    token.value = null
    user.value = null
    clearAuth()
  }

  return { token, user, isAuthenticated, isGuest, login, logout }
})