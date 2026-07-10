/**
 * Main SociaHive client. Constructed once and reused — keeps the OAuth/API-key
 * decision behind a single options object so callers don't have to think about
 * auth on every call.
 */

import { SociaHiveError } from './errors'
import type {
  ConnectedAccount,
  Post,
  Flow,
  FlowNode,
  FlowEdge,
  FlowStats,
  AnalyticsResponse,
  AnalyticsQuery,
  CreatePostInput,
  CreateFlowInput,
  AddEdgeInput,
  ListPostsQuery,
  ListFlowsQuery,
  Paginated,
  Platform,
  AutopilotStatus,
  AutopilotGenerateResult,
  AutopilotAdjustResult,
  AutopilotBrandKitInput,
  AutopilotBrandKitResult,
  AutopilotApproveResult,
  AutopilotReviewMode,
  AutopilotTurnOnResult,
} from './types'

export interface SociaHiveOptions {
  /** API key (sk_...) — pre-existing programmatic access. Use this OR oauthToken. */
  apiKey?: string
  /** OAuth 2.1 bearer token from /api/oauth/token. Use this OR apiKey. */
  oauthToken?: string
  /** Override the API base URL. Defaults to production. */
  baseUrl?: string
  /** Request timeout in ms. Defaults to 30000 (30s, matching the server). */
  timeoutMs?: number
  /** Custom fetch implementation, useful for testing or non-browser/Node environments. */
  fetch?: typeof fetch
}

const DEFAULT_BASE_URL = 'https://www.sociahive.com/api/v1'

export class SociaHive {
  private readonly baseUrl: string
  private readonly headers: Record<string, string>
  private readonly timeoutMs: number
  private readonly fetchImpl: typeof fetch

  constructor(opts: SociaHiveOptions) {
    if (!opts.apiKey && !opts.oauthToken) {
      throw new Error('@sociahive/sdk: provide either `apiKey` or `oauthToken`')
    }
    if (opts.apiKey && opts.oauthToken) {
      throw new Error('@sociahive/sdk: pass only one of `apiKey` or `oauthToken`')
    }
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '')
    this.timeoutMs = opts.timeoutMs ?? 30000
    this.fetchImpl = opts.fetch ?? fetch
    this.headers = opts.apiKey
      ? { 'X-API-Key': opts.apiKey }
      : { Authorization: `Bearer ${opts.oauthToken}` }
  }

  // ── HTTP primitive ──────────────────────────────────────────────────

  /**
   * Unwrap `{ data: <object> }` envelopes for single-resource responses.
   * Leaves paginated responses ({ data: [], pagination: {} }) alone — those
   * are returned to the caller as `Paginated<T>`.
   */
  private async requestUnwrapped<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const raw = await this.request<{ data?: T } & T>(method, path, body, query)
    let result: unknown = raw
    if (raw && typeof raw === 'object' && 'data' in raw && !('pagination' in raw)) {
      const inner = (raw as { data: unknown }).data
      if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
        result = inner
      }
    }
    return normalizeId(result) as T
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const url = new URL(this.baseUrl + path)
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
      }
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const res = await this.fetchImpl(url.toString(), {
        method,
        headers: { ...this.headers, 'Content-Type': 'application/json' },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      const text = await res.text()
      const json = text ? safeParseJson(text) : null

      if (!res.ok) {
        const errBody = (json ?? { error: text }) as { error?: string; error_description?: string }
        const code = errBody.error
        const message = errBody.error_description ?? errBody.error ?? `HTTP ${res.status}`
        throw new SociaHiveError(message, res.status, json ?? text, code)
      }
      return (json as T) ?? (undefined as T)
    } catch (err) {
      if (err instanceof SociaHiveError) throw err
      if (err instanceof Error && err.name === 'AbortError') {
        throw new SociaHiveError(`Request timed out after ${this.timeoutMs}ms`, 0, null, 'timeout')
      }
      throw new SociaHiveError(
        err instanceof Error ? err.message : 'Unknown error',
        0,
        null,
        'network_error',
      )
    } finally {
      clearTimeout(timeout)
    }
  }

  // ── accounts ────────────────────────────────────────────────────────

  readonly accounts = {
    list: (platform?: Platform): Promise<{ data: ConnectedAccount[] }> =>
      this.request('GET', '/connected-accounts', undefined, { platform }),
  }

  // ── posts ───────────────────────────────────────────────────────────

  readonly posts = {
    list: (q?: ListPostsQuery): Promise<Paginated<Post>> =>
      this.request('GET', '/posts', undefined, q as Record<string, string | number | undefined>),
    get: (id: string): Promise<Post> =>
      this.requestUnwrapped('GET', `/posts/${encodeURIComponent(id)}`),
    create: (input: CreatePostInput): Promise<Post> => {
      // The v1 endpoint wants { content: { text, media }, platforms, ... }; the
      // SDK accepts a flat shape (text, media at top level) and lifts media into
      // `content` for the wire request. Keeps the public API ergonomic.
      const { text, media, ...rest } = input
      return this.requestUnwrapped('POST', '/posts', {
        ...rest,
        content: media ? { text, media } : { text },
      })
    },
    update: (id: string, patch: Partial<CreatePostInput>): Promise<Post> => {
      const { text, media, ...rest } = patch
      const body: Record<string, unknown> = { ...rest }
      if (text !== undefined || media !== undefined) {
        body.content = {
          ...(text !== undefined && { text }),
          ...(media !== undefined && { media }),
        }
      }
      return this.requestUnwrapped('PUT', `/posts/${encodeURIComponent(id)}`, body)
    },
    schedule: (id: string, scheduledAt: string, timezone = 'UTC'): Promise<Post> =>
      this.requestUnwrapped('POST', `/posts/${encodeURIComponent(id)}/schedule`, {
        scheduled_at: scheduledAt,
        timezone,
      }),
    publish: (id: string): Promise<Post> =>
      this.requestUnwrapped('POST', `/posts/${encodeURIComponent(id)}/publish`),
    cancel: (id: string): Promise<Post> =>
      this.requestUnwrapped('POST', `/posts/${encodeURIComponent(id)}/cancel`),
    bulk: (posts: CreatePostInput[]): Promise<{ data: Post[] }> => {
      const wirePosts = posts.map(({ text, media, ...rest }) => ({
        ...rest,
        content: media ? { text, media } : { text },
      }))
      return this.request('POST', '/posts/bulk', { posts: wirePosts })
    },
  }

  // ── flows ───────────────────────────────────────────────────────────

  readonly flows = {
    list: async (q?: ListFlowsQuery): Promise<Paginated<Flow>> => {
      // v1 quirk: this endpoint returns { flows: [...] } not { data: [...] }.
      // Normalize for SDK consumers so every list method looks the same.
      const raw = await this.request<{ flows?: Flow[]; data?: Flow[]; pagination?: Paginated<Flow>['pagination'] }>(
        'GET', '/flows', undefined, q as Record<string, string | number | undefined>,
      )
      const items = (raw.data ?? raw.flows ?? []).map((f) => normalizeId(f))
      return {
        data: items,
        pagination: raw.pagination ?? { limit: items.length, offset: 0, total: items.length },
      }
    },
    get: async (id: string): Promise<Flow & { nodes: FlowNode[]; edges: FlowEdge[] }> => {
      // v1 quirk: this endpoint returns { flow, nodes, edges } (not the
      // standard { data: ... } envelope). Merge into one object the way
      // every other resource looks.
      const raw = await this.request<{ flow: Flow; nodes: FlowNode[]; edges: FlowEdge[] }>(
        'GET', `/flows/${encodeURIComponent(id)}`,
      )
      const flow = normalizeId(raw.flow ?? {}) as Flow
      return {
        ...flow,
        nodes: (raw.nodes ?? []).map(normalizeId),
        edges: (raw.edges ?? []).map(normalizeId),
      }
    },
    create: (input: CreateFlowInput): Promise<Flow> =>
      this.requestUnwrapped('POST', '/flows', input),
    update: (
      id: string,
      patch: Partial<Pick<Flow, 'name' | 'description' | 'status'>> & {
        trigger?: Record<string, unknown>
      },
    ): Promise<Flow> =>
      this.requestUnwrapped('PATCH', `/flows/${encodeURIComponent(id)}`, patch),
    delete: (id: string): Promise<void> =>
      this.request('DELETE', `/flows/${encodeURIComponent(id)}`),
    activate: (id: string): Promise<Flow> =>
      this.requestUnwrapped('PATCH', `/flows/${encodeURIComponent(id)}`, { status: 'published' }),
    deactivate: (id: string): Promise<Flow> =>
      this.requestUnwrapped('PATCH', `/flows/${encodeURIComponent(id)}`, { status: 'draft' }),
    addNode: (
      flowId: string,
      node: { type: string; data: Record<string, unknown>; position?: { x: number; y: number } },
    ): Promise<FlowNode> =>
      this.requestUnwrapped('POST', `/flows/${encodeURIComponent(flowId)}/nodes`, node),
    updateNode: (
      flowId: string,
      nodeId: string,
      data: Record<string, unknown>,
    ): Promise<FlowNode> =>
      this.requestUnwrapped(
        'PUT',
        `/flows/${encodeURIComponent(flowId)}/nodes/${encodeURIComponent(nodeId)}`,
        { data },
      ),
    addEdge: (flowId: string, edge: AddEdgeInput): Promise<FlowEdge> => {
      const body = {
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.source_handle,
        targetHandle: edge.target_handle,
        type: edge.type,
        data: edge.data,
      }
      return this.requestUnwrapped('POST', `/flows/${encodeURIComponent(flowId)}/edges`, body)
    },
    stats: (id: string): Promise<FlowStats> =>
      this.requestUnwrapped('GET', `/flows/${encodeURIComponent(id)}/stats`),
    collectedData: (id: string): Promise<{ data: Record<string, unknown[]> }> =>
      this.request('GET', `/flows/${encodeURIComponent(id)}/collected-data`),
    generate: (input: {
      description: string
      account_id: string
      platform_user_id: string
      platform?: Platform
    }): Promise<Flow> => this.requestUnwrapped('POST', '/flows/generate', input),
  }

  // ── autopilot ───────────────────────────────────────────────────────

  readonly autopilot = {
    /**
     * Current Autopilot config + status. Requires an `autopilot:read` API key.
     */
    status: (): Promise<AutopilotStatus> =>
      this.request('GET', '/autopilot/config'),
    /**
     * Kick off generation of the upcoming week's batch. Returns 202 while the
     * work runs in the background. Requires `autopilot:write`.
     */
    generate: (): Promise<AutopilotGenerateResult> =>
      this.request('POST', '/autopilot/generate'),
    /**
     * Re-generate the current week's batch, optionally with steering feedback
     * ("more product shots, fewer memes"). Returns 202. Requires
     * `autopilot:write`.
     */
    adjust: (opts?: { feedback?: string }): Promise<AutopilotAdjustResult> =>
      this.request('POST', '/autopilot/adjust', opts ?? {}),
    /**
     * Update the Brand Kit that grounds every generated post. Requires
     * `autopilot:write`.
     */
    updateBrandKit: (input: AutopilotBrandKitInput): Promise<AutopilotBrandKitResult> => {
      // The API body is snake_case with a nested, required `voice` object.
      // Map the ergonomic camelCase input to that shape (sending camelCase
      // hits the strict server schema and 400s).
      const body: Record<string, unknown> = {
        voice: {
          preset: input.voicePreset,
          ...(input.voiceNote !== undefined ? { custom_note: input.voiceNote } : {}),
        },
      }
      if (input.businessName !== undefined) body.business_name = input.businessName
      if (input.whatYouDo !== undefined) body.what_you_do = input.whatYouDo
      if (input.audience !== undefined) body.audience = input.audience
      if (input.bannedWords !== undefined) body.banned_words = input.bannedWords
      if (input.contentPillars !== undefined) body.pillars = input.contentPillars
      return this.request('PUT', '/autopilot/brand-kit', body)
    },
    /**
     * Approve the reviewed week and schedule it for publishing. IRREVERSIBLE —
     * the posts go live at their planned times. The API returns
     * `400 confirmation_required` unless `confirm: true` is passed, so `confirm`
     * is required here. Requires `autopilot:write`.
     */
    approve: (opts: { batchId?: string; confirm: boolean }): Promise<AutopilotApproveResult> =>
      this.request('POST', '/autopilot/approve', {
        ...(opts.batchId !== undefined && { batch_id: opts.batchId }),
        confirm: opts.confirm,
      }),
    /**
     * Turn Autopilot on for the account. IRREVERSIBLE go-live — once enabled the
     * weekly sweep starts planning and (in `autopublish` mode) shipping posts.
     * The API returns `400 confirmation_required` unless `confirm: true` is
     * passed, so `confirm` is required here. Requires `autopilot:write`.
     */
    turnOn: (opts: {
      postsPerWeek?: number
      reviewMode?: AutopilotReviewMode
      accountIds?: string[]
      confirm: boolean
    }): Promise<AutopilotTurnOnResult> =>
      this.request('POST', '/autopilot/turn-on', {
        ...(opts.postsPerWeek !== undefined && { posts_per_week: opts.postsPerWeek }),
        ...(opts.reviewMode !== undefined && { review_mode: opts.reviewMode }),
        ...(opts.accountIds !== undefined && { account_ids: opts.accountIds }),
        confirm: opts.confirm,
      }),
  }

  // ── analytics ───────────────────────────────────────────────────────

  readonly analytics = {
    get: (q?: AnalyticsQuery): Promise<AnalyticsResponse> =>
      this.request('GET', '/analytics', undefined, q as Record<string, string | number | undefined>),
    export: (params: {
      type: 'posts' | 'flows' | 'accounts'
      format?: 'json' | 'csv'
      from?: string
      to?: string
    }): Promise<unknown> =>
      this.request('GET', '/analytics/export', undefined, params as Record<string, string | number | undefined>),
  }
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/**
 * The v1 list endpoints (notably /flows) return `_id` (raw Mongo field) while
 * single-resource endpoints return both `_id` and `id`. Mirror Mongoose's
 * lean-with-id default for callers: if `id` is missing and `_id` is present,
 * surface `_id` under `id`. Shallow only — nested resources rarely need this.
 */
function normalizeId<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(normalizeId) as unknown as T
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (obj.id === undefined && typeof obj._id === 'string') {
      return { ...obj, id: obj._id } as T
    }
  }
  return value
}

