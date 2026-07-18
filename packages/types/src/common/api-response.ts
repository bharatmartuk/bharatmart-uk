export type ApiResponse<T> = {
  data: T
  message?: string
}

export type ApiError = {
  code: string
  message: string
  details?: Record<string, string[]>
}
