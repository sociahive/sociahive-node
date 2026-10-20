/**
 * Hand-curated types for the original posts / flows / analytics methods and
 * for outbound webhooks (which the public spec types loosely).
 *
 * Every other resource is typed from `src/generated.ts`, generated from the
 * OpenAPI spec and exported as the `Api` namespace.
 * The hand-curated types here stay terse and stable so the public SDK surface
 * doesn't churn every time an internal response shape changes.
 */

import type { Platform, BulkOperationResult, BulkPostActionRequest } from './generated'

/**
 * Platform ids: `KnownPlatform | (string & {})`. The public spec lists only
 * public platforms, so new ids arrive as plain strings without a type error.
 */
export type { Platform, KnownPlatform } from './generated'

export type PostStatus =
  | 'draft' | 'scheduled' | 'publishing' | 'published'
  | 'partially_published' | 'failed' | 'pending_approval'

export type FlowStatus = 'draft' | 'published' | 'archived'

export type ScheduleType = 'immediate' | 'scheduled'

export type MediaType = 'image' | 'video' | 'gif'

export interface ConnectedAccount {
  id: string
  platform: Platform
  platform_user_id: string
  platform_username?: string
  display_name?: string
  is_active: boolean
  created_at: string
  [key: string]: unknown
}

export interface MediaItem {
  type: MediaType
  url: string
  thumbnail_url?: string
  /** Image description sent to platforms that take alt text (up to 1,000 characters). */
  alt_text?: string
  /** A video's chosen cover image (an https URL), where the platform takes one. */
  cover_url?: string
  /** Or the cover as a frame of the video, in milliseconds. */
  cover_time_ms?: number
}

/** Per-platform changes to a post (`platform_overrides[platform]`). */
export interface PlatformOverride {
  text?: string
  media?: MediaItem[]
  /** The platform's copy no longer follows edits to the shared text. */
  detached?: boolean
  /** A signature id, or `'none'` for no signature on this platform. */
  signature_id?: string
  [key: string]: unknown
}

export interface PlatformTarget {
  platform: Platform
  account_id: string
  platform_post_id?: string
}

export interface Post {
  id: string
  text: string
  status: PostStatus
  platforms: PlatformTarget[]
  media?: MediaItem[]
  scheduled_at?: string
  timezone?: string
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export interface CreatePostInput {
  /** Post body text. Each platform's limit applies when the post is scheduled. */
  text: string
  /** `metadata` carries platform options as flat string keys (e.g. `shorten_links: 'true'`). */
  platforms: Array<{ platform: Platform; account_id: string; metadata?: Record<string, string> }>
  media?: MediaItem[]
  platform_overrides?: Record<string, PlatformOverride>
  schedule_type: ScheduleType
  scheduled_at?: string
  timezone?: string
}

export interface Flow {
  id: string
  name: string
  description?: string
  account_id: string
  platform_user_id: string
  status: FlowStatus
  trigger?: { type: string; [key: string]: unknown }
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export interface CreateFlowInput {
  name: string
  description?: string
  account_id: string
  platform_user_id: string
  platform?: Platform
  trigger?: { type: string; [key: string]: unknown }
}

export interface FlowNode {
  id: string
  type: string
  data: Record<string, unknown>
  position?: { x: number; y: number }
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  type?: string
  data?: Record<string, unknown>
}

export interface AddEdgeInput {
  source: string
  target: string
  source_handle?: string
  target_handle?: string
  type?: string
  data?: Record<string, unknown>
}

export interface FlowStats {
  total_triggers: number
  completions: number
  abandons: number
  errors: number
  completion_rate: number
}

export interface AnalyticsQuery {
  post_id?: string
  start_date?: string
  end_date?: string
  platform?: Platform
}

export interface AnalyticsResponse {
  impressions: number
  reach: number
  engagement: number
  likes: number
  comments: number
  shares: number
  [key: string]: unknown
}

export interface Paginated<T> {
  data: T[]
  pagination: {
    limit: number
    offset: number
    total: number
  }
}

export interface ListPostsQuery {
  status?: PostStatus
  limit?: number
  offset?: number
}

export interface ListFlowsQuery {
  /** Required. The connected account's `platform_user_id` (from `accounts.list()`). */
  platform_user_id: string
}

/**
 * Body of `posts.bulk()`: one action applied to up to 50 existing posts.
 * - `schedule` needs `scheduled_for` (ISO 8601) and takes an optional `timezone`
 * - `delete` deletes the posts
 * - `update_status` needs `status` (`draft` or `scheduled`)
 */
export type BulkPostActionInput = BulkPostActionRequest

/** Result of `posts.bulk()`: how many posts the action applied to. */
export type BulkPostActionResult = BulkOperationResult

// ── Outbound webhooks ───────────────────────────────────────────────

/** Events a webhook can subscribe to. */
export type WebhookEvent =
  | 'post.published'
  | 'post.failed'
  | 'post.review_decision'
  | 'post.plug_fired'
  | 'flow.triggered'
  | 'flow.completed'
  | 'flow.error'
  | 'message.received'
  | 'comment.received'
  | 'account.disconnected'
  | 'whatsapp.template_status'
  | (string & {})

export type WebhookIntegrationType = 'webhook' | 'custom' | 'n8n' | 'make' | 'zapier'

export interface WebhookSubscription {
  id: string
  target_url: string
  events: WebhookEvent[]
  integration_type: WebhookIntegrationType | (string & {})
  active: boolean
  account_ids: string[]
  consecutive_failures: number
  disabled_at: string | null
  disabled_reason: string | null
  last_delivery_at: string | null
  last_status: number | null
  last_error: string | null
  created_at: string
  updated_at: string
}

export interface CreateWebhookInput {
  /** Public HTTPS URL. */
  target_url: string
  events: WebhookEvent[]
  integration_type?: WebhookIntegrationType
  /** Only events about these connected accounts. Empty: every account. */
  account_ids?: string[]
}

export interface UpdateWebhookInput {
  target_url?: string
  events?: WebhookEvent[]
  account_ids?: string[]
  active?: boolean
}

/** The JSON body SociaHive POSTs to a webhook. */
export interface WebhookDelivery<D = Record<string, unknown>> {
  id: string
  event: WebhookEvent
  timestamp: string
  data: D
}
