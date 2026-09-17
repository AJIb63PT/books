import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";
import { handlers } from "./handlers";
import { MOCK_TOKEN } from "./data";

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const BASE = "http://localhost/api/v1";

interface ApiBody<T = unknown> {
  success: boolean;
  data?: T;
  errors?: Array<{ field?: string; message: string }>;
}

async function getBody<T = unknown>(response: Response): Promise<ApiBody<T>> {
  return (await response.json()) as ApiBody<T>;
}

function authHeaders(): Headers {
  return new Headers({ Authorization: `Bearer ${MOCK_TOKEN}` });
}

describe("auth", () => {
  it("возвращает токен и пользователя при корректных учётных данных", async () => {
    const response = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "admin123" }),
    });
    expect(response.status).toBe(200);
    const body = await getBody<{ token: string; user: { username: string } }>(
      response,
    );
    expect(body.success).toBe(true);
    expect(body.data?.token).toBe(MOCK_TOKEN);
    expect(body.data?.user.username).toBe("admin");
  });

  it("отклоняет неверные учётные данные", async () => {
    const response = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "wrong" }),
    });
    expect(response.status).toBe(401);
    const body = await getBody(response);
    expect(body.success).toBe(false);
    expect(body.errors?.[0].message).toBe("Неверные учётные данные");
  });
});

describe("books", () => {
  it("отдаёт список с пагинацией", async () => {
    const response = await fetch(`${BASE}/books?page=1&per-page=2`);
    expect(response.status).toBe(200);
    const body = await getBody<{
      items: Array<{ id: number }>;
      pagination: { total: number; per_page: number; total_pages: number };
    }>(response);
    expect(body.data?.items).toHaveLength(2);
    expect(body.data?.pagination.per_page).toBe(2);
    expect(body.data?.pagination.total_pages).toBe(
      Math.ceil((body.data?.pagination.total ?? 0) / 2),
    );
  });

  it("фильтрует по поиску", async () => {
    const response = await fetch(`${BASE}/books?search=лавр`);
    const body = await getBody<{ items: Array<{ title: string }> }>(response);
    expect(body.data?.items.length).toBeGreaterThan(0);
    expect(
      body.data?.items.every((book) =>
        book.title.toLowerCase().includes("лавр"),
      ),
    ).toBe(true);
  });

  it("возвращает 404 для несуществующей книги", async () => {
    const response = await fetch(`${BASE}/books/99999`);
    expect(response.status).toBe(404);
  });

  it("отклоняет создание без токена", async () => {
    const form = new FormData();
    form.append("title", "Тест");
    const response = await fetch(`${BASE}/books`, {
      method: "POST",
      body: form,
    });
    expect(response.status).toBe(401);
  });

  it("возвращает 422 при отсутствии обложки", async () => {
    const form = new FormData();
    form.append("title", "Тест");
    form.append("year", "2024");
    form.append("author_ids[]", "1");
    const response = await fetch(`${BASE}/books`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    });
    expect(response.status).toBe(422);
    const body = await getBody(response);
    expect(body.errors?.map((error) => error.field)).toContain("cover");
  });
});

describe("authors", () => {
  it("фильтрует авторов по поиску", async () => {
    const response = await fetch(`${BASE}/authors?search=пелевин`);
    expect(response.status).toBe(200);
    const body = await getBody<{ items: Array<{ full_name: string }> }>(
      response,
    );
    expect(body.data?.items.length).toBeGreaterThan(0);
    expect(
      body.data?.items.every((author) =>
        author.full_name.toLowerCase().includes("пелевин"),
      ),
    ).toBe(true);
  });
});

describe("reports", () => {
  it("требует параметр year", async () => {
    const response = await fetch(`${BASE}/reports/top-authors`);
    expect(response.status).toBe(400);
  });

  it("сортирует авторов по количеству книг за год", async () => {
    const response = await fetch(`${BASE}/reports/top-authors?year=2026`);
    expect(response.status).toBe(200);
    const body = await getBody<{
      year: number;
      items: Array<{ rank: number; books_count: number }>;
    }>(response);
    expect(body.data?.year).toBe(2026);
    expect(body.data?.items.length).toBeGreaterThan(0);

    const counts = (body.data?.items ?? []).map((item) => item.books_count);
    expect([...counts]).toEqual([...counts].sort((a, b) => b - a));
    expect(body.data?.items[0].rank).toBe(1);
  });
});
