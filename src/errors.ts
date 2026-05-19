/**
 * SDK error type — every non-2xx response is thrown as a `SociaHiveError` so
 * callers can `instanceof` on it without inspecting fetch internals.
 */

export class SociaHiveError extends Error {
  readonly status: number
  readonly code?: string
  readonly body: unknown

  constructor(message: string, status: number, body: unknown, code?: string) {
    super(message)
    this.name = 'SociaHiveError'
    this.status = status
    this.body = body
    this.code = code
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403
  }

  get isRateLimited(): boolean {
    return this.status === 429
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }

  get isServerError(): boolean {
    return this.status >= 500
  }
}
