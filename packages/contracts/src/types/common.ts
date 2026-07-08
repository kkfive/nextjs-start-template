/**
 * 跨 app 共享的通用工具类型。
 * 仅 zod 表达不了的泛型工具类型放这里。
 */

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

/**
 * 把任意类型的所有字段（递归）标记为可选 + 可 null，
 * 用于表达"外部接口响应字段可能缺失或为 null"。
 */
export type ExternalData<T> = T extends readonly (infer Item)[]
  ? ExternalData<Item>[] | null
  : T extends object
    ? ExternalObjectData<T>
    : T | null
