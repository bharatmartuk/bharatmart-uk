export class AppError extends Error {
  readonly statusCode: number
  readonly code: string

  constructor(message: string, statusCode: number, code: string) {
    super(message)
    this.name = new.target.name
    this.statusCode = statusCode
    this.code = code
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

export class ValidationError extends AppError {
  readonly details?: Record<string, string[]> | undefined

  constructor(message = 'Validation failed', details?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR')
    this.details = details
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409, 'CONFLICT')
  }
}

export class RateLimitError extends AppError {
  readonly retryAfterSeconds: number

  constructor(message = 'Too many requests. Please try again later.', retryAfterSeconds = 60) {
    super(message, 429, 'RATE_LIMITED')
    this.retryAfterSeconds = retryAfterSeconds
  }
}
