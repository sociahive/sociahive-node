/**
 * Hand-curated types for the most-used endpoints.
 *
 * Source of truth is the OpenAPI spec at /api/v1/openapi.json; running
 * `npm run generate:types` regenerates `src/generated.ts` for fuller coverage.
 * The hand-curated types here are kept terse and stable so the public SDK
 * surface doesn't churn every time we tweak an internal response shape.
 */

export type Platform =
  | 'instagram' | 'facebook' | 'messenger' | 'whatsapp'
  | 'linkedin' | 'twitter' | 'tiktok' | 'telegram'
  | 'threads' | 'youtube' | 'bluesky' | 'pinterest'

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
  /** Post body text. Up to 2200 chars. */
  text: string
  platforms: Array<{ platform: Platform; account_id: string }>
  media?: MediaItem[]
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
  platform_user_id?: string
  limit?: number
  offset?: number
}

export type AutopilotReviewMode = 'approve' | 'autopublish'

export interface AutopilotStatus {
  enabled: boolean
  configured: boolean
  review_mode: AutopilotReviewMode
  posts_per_week: number
  account_ids: string[]
  paused_reason?: string | null
  last_generated_at?: string | null
  [key: string]: unknown
}

export interface AutopilotGenerateResult {
  week_start: string
  batch_id: string
  generating: boolean
  [key: string]: unknown
}

export interface AutopilotAdjustResult {
  week_start: string
  generating: boolean
  [key: string]: unknown
}

export interface AutopilotBrandKitInput {
  businessName?: string
  whatYouDo?: string
  audience?: string
  voicePreset?: string
  bannedWords?: string[]
  contentPillars?: string[]
}

export interface AutopilotBrandKit {
  business_name?: string
  what_you_do?: string
  audience?: string
  voice_preset?: string
  banned_words?: string[]
  content_pillars?: string[]
  [key: string]: unknown
}

export interface AutopilotBrandKitResult {
  ok: boolean
  brand_kit: AutopilotBrandKit
  [key: string]: unknown
}

export interface AutopilotApproveResult {
  ok: boolean
  scheduled: number
  failed: number
  [key: string]: unknown
}

export interface AutopilotTurnOnConfig {
  enabled: boolean
  review_mode: AutopilotReviewMode
  posts_per_week: number
  account_ids: string[]
  [key: string]: unknown
}

export interface AutopilotTurnOnResult {
  ok: boolean
  enabled: boolean
  clamped: boolean
  config: AutopilotTurnOnConfig
  [key: string]: unknown
}
