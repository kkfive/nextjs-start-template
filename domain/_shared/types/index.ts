export type Pagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: Pagination
}

export type Nullable<T> = T | null

export type Optional<T> = T | undefined
