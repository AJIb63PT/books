import axios, { AxiosError } from "axios";
import type { ApiError, UserInfo } from "../types/api";

export const TOKEN_STORAGE_KEY = "books_catalog_token";
export const USER_STORAGE_KEY = "books_catalog_user";

export function readStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function readStoredUser(): UserInfo | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

export function storeAuth(token: string, user: UserInfo): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export const UNAUTHORIZED_EVENT = "books:unauthorized";

export function notifyUnauthorized(): void {
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}

export function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    const payload = axiosError.response?.data;
    if (payload?.errors?.length) {
      return payload.errors.map((item) => item.message).join("; ");
    }
    if (axiosError.response?.status === 401) return "Неверные учётные данные";
    if (axiosError.message) return axiosError.message;
  }
  if (error instanceof Error) return error.message;
  return "Неизвестная ошибка";
}

function isApiResponse<T>(
  payload: unknown,
): payload is { success: boolean; data: T } {
  return typeof payload === "object" && payload !== null && "data" in payload;
}

export function unwrapData<T>(payload: unknown): T {
  if (isApiResponse<T>(payload) && payload.success) return payload.data;
  throw new Error("Некорректный ответ сервера");
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = readStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      const hadToken = Boolean(readStoredToken());
      clearAuth();
      if (hadToken) notifyUnauthorized();
    }
    return Promise.reject(error);
  },
);
