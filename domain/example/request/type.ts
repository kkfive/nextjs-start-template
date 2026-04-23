export interface SuccessAPI {
  Response: {
    a: number
    b: number
    token?: string
  }
  Params: Record<string, unknown>
}
