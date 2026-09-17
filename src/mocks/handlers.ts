import { http, HttpResponse } from 'msw'
import type {
  Author,
  AuthorInput,
  Book,
  BookInput,
  LoginRequest,
  Pagination,
  TopAuthor,
} from '../types/api'
import {
  MOCK_TOKEN,
  authorsByIds,
  mockAuthors,
  mockBooks,
  mockUsers,
  nextAuthorId,
  nextBookId,
  removeBookAuthorLinks,
} from './data'

function ok<T>(data: T, status = 200) {
  return HttpResponse.json({ success: true, data }, { status })
}

function fail(message: string, status: number, field?: string) {
  return HttpResponse.json(
    { success: false, errors: field ? [{ field, message }] : [{ message }] },
    { status },
  )
}

function unauthorized() {
  return fail('Неавторизован', 401)
}

function isAuthed(request: Request): boolean {
  return request.headers.get('Authorization') === `Bearer ${MOCK_TOKEN}`
}

function paginate<T>(
  items: T[],
  page: number,
  perPage: number,
): { items: T[]; pagination: Pagination } {
  const total = items.length
  const totalPages = perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * perPage
  return {
    items: items.slice(start, start + perPage),
    pagination: { total, page: safePage, per_page: perPage, total_pages: totalPages },
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

async function fileToDataUrl(file: File): Promise<string | undefined> {
  const type = file.type || 'image/png'
  if (!type.startsWith('image/')) return undefined
  const buffer = await file.arrayBuffer()
  return `data:${type};base64,${bytesToBase64(new Uint8Array(buffer))}`
}

function validateBookFields(
  title: string,
  year: number,
  authorIds: number[],
  coverRequired: boolean,
  hasCover: boolean,
): Response | null {
  if (!title) return fail('Название не может быть пустым', 422, 'title')
  if (!year || Number.isNaN(year) || year < 1000 || year > 2100) {
    return fail('Год должен быть числом от 1000 до 2100', 422, 'year')
  }
  if (authorIds.length === 0) return fail('Выберите хотя бы одного автора', 422, 'author_ids')
  if (coverRequired && !hasCover) return fail('Обложка обязательна', 422, 'cover')
  return null
}

export const handlers = [
  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as LoginRequest
    const user = mockUsers.find(
      (item) => item.username === body.username && item.password === body.password,
    )
    if (!user) return fail('Неверные учётные данные', 401)

    const expiresAt = new Date(Date.now() + 8 * 3600 * 1000).toISOString()
    return ok({
      token: MOCK_TOKEN,
      expires_at: expiresAt,
      user: { id: user.id, username: user.username, role: user.role },
    })
  }),

  http.get('/api/v1/books', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || 1)
    const perPage = Number(url.searchParams.get('per-page') || 20)
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()
    const year = Number(url.searchParams.get('year'))
    const authorId = Number(url.searchParams.get('author_id'))

    let items = mockBooks
    if (search) {
      items = items.filter((book) =>
        `${book.title} ${book.isbn ?? ''} ${book.description ?? ''}`
          .toLowerCase()
          .includes(search),
      )
    }
    if (year) items = items.filter((book) => book.year === year)
    if (authorId) items = items.filter((book) => book.authors.some((a) => a.id === authorId))

    items = [...items].sort((a, b) => b.year - a.year || b.id - a.id)
    return ok(paginate(items, page, perPage))
  }),

  http.get('/api/v1/books/:id', ({ params }) => {
    const book = mockBooks.find((item) => item.id === Number(params.id))
    return book ? ok(book) : fail('Книга не найдена', 404)
  }),

  http.post('/api/v1/books', async ({ request }) => {
    if (!isAuthed(request)) return unauthorized()

    const fd = await request.formData()
    const title = String(fd.get('title') ?? '').trim()
    const year = Number(fd.get('year'))
    const description = String(fd.get('description') ?? '').trim()
    const isbn = String(fd.get('isbn') ?? '').trim()
    const authorIds = (fd.getAll('author_ids[]') as string[])
      .map(Number)
      .filter((id) => !Number.isNaN(id))
    const cover = fd.get('cover') as File | null

    const invalid = validateBookFields(title, year, authorIds, true, Boolean(cover))
    if (invalid) return invalid

    const id = nextBookId()
    const book: Book = {
      id,
      title,
      year,
      description: description || undefined,
      isbn: isbn || undefined,
      cover_url: cover ? await fileToDataUrl(cover) : undefined,
      authors: authorsByIds(authorIds),
    }
    mockBooks.push(book)
    return ok(book, 201)
  }),

  http.put('/api/v1/books/:id', async ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized()

    const id = Number(params.id)
    const index = mockBooks.findIndex((item) => item.id === id)
    if (index === -1) return fail('Книга не найдена', 404)

    const fd = await request.formData()
    const title = String(fd.get('title') ?? '').trim()
    const year = Number(fd.get('year'))
    const description = String(fd.get('description') ?? '').trim()
    const isbn = String(fd.get('isbn') ?? '').trim()
    const authorIds = (fd.getAll('author_ids[]') as string[])
      .map(Number)
      .filter((id) => !Number.isNaN(id))
    const cover = fd.get('cover') as File | null

    const invalid = validateBookFields(title, year, authorIds, true, Boolean(cover))
    if (invalid) return invalid

    const current = mockBooks[index]
    mockBooks[index] = {
      ...current,
      title,
      year,
      description: fd.has('description') ? description || undefined : current.description,
      isbn: fd.has('isbn') ? isbn || undefined : current.isbn,
      authors: authorsByIds(authorIds),
      cover_url: cover ? await fileToDataUrl(cover) : current.cover_url,
    }
    return ok(mockBooks[index])
  }),

  http.patch('/api/v1/books/:id', async ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized()

    const id = Number(params.id)
    const index = mockBooks.findIndex((item) => item.id === id)
    if (index === -1) return fail('Книга не найдена', 404)

    const body = (await request.json()) as BookInput
    const current = mockBooks[index]

    const title = body.title !== undefined ? String(body.title).trim() : current.title
    const year = body.year !== undefined ? Number(body.year) : current.year
    const authorIds = body.author_ids ?? current.authors.map((author) => author.id)

    const invalid = validateBookFields(title, year, authorIds, false, false)
    if (invalid) return invalid

    mockBooks[index] = {
      ...current,
      title,
      year,
      description:
        body.description !== undefined
          ? String(body.description).trim() || undefined
          : current.description,
      isbn: body.isbn !== undefined ? String(body.isbn).trim() || undefined : current.isbn,
      authors: authorsByIds(authorIds),
    }
    return ok(mockBooks[index])
  }),

  http.delete('/api/v1/books/:id', ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized()
    const id = Number(params.id)
    const index = mockBooks.findIndex((item) => item.id === id)
    if (index === -1) return fail('Книга не найдена', 404)
    mockBooks.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/v1/authors', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || 1)
    const perPage = Number(url.searchParams.get('per-page') || 20)
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()

    let items = mockAuthors
    if (search) items = items.filter((author) => author.full_name.toLowerCase().includes(search))
    return ok(paginate(items, page, perPage))
  }),

  http.get('/api/v1/authors/:id', ({ params }) => {
    const author = mockAuthors.find((item) => item.id === Number(params.id))
    if (!author) return fail('Автор не найден', 404)

    const books = mockBooks
      .filter((book) => book.authors.some((a) => a.id === author.id))
      .map((book) => ({ id: book.id, title: book.title, year: book.year }))
      .sort((a, b) => b.year - a.year || b.id - a.id)

    const result: Author = { ...author, books }
    return ok(result)
  }),

  http.post('/api/v1/authors', async ({ request }) => {
    if (!isAuthed(request)) return unauthorized()
    const body = (await request.json()) as AuthorInput
    const fullName = String(body.full_name ?? '').trim()
    if (!fullName) return fail('ФИО не может быть пустым', 422, 'full_name')

    const id = nextAuthorId()
    mockAuthors.push({ id, full_name: fullName })
    return ok({ id, full_name: fullName }, 201)
  }),

  http.put('/api/v1/authors/:id', async ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized()
    const id = Number(params.id)
    const index = mockAuthors.findIndex((item) => item.id === id)
    if (index === -1) return fail('Автор не найден', 404)

    const body = (await request.json()) as AuthorInput
    const fullName = String(body.full_name ?? '').trim()
    if (!fullName) return fail('ФИО не может быть пустым', 422, 'full_name')

    mockAuthors[index] = { id, full_name: fullName }
    return ok(mockAuthors[index])
  }),

  http.delete('/api/v1/authors/:id', ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized()
    const id = Number(params.id)
    const index = mockAuthors.findIndex((item) => item.id === id)
    if (index === -1) return fail('Автор не найден', 404)

    mockAuthors.splice(index, 1)
    removeBookAuthorLinks(id)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/sms-pilot/api.php', async ({ request }) => {
    const body = new URLSearchParams(await request.text())
    const to = body.get('to')
    const rawSend = body.get('send')
    let messages: Array<{ to: string; text: string }> = []

    if (to && rawSend) {
      messages = [{ to, text: rawSend }]
    } else if (rawSend) {
      try {
        messages = JSON.parse(rawSend) as Array<{ to: string; text: string }>
      } catch {
        messages = []
      }
    }

    const send = messages.map((message, index) => ({
      server: 'send',
      from: 'SMSPILOT',
      to: message.to,
      text: message.text,
      cost: 1.5,
      status: 'Отправлено',
      id: `mock-sms-${index + 1}-${Date.now()}`,
    }))
    return HttpResponse.json({ success: true, send })
  }),

  http.get('/api/v1/reports/top-authors', ({ request }) => {
    const url = new URL(request.url)
    const rawYear = url.searchParams.get('year')
    const year = Number(rawYear)
    if (!rawYear || Number.isNaN(year)) {
      return fail('Параметр year не указан или неверен', 400)
    }

    const counts = new Map<number, number>()
    mockBooks
      .filter((book) => book.year === year)
      .forEach((book) =>
        book.authors.forEach((author) => {
          counts.set(author.id, (counts.get(author.id) ?? 0) + 1)
        }),
      )

    const items: TopAuthor[] = [...counts.entries()]
      .map(([authorId, count]) => ({
        rank: 0,
        author_id: authorId,
        full_name:
          mockAuthors.find((author) => author.id === authorId)?.full_name ?? `Автор #${authorId}`,
        books_count: count,
      }))
      .sort((a, b) => b.books_count - a.books_count || a.full_name.localeCompare(b.full_name, 'ru'))
      .slice(0, 10)
      .map((item, index) => ({ ...item, rank: index + 1 }))

    return ok({ year, items })
  }),
]