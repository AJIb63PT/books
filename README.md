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

В dev-режиме по умолчанию включены **моки MSW** (`VITE_ENABLE_MOCKS=true` в `.env.development`) — бэкенд не требуется, все API-запросы перехватываются в браузере (см. раздел «Моки»). Чтобы работать против реального бэка, запустите `npm run dev -- --mode production` или выставьте `VITE_ENABLE_MOCKS=false`.

Бэкенд должен быть доступен по адресу из `.env` → `VITE_PROXY_TARGET` (по умолчанию `http://localhost:8080`).
Все запросы к API идут на относительный `/api/v1` и проксируются Vite dev-server'ом.

Продакшен-сборка (моки и MSW исключаются):

```bash
npm run build
npm run preview
```

## Моки (MSW)

Для удобного тестирования фронтенда подключён [MSW](https://mswjs.io). Моки включены только в dev-режиме, в продакшен-сборку не попадают.

- Данные и «живая» бизнес-логика — `src/mocks/data.ts`, обработчики всех эндпоинтов из `book.yaml` — `src/mocks/handlers.ts` (пагинация, поиск, фильтры, валидация 422, проверка Bearer-токена).
- Логин для роли пользователя: `admin` / `admin123` (или `demo` / `demo123`).
- Отправка SMS тоже замокана (`POST /sms-pilot/api2.php`) — вся демка работает офлайн, без реального бэка и smspilot.
- Переключение: `VITE_ENABLE_MOCKS` в `.env.development` (true) / `.env` (false). Service worker стартует автоматически в `src/main.ts` до монтирования приложения.

## Переменные окружения (`.env`)

| Переменная | По умолчанию | Описание |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api/v1` | Относительный base URL API |
| `VITE_PROXY_TARGET` | `http://localhost:8080` | Target бэкенда для dev-proxy |
| `VITE_SMSPILOT_API_KEY` | `EMULATOR` | Ключ smspilot (эмулятор, реальной отправки нет) |
| `VITE_SMSPILOT_ENDPOINT` | `/sms-pilot/api2.php` | Endpoint smspilot (проксируется через Vite во избежание CORS) |
| `VITE_ENABLE_MOCKS` | `false` | Включение моков MSW (dev: true) |

## Структура

```
src/
  api/          axios-клиент + модули API (auth, books, authors, reports, sms)
  types/        типы данных из OpenAPI-спеки
  stores/       Pinia-стор аутентификации
  router/       роутер с guard'ом по роли
  mocks/        MSW: мок-данные и обработчики API (dev)
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