import 'client-only'

export type RequestSseEvent<T = unknown> = {
  data: T
}

export const createRequestSseStream = <T = unknown>() => createSseStream<T>()
