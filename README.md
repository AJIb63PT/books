# Каталог книг — фронтенд (Vue 3 + TypeScript + Bootstrap)

SPA-клиент для REST API каталога книг (Yii2 + MySQL, спецификация в [`book.yaml`](./book.yaml)).

## Возможности

- **Гость** — просмотр каталога книг и авторов, поиск/фильтры/пагинация, публичный отчёт «ТОП-10 авторов за год», подписка на новые книги автора с SMS-уведомлением.
- **Пользователь** (Bearer JWT) — полный CRUD книг и авторов (добавление, редактирование, удаление), загрузка обложки книги.
- **SMS-уведомления** — подписка отправляет SMS через [smspilot.ru](https://sms-pilot.ru/); по умолчанию используется ключ-эмулятор `EMULATOR` (реальная отправка не происходит).

## Стек

- Vue 3 (Composition API, `<script setup>`) + TypeScript
- Vite (dev-proxy на бэкенд)
- Pinia (стор `auth`, токен в `localStorage`)
- Vue Router (guard для CRUD-страниц)
- Bootstrap 5
- Axios (API-слой)

## Установка и запуск

```bash
npm install
npm run dev
```

Бэкенд должен быть доступен по адресу из `.env` → `VITE_PROXY_TARGET` (по умолчанию `http://localhost:8080`).
Все запросы к API идут на относительный `/api/v1` и проксируются Vite dev-server'ом.

Продакшен-сборка:

```bash
npm run build
npm run preview
```

## Переменные окружения (`.env`)

| Переменная | По умолчанию | Описание |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api/v1` | Относительный base URL API |
| `VITE_PROXY_TARGET` | `http://localhost:8080` | Target бэкенда для dev-proxy |
| `VITE_SMSPILOT_API_KEY` | `EMULATOR` | Ключ smspilot (эмулятор, реальной отправки нет) |
| `VITE_SMSPILOT_ENDPOINT` | `/sms-pilot/api2.php` | Endpoint smspilot (проксируется через Vite во избежание CORS) |

## Структура

```
src/
  api/          axios-клиент + модули API (auth, books, authors, reports, sms)
  types/        типы данных из OpenAPI-спеки
  stores/       Pinia-стор аутентификации
  router/       роутер с guard'ом по роли
  views/        страницы (логин, книги, авторы, отчёт, подписка)
  components/   переиспользуемые компоненты (alert, пагинация, карточка книги)
```

## Роли и права

| Страница | Гость | Пользователь |
| --- | --- | --- |
| Книги / Авторы / Отчёт | просмотр | просмотр, создание, редактирование, удаление |
| Подписка + SMS | да | да |

## Примечания к контракту

- `POST /auth/login` → `{ token, expires_at, user }`, токен подставляется в `Authorization: Bearer …`.
- Создание книги — `POST /books` (multipart: `title`, `year`, `author_ids[]`, `cover`, …).
- Редактирование книги: если выбран новый файл обложки — `PUT /books/{id}` (multipart), иначе — `PATCH /books/{id}` (JSON-поля без обложки), так как в спеке `PATCH` не принимает cover.
- Публичный отчёт — `GET /reports/top-authors?year=…`.

## SMS-подписка (бонус)

В спецификации бэкенда нет endpoint'а для хранения подписок, поэтому подписка реализована на фронтенде: форма «автор + телефон» отправляет SMS-сообщение напрямую через smspilot. Ключ-эмулятор `EMULATOR` никаких реальных SMS не отправляет.

> Для продакшена хранение подписок и отправку SMS лучше перенести на бэкенд (например, в очередь в момент создания книги), а фронт оставить только формой подписки.