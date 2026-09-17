import type {
  Book,
  BookInput,
  BookListData,
} from '../types/api'
import { apiClient, unwrapData } from './http'

export interface BookListParams {
  page?: number
  perPage?: number
  search?: string
  authorId?: number
  year?: number
}

export async function fetchBooks(params: BookListParams = {}): Promise<BookListData> {
  const query: Record<string, string | number | undefined> = {
    page: params.page,
    'per-page': params.perPage,
    search: params.search || undefined,
    author_id: params.authorId,
    year: params.year,
  }
  const response = await apiClient.get('/books', { params: query })
  return unwrapData<BookListData>(response.data)
}

export async function fetchBook(id: number): Promise<Book> {
  const response = await apiClient.get(`/books/${id}`)
  return unwrapData<Book>(response.data)
}

function buildBookFormDlData(form: BookInput, cover?: File): FormData {
  const fd = new FormData()
  if (form.title !== undefined) fd.append('title', form.title)
  if (form.year !== undefined) fd.append('year', String(form.year))
  if (form.description !== undefined) fd.append('description', form.description)
  if (form.isbn !== undefined) fd.append('isbn', form.isbn)
  form.author_ids?.forEach((authorId) => fd.append('author_ids[]', String(authorId)))
  if (cover) fd.append('cover', cover)
  return fd
}

export async function createBook(form: BookInput, cover: File): Promise<Book> {
  const response = await apiClient.post('/books', buildBookFormDlData(form, cover))
  return unwrapData<Book>(response.data)
}

export async function updateBook(id: number, form: BookInput, cover?: File): Promise<Book> {
  const response = cover
    ? await apiClient.put(`/books/${id}`, buildBookFormDlData(form, cover))
    : await apiClient.patch(`/books/${id}`, form)
  return unwrapData<Book>(response.data)
}

export async function deleteBook(id: number): Promise<void> {
  await apiClient.delete(`/books/${id}`)
}