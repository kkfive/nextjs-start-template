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

type ExternalObjectData<T extends object> = {
  [Key in keyof T]?: ExternalData<T[Key]> | null
}

export type ExternalData<T> = T extends readonly (infer Item)[]
  ? ExternalData<Item>[] | null
  : T extends object
    ? ExternalObjectData<T>
    : T | null
