import type { AuthorShort, Book } from '../types/api'

export const mockAuthors: AuthorShort[] = [
  { id: 1, full_name: 'Толстой Лев Николаевич' },
  { id: 2, full_name: 'Достоевский Фёдор Михайлович' },
  { id: 3, full_name: 'Булгаков Михаил Афанасьевич' },
  { id: 4, full_name: 'Набоков Владимир Владимирович' },
  { id: 5, full_name: 'Ахматова Анна Андреевна' },
  { id: 6, full_name: 'Цветаева Марина Ивановна' },
  { id: 7, full_name: 'Пелевин Виктор Олегович' },
  { id: 8, full_name: 'Улицкая Людмила Евгеньевна' },
  { id: 9, full_name: 'Быков Дмитрий Львович' },
  { id: 10, full_name: 'Водолазкин Евгений Германович' },
]

export interface MockUser {
  username: string
  password: string
  id: number
  role: string
}

export const mockUsers: MockUser[] = [
  { id: 1, username: 'admin', password: 'admin123', role: 'user' },
  { id: 2, username: 'demo', password: 'demo123', role: 'user' },
]

export const MOCK_TOKEN = 'mock-access-token'

function authorIds(...ids: number[]): AuthorShort[] {
  return ids
    .map((id) => mockAuthors.find((author) => author.id === id))
    .filter((author): author is AuthorShort => Boolean(author))
}

function svgCover(title: string, hue: number): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900">` +
    `<rect width="100%" height="100%" fill="hsl(${hue}, 45%, 82%)"/>` +
    `<rect x="24" y="24" width="552" height="852" fill="none" stroke="hsl(${hue}, 40%, 45%)" stroke-width="3"/>` +
    `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ` +
    `font-family="Georgia, serif" font-size="44" fill="hsl(${hue}, 35%, 25%)">${title.length > 24 ? title.slice(0, 24) + '…' : title}</text>` +
    `</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const mockBooks: Book[] = [
  {
    id: 1,
    title: 'Война и мир',
    year: 1869,
    description: 'Роман-эпопея о жизни русского общества в эпоху наполеоновских войн.',
    isbn: '978-5-17-123456-1',
    cover_url: svgCover('Война и мир', 200),
    authors: authorIds(1),
  },
  {
    id: 2,
    title: 'Анна Каренина',
    year: 1877,
    description: 'История трагической любви Анны Карениной и блестящего офицера Вронского.',
    isbn: '978-5-17-123456-2',
    cover_url: svgCover('Анна Каренина', 330),
    authors: authorIds(1),
  },
  {
    id: 3,
    title: 'Преступление и наказание',
    year: 1866,
    description: 'Социально-психологический роман об идее Раскольникова о «сильной личности».',
    isbn: '978-5-17-123456-3',
    cover_url: svgCover('Преступление и наказание', 0),
    authors: authorIds(2),
  },
  {
    id: 4,
    title: 'Мастер и Маргарита',
    year: 1966,
    description: 'Мистический роман о дьяволе, визите Воланда в Москву и творческой свободе.',
    isbn: '978-5-17-123456-4',
    cover_url: svgCover('Мастер и Маргарита', 270),
    authors: authorIds(3),
  },
  {
    id: 5,
    title: 'Лолита',
    year: 1955,
    description: 'Скандально известный роман о страсти профессора Гумберта к двенадцатилетней девочке.',
    isbn: '978-5-17-123456-5',
    cover_url: svgCover('Лолита', 300),
    authors: authorIds(4),
  },
  {
    id: 6,
    title: 'Реквием',
    year: 1987,
    description: 'Поэма-плач, посвящённая жертвам ежовщины.',
    isbn: '978-5-17-123456-6',
    cover_url: svgCover('Реквием', 260),
    authors: authorIds(5),
  },
  {
    id: 7,
    title: 'Стихотворения',
    year: 1940,
    description: 'Избранная лирика Марины Цветаевой разных лет.',
    authors: authorIds(6),
  },
  {
    id: 8,
    title: 'Generation «П»',
    year: 1999,
    description: 'Сатирический роман о российском рекламном бизнесе и массовом сознании.',
    isbn: '978-5-17-123456-8',
    cover_url: svgCover('Generation П', 50),
    authors: authorIds(7),
  },
  {
    id: 9,
    title: 'Чапаев и Пустота',
    year: 1996,
    description: 'Постмодернистский роман о пустоте как главной реальности.',
    authors: authorIds(7),
  },
  {
    id: 10,
    title: 'Будда маленький',
    year: 2020,
    description: 'Небольшая повесть Виктора Пелевина об иллюзорности бытия.',
    isbn: '978-5-17-123456-10',
    cover_url: svgCover('Будда маленький', 120),
    authors: authorIds(7),
  },
  {
    id: 11,
    title: 'Казус Кукоцкого',
    year: 2000,
    description: 'Семейная сага о гениальном генетике и его сложной судьбе.',
    isbn: '978-5-17-123456-11',
    cover_url: svgCover('Казус Кукоцкого', 90),
    authors: authorIds(8),
  },
  {
    id: 12,
    title: 'Лестница Якова',
    year: 2015,
    description: 'Роман-эпопея о судьбе нескольких поколений одной семьи.',
    cover_url: svgCover('Лестница Якова', 160),
    authors: authorIds(8),
  },
  {
    id: 13,
    title: 'Борис Пастернак',
    year: 2005,
    description: 'Документальная биография поэта и писателя.',
    authors: authorIds(9),
  },
  {
    id: 14,
    title: 'Идут белые снеги',
    year: 2018,
    description: 'Сборник текстов о времени, литературе и жизни.',
    authors: authorIds(9),
  },
  {
    id: 15,
    title: 'Лавр',
    year: 2012,
    description: 'История целителя из средневековой Руси.',
    isbn: '978-5-17-123456-15',
    cover_url: svgCover('Лавр', 210),
    authors: authorIds(10),
  },
  {
    id: 16,
    title: 'Брисбен',
    year: 2018,
    description: 'Роман о гитаристе и поиске самого себя.',
    isbn: '978-5-17-123456-16',
    cover_url: svgCover('Брисбен', 240),
    authors: authorIds(10),
  },
  {
    id: 17,
    title: 'Оправдание Острова',
    year: 2020,
    description: 'Средневековая история о государстве на острове.',
    authors: authorIds(10),
  },
  {
    id: 18,
    title: 'Начало 2026',
    year: 2026,
    description: 'Свежая книга классика, вышедшая в этом году.',
    isbn: '978-5-17-123456-18',
    cover_url: svgCover('Начало 2026', 20),
    authors: authorIds(1),
  },
  {
    id: 19,
    title: 'Финал 2026',
    year: 2026,
    description: 'Совместная работа двух авторов о завершении большого проекта.',
    isbn: '978-5-17-123456-19',
    cover_url: svgCover('Финал 2026', 180),
    authors: authorIds(9, 10),
  },
  {
    id: 20,
    title: 'Страницы 2026',
    year: 2026,
    description: 'Сборник рассказов о чтении и книгах.',
    authors: authorIds(7),
  },
]

export function nextBookId(): number {
  return Math.max(...mockBooks.map((book) => book.id)) + 1
}

export function nextAuthorId(): number {
  return Math.max(...mockAuthors.map((author) => author.id)) + 1
}

export function authorsByIds(ids: number[]): AuthorShort[] {
  return ids
    .map((id) => mockAuthors.find((author) => author.id === id))
    .filter((author): author is AuthorShort => Boolean(author))
}

export function removeBookAuthorLinks(authorId: number): void {
  mockBooks.forEach((book) => {
    book.authors = book.authors.filter((author) => author.id !== authorId)
  })
}