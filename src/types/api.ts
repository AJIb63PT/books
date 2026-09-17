export interface UserInfo {
  id: number;
  username: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginData {
  token: string;
  expires_at: string;
  user: UserInfo;
}

export interface LoginResponse {
  success: boolean;
  data: LoginData;
}

export interface AuthorShort {
  id: number;
  full_name: string;
}

export interface Author {
  id: number;
  full_name: string;
  books?: BookShort[];
}

export interface BookShort {
  id: number;
  title: string;
  year: number;
}

export interface Book {
  id: number;
  title: string;
  year: number;
  description?: string;
  isbn?: string;
  cover_url?: string;
  authors: AuthorShort[];
}

export interface BookInput {
  title?: string;
  year?: number;
  description?: string;
  isbn?: string;
  author_ids?: number[];
}

export interface BookForm {
  title: string;
  year: number;
  description?: string;
  isbn?: string;
  author_ids: number[];
}

export interface AuthorInput {
  full_name: string;
}

export interface Pagination {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface BookListData {
  items: Book[];
  pagination: Pagination;
}

export interface BookListResponse {
  success: boolean;
  data: BookListData;
}

export interface AuthorListData {
  items: AuthorShort[];
  pagination: Pagination;
}

export interface AuthorListResponse {
  success: boolean;
  data: AuthorListData;
}

export interface BookResponse {
  success: boolean;
  data: Book;
}

export interface AuthorResponse {
  success: boolean;
  data: Author;
}

export interface TopAuthor {
  rank: number;
  author_id: number;
  full_name: string;
  books_count: number;
}

export interface TopAuthorsData {
  year: number;
  items: TopAuthor[];
}

export interface TopAuthorsResponse {
  success: boolean;
  data: TopAuthorsData;
}

export interface ErrorItem {
  field?: string;
  message: string;
}

export interface ApiError {
  success: boolean;
  errors: ErrorItem[];
}
