import type { LoginData, LoginRequest } from "../types/api";
import { apiClient, unwrapData } from "./http";

export async function login(body: LoginRequest): Promise<LoginData> {
  const response = await apiClient.post("/auth/login", body);
  return unwrapData<LoginData>(response.data);
}
