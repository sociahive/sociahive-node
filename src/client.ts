/**
 * Main SociaHive client. Constructed once and reused: keeps the OAuth/API-key
 * decision behind a single options object so callers don't have to think about
 * auth on every call.
 */

import {
  Transport,
  normalizeId,
  type Query,
} from './transport'
import {
  calendarResource,
  clientInvitesResource,
  linkClicksResource,
  mediaResource,
  plugsResource,
  postingSlotsResource,
  reviewLinksResource,
  rssFeedsResource,
  signaturesResource,
  webhooksResource,
} from './resources'
import type {
  ConnectedAccount,
  Post,
  Flow,
  FlowNode,
  FlowEdge,
  FlowStats,
  FlowWithGraph,
  AnalyticsResponse,
  AnalyticsQuery,
  CreatePostInput,
  CreateFlowInput,
  AddEdgeInput,
  ListPostsQuery,
  ListFlowsQuery,
  BulkPostActionInput,
  BulkPostActionResult,
  Paginated,
  Platform,
} from './types'
import type * as Api from './generated'

export interface SociaHiveOptions {
  /** API key (sk_...). Use this OR oauthToken. */
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
  /** Low-level transport, for operations the resources below don't wrap yet. */
  readonly http: Transport

  constructor(opts: SociaHiveOptions) {
    if (!opts.apiKey && !opts.oauthToken) {
      throw new Error('@sociahive/sdk: provide either `apiKey` or `oauthToken`')
    }
    if (opts.apiKey && opts.oauthToken) {
      throw new Error('@sociahive/sdk: pass only one of `apiKey` or `oauthToken`')
    }
    this.http = new Transport({
      baseUrl: (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, ''),
      timeoutMs: opts.timeoutMs ?? 30000,
      fetch: opts.fetch ?? ((...args: Parameters<typeof fetch>) => fetch(...args)),
      headers: opts.apiKey ? { 'X-API-Key': opts.apiKey } : { Authorization: `Bearer ${opts.oauthToken}` },
    })
    this.media = mediaResource(this.http)
    this.signatures = signaturesResource(this.http)
    this.postingSlots = postingSlotsResource(this.http)
    this.reviewLinks = reviewLinksResource(this.http)
    this.plugs = plugsResource(this.http)
    this.linkClicks = linkClicksResource(this.http)
    this.calendar = calendarResource(this.http)
    this.clientInvites = clientInvitesResource(this.http)
    this.rssFeeds = rssFeedsResource(this.http)
    this.webhooks = webhooksResource(this.http)
  }

  private request<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
    return this.http.request<T>(method, path, body, query)
  }

  private requestUnwrapped<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
    return this.http.requestUnwrapped<T>(method, path, body, query)
  }

    // ── accounts ────────────────────────────────────────────────────────

  readonly accounts = {
    list: (platform?: Platform): Promise<{ data: ConnectedAccount[] }> =>
      this.request('GET', '/connected-accounts', undefined, { platform }),
  }

  // ── posts ───────────────────────────────────────────────────────────

  readonly posts = {
    list: (q?: ListPostsQuery): Promise<Paginated<Post>> =>
      this.request('GET', '/posts', undefined, q as Query),
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
    delete: (id: string): Promise<void> =>
      this.request('DELETE', `/posts/${encodeURIComponent(id)}`),
    /** Copy a post as a new draft. */
    duplicate: (id: string): Promise<Post> =>
      this.requestUnwrapped('POST', `/posts/${encodeURIComponent(id)}/duplicate`),
    /**
     * Apply one action to up to 50 existing posts: schedule them, delete them,
     * or set their status. It does not create posts; call `create()` for each.
     */
    bulk: async (input: BulkPostActionInput): Promise<BulkPostActionResult> => {
      if (input.post_ids.length < 1 || input.post_ids.length > 50) {
        throw new Error('@sociahive/sdk: posts.bulk takes 1 to 50 post_ids')
      }
      return this.requestUnwrapped('POST', '/posts/bulk', input)
    },
  }

  // ── flows ───────────────────────────────────────────────────────────

  readonly flows = {
    list: async (q: ListFlowsQuery): Promise<Paginated<Flow & { hasPendingChanges: boolean }>> => {
      // v1 quirk: this endpoint returns { flows: [...] } not { data: [...] }.
      // Normalize for SDK consumers so every list method looks the same.
      const raw = await this.request<{ flows?: Flow[]; data?: Flow[]; pagination?: Paginated<Flow>['pagination'] }>(
        'GET', '/flows', undefined, { platform_user_id: q.platform_user_id },
      )
      // `pending_meta` is on a live flow that has unpublished changes.
      const items = (raw.data ?? raw.flows ?? []).map((f) => ({
        ...normalizeId(f),
        hasPendingChanges: f.pending_meta != null,
      }))
      return {
        data: items,
        pagination: raw.pagination ?? { limit: items.length, offset: 0, total: items.length },
      }
    },
    /**
     * A flow with its nodes and edges. By default the live version; with
     * `{ version: 'pending' }`, the unpublished changes of a live flow (the
     * live version when there are none), plus `pending` (null when there are
     * none) and `target`.
     */
    get: async (id: string, opts: { version?: 'pending' } = {}): Promise<FlowWithGraph> => {
      // v1 quirk: this endpoint returns { flow, nodes, edges } (not the
      // standard { data: ... } envelope). Merge into one object the way
      // every other resource looks.
      const raw = await this.request<Api.FlowGraphEnvelope>(
        'GET', `/flows/${encodeURIComponent(id)}`, undefined, { version: opts.version },
      )
      const flow = normalizeId(raw.flow ?? {}) as Flow
      const out: FlowWithGraph = {
        ...flow,
        nodes: ((raw.nodes ?? []) as unknown as FlowNode[]).map(normalizeId),
        edges: ((raw.edges ?? []) as unknown as FlowEdge[]).map(normalizeId),
      }
      if ('pending' in raw) out.pending = (raw.pending ?? null) as Api.FlowPendingSummary | null
      if (raw.target !== undefined) out.target = raw.target
      if (raw.legacyFormat !== undefined) out.legacyFormat = raw.legacyFormat
      return out
    },
    /**
     * What publishing a live flow's unpublished changes would change: steps
     * added, removed and changed, and how many people are partway through a
     * removed step. Fails with 404 `no_pending_changes` when there are none.
     */
    pending: (id: string): Promise<Api.FlowPendingChanges> =>
      this.http.call('GET /flows/{id}/pending', { path: { id } }),
    /**
     * Publish a live flow's unpublished changes, with the same checks as
     * turning a flow on. `expectedRev` is the `rev` you read from `pending()`:
     * newer edits fail with 409 `pending_changed`, a live version that changed
     * since with 409 `live_changed`. A failed check is a 400 with the check's
     * `code` and the step's `nodeId` in `error.body`.
     */
    publishChanges: async (id: string, opts: { expectedRev: string }): Promise<Api.FlowPendingPublished> => {
      if (!opts?.expectedRev) {
        throw new Error('@sociahive/sdk: flows.publishChanges needs expectedRev (the `rev` from flows.pending)')
      }
      const out = await this.http.call('POST /flows/{id}/pending/publish', {
        path: { id },
        body: { expectedRev: opts.expectedRev },
      })
      return { ...out, flow: normalizeId(out.flow) }
    },
    /**
     * Drop a live flow's unpublished changes; the live version is unchanged.
     * With `expectedRev`, newer edits fail with 409 `pending_changed`.
     */
    discardChanges: (id: string, opts: { expectedRev?: string } = {}): Promise<Api.FlowPendingDiscarded> =>
      this.http.call('POST /flows/{id}/pending/discard', {
        path: { id },
        body: opts.expectedRev ? { expectedRev: opts.expectedRev } : {},
      }),
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

  // ── analytics ───────────────────────────────────────────────────────

  readonly analytics = {
    get: (q?: AnalyticsQuery): Promise<AnalyticsResponse> =>
      this.request('GET', '/analytics', undefined, q as Query),
    export: (params: {
      type: 'posts' | 'flows' | 'accounts'
      format?: 'json' | 'csv'
      from?: string
      to?: string
    }): Promise<unknown> =>
      this.request('GET', '/analytics/export', undefined, params as Query),
    /** What has worked on your published posts (format, weekday, pillar) over the last `weeks` (1 to 12). */
    contentInsights: (q: { weeks?: number } = {}): Promise<Api.ContentInsights> =>
      this.requestUnwrapped('GET', '/analytics/content-insights', undefined, q as Query),
  }

  // ── scheduler resources (typed from the OpenAPI spec) ──────────────

  /** Media library, uploads and AI images. */
  readonly media: ReturnType<typeof mediaResource>
  /** Saved sign-offs appended to posts. */
  readonly signatures: ReturnType<typeof signaturesResource>
  /** Weekly posting times and find-slot. */
  readonly postingSlots: ReturnType<typeof postingSlotsResource>
  /** Client review links on a post. */
  readonly reviewLinks: ReturnType<typeof reviewLinksResource>
  /** Plugs: repost or comment when a post reaches a number. */
  readonly plugs: ReturnType<typeof plugsResource>
  /** Clicks on a post's short links. */
  readonly linkClicks: ReturnType<typeof linkClicksResource>
  /** Calendar month, duplicate and quick stats. */
  readonly calendar: ReturnType<typeof calendarResource>
  /** Client invite links that connect a client's accounts to an account group. */
  readonly clientInvites: ReturnType<typeof clientInvitesResource>
  /** RSS feeds that become drafts or scheduled posts. */
  readonly rssFeeds: ReturnType<typeof rssFeedsResource>
  /** Outbound webhook subscriptions. */
  readonly webhooks: ReturnType<typeof webhooksResource>
}
