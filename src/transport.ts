/**
 * HTTP layer shared by every resource: auth header, timeout, error mapping,
 * `{ data }` unwrapping and the typed `call` used by the generated-type
 * resources.
 */

import { SociaHiveError } from './errors'
import type { BodyOf, DataOf, OperationKey, QueryOf, ResponseOf } from './generated'

export type QueryValue = string | number | boolean | string[] | undefined | null
export type Query = Record<string, QueryValue>

export interface TransportOptions {
  baseUrl: string
  headers: Record<string, string>
  timeoutMs: number
  fetch: typeof fetch
}

type NeverToOptional<T> = [T] extends [never] ? undefined : T

export interface CallArgs<K extends OperationKey> {
  path?: Record<string, string>
  query?: NeverToOptional<QueryOf<K>> | Query
  body?: NeverToOptional<BodyOf<K>>
}

export class Transport {
  constructor(private readonly opts: TransportOptions) {}

  get fetchImpl(): typeof fetch {
    return this.opts.fetch
  }

  /** Raw request: returns the parsed JSON body as-is. */
  async request<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
    const url = new URL(this.opts.baseUrl + path)
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null) continue
        url.searchParams.set(k, Array.isArray(v) ? v.join(',') : String(v))
      }
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.opts.timeoutMs)

    try {
      const res = await this.opts.fetch(url.toString(), {
        method,
        headers: { ...this.opts.headers, 'Content-Type': 'application/json' },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      const text = await res.text()
      const json = text ? safeParseJson(text) : null

      if (!res.ok) {
        const errBody = (json ?? { error: text }) as { error?: unknown; error_description?: string; code?: string }
        const errorText = typeof errBody.error === 'string' ? errBody.error : undefined
        const code = errBody.code ?? errorText
        const message = errBody.error_description ?? errorText ?? `HTTP ${res.status}`
        const retryHeader = Number(res.headers.get('retry-after'))
        const retryAfter = Number.isFinite(retryHeader) && retryHeader > 0 ? retryHeader : undefined
        throw new SociaHiveError(message, res.status, json ?? text, code, retryAfter)
      }
      return (json as T) ?? (undefined as T)
    } catch (err) {
      if (err instanceof SociaHiveError) throw err
      if (err instanceof Error && err.name === 'AbortError') {
        throw new SociaHiveError(`Request timed out after ${this.opts.timeoutMs}ms`, 0, null, 'timeout')
      }
      throw new SociaHiveError(err instanceof Error ? err.message : 'Unknown error', 0, null, 'network_error')
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Single-resource request: unwraps a `{ data: <object> }` envelope and leaves
   * paginated responses alone. Kept for the original posts / flows methods.
   */
  async requestUnwrapped<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
    const raw = await this.request<{ data?: T } & T>(method, path, body, query)
    let result: unknown = raw
    if (raw && typeof raw === 'object' && 'data' in raw && !('pagination' in raw)) {
      const inner = (raw as { data: unknown }).data
      if (inner && typeof inner === 'object' && !Array.isArray(inner)) result = inner
    }
    return normalizeId(result) as T
  }

  /** Typed request for an operation in the generated spec. Returns the whole body. */
  async raw<K extends OperationKey>(key: K, args: CallArgs<K> = {}): Promise<ResponseOf<K>> {
    const { method, path } = resolveKey(key, args.path)
    return this.request<ResponseOf<K>>(method, path, args.body, args.query as Query | undefined)
  }

  /** Typed request that returns the `data` of a `{ data }` envelope (or the body when there is none). */
  async call<K extends OperationKey>(key: K, args: CallArgs<K> = {}): Promise<DataOf<K>> {
    return unwrapData(await this.raw(key, args)) as DataOf<K>
  }
}

/** "POST /posts/{id}/plugs" + { id } → { method: 'POST', path: '/posts/abc/plugs' }. */
export function resolveKey(key: string, params: Record<string, string> = {}): { method: string; path: string } {
  const space = key.indexOf(' ')
  const method = key.slice(0, space)
  const template = key.slice(space + 1)
  const path = template.replace(/\{([^}]+)\}/g, (_, name: string) => {
    const value = params[name]
    if (value === undefined || value === '') throw new Error(`@sociahive/sdk: missing path parameter "${name}" for ${key}`)
    return encodeURIComponent(value)
  })
  return { method, path }
}

/** `{ data: X }` (with or without `success`) → X. Paginated bodies stay whole. */
export function unwrapData(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'data' in raw && !('pagination' in raw)) {
    return normalizeId((raw as { data: unknown }).data)
  }
  return normalizeId(raw)
}

export function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/**
 * Some v1 list endpoints (notably /flows) return `_id` while single-resource
 * endpoints return both `_id` and `id`. Surface `_id` under `id` when `id` is
 * missing. Shallow only.
 */
export function normalizeId<T>(value: T): T {
  if (Array.isArray(value)) return value.map(normalizeId) as unknown as T
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (obj.id === undefined && typeof obj._id === 'string') return { ...obj, id: obj._id } as T
  }
  return value
}
