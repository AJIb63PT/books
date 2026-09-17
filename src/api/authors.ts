import type { Author, AuthorInput, AuthorListData } from "../types/api";
import { apiClient, unwrapData } from "./http";

export interface AuthorListParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export async function fetchAuthors(
  params: AuthorListParams = {},
): Promise<AuthorListData> {
  const query: Record<string, string | number | undefined> = {
    page: params.page,
    "per-page": params.perPage,
    search: params.search || undefined,
  };
  const response = await apiClient.get("/authors", { params: query });
  return unwrapData<AuthorListData>(response.data);
}

export async function fetchAuthor(id: number): Promise<Author> {
  const response = await apiClient.get(`/authors/${id}`);
  return unwrapData<Author>(response.data);
}

export async function createAuthor(input: AuthorInput): Promise<Author> {
  const response = await apiClient.post("/authors", input);
  return unwrapData<Author>(response.data);
}

export async function updateAuthor(
  id: number,
  input: AuthorInput,
): Promise<Author> {
  const response = await apiClient.put(`/authors/${id}`, input);
  return unwrapData<Author>(response.data);
}

export async function deleteAuthor(id: number): Promise<void> {
  await apiClient.delete(`/authors/${id}`);
}
