/* eslint-disable */
// AUTO-GENERATED from SociaHive's public v1 OpenAPI spec (https://www.sociahive.com/api/v1/openapi.json). Do not edit by hand.

/** Platform ids the public API lists today. */
export type KnownPlatform = "instagram" | "messenger" | "whatsapp" | "linkedin" | "twitter" | "tiktok" | "telegram" | "threads" | "youtube" | "bluesky" | "pinterest" | "facebook"

/** A platform id. New platforms arrive as plain strings, so this stays open. */
export type Platform = KnownPlatform | (string & {})

export type Error = {
  error: string
  error_description?: string
}

export type ConnectedAccount = {
  /** MongoDB ObjectId (24-character hex string) */
  id: string
  /** Platform id. Known values: `instagram`, `messenger`, `whatsapp`, `linkedin`, `twitter`, `tiktok`, `telegram`, `threads`, `youtube`, `bluesky`, `pinterest`, `facebook`, `discord`, `mastodon`, `lemmy`, `devto`, `hashnode`, `wordpress`, `listmonk`. Treat any other value as unknown, never as an error. */
  platform: string
  platform_user_id: string
  platform_username?: string
  display_name?: string
  is_active: boolean
  created_at: string
  /** Most characters a post on this account may have. X is 280, or more for an X Premium account where long posts are on (rolling out). */
  text_limit?: number
}

export type PostAutomationDTO = {
  /** Derived state. Known values: `none`, `building`, `failed`, `off`, `armed`, `live`, `needs_attention`. Treat any other value as unknown, never as an error. */
  state: string
  flow_id: string
  flow_name: string
  /** How the automation was built. Known values: `funnel`, `template`, `prompt`. Treat any other value as unknown, never as an error. */
  door: string
  account_id: string
  /** Turns on when the post goes live. Only a person sets this. */
  armed: boolean
  /** The trigger points at the published media id. */
  bound: boolean
  error?: {
    /** The fix to offer, e.g. `placeholder_text`, `link_placeholder`, `unbound_media`, `account_disconnected`, `tier_limit`. Open-ended. */
    code: string
    message: string
  }
  /** What the user can do now. Known values: arm, unarm, turn_on, turn_off, remove, rebind, retry, fill_blanks, open. Ignore unknown values. */
  allowed_actions: string[]
  flow_live_waiting_for_post?: boolean
}

export type Post = {
  /** MongoDB ObjectId (24-character hex string) */
  id: string
  content: {
    text: string
    media?: {
      type: "image" | "video" | "gif"
      url: string
    }[]
  }
  text?: string
  media?: {
    type: "image" | "video" | "gif"
    url: string
  }[]
  status: "draft" | "scheduled" | "publishing" | "published" | "partially_published" | "failed" | "pending_approval" | "reminder_sent"
  platforms: {
    /** Platform id. Known values: `instagram`, `messenger`, `whatsapp`, `linkedin`, `twitter`, `tiktok`, `telegram`, `threads`, `youtube`, `bluesky`, `pinterest`, `facebook`, `discord`, `mastodon`, `lemmy`, `devto`, `hashnode`, `wordpress`, `listmonk`. Treat any other value as unknown, never as an error. */
    platform: string
    /** MongoDB ObjectId (24-character hex string) */
    account_id: string
    platform_post_id?: string
    status?: "pending" | "processing" | "published" | "failed" | "reminder_sent"
    error?: {
      code: string
      message: string
    }
    published_at?: string
  }[]
  scheduled_at?: string
  timezone?: string
  created_at: string
  updated_at: string
  automation?: PostAutomationDTO & (Record<string, unknown> | null)
  /** Where the post came from (set by the server, never accepted from a client). Known values: `composer`, `rss`. Treat any other value as unknown, never as an error. */
  source?: string
}

export type Contact = {
  /** MongoDB ObjectId (24-character hex string) */
  _id: string
  owner_user_id: string
  platform_identities: {
    /** Platform id. Known values: `instagram`, `messenger`, `whatsapp`, `linkedin`, `twitter`, `tiktok`, `telegram`, `threads`, `youtube`, `bluesky`, `pinterest`, `facebook`, `discord`, `mastodon`, `lemmy`, `devto`, `hashnode`, `wordpress`, `listmonk`. Treat any other value as unknown, never as an error. */
    platform: string
    platform_user_id: string
    username?: string
  }[]
  display_name?: string
  email?: string
  phone?: string
  avatar_url?: string
  status: string
  source: string
  tags: string[]
  notes?: string
  interaction_count?: number
  first_interaction_at?: string
  last_active_at?: string
  created_at: string
  updated_at?: string
}

export type PaginatedPosts = {
  data: Post[]
  pagination?: {
    limit: number
    offset: number
    total: number
  }
}

/** Single-post envelope — `{ data: <post> }`. */
export type PostEnvelope = {
  data: Post
}

/** Single-contact envelope — `{ data: <contact> }`. */
export type ContactEnvelope = {
  data: Contact
}

/** Generic `{ data: <object> }` envelope. */
export type ObjectEnvelope = {
  data: Record<string, unknown>
}

export type BulkOperationResult = {
  total: number
  succeeded: number
  failed: number
  errors: {
    post_id: string
    error: string
  }[]
}

export type BulkOperationResultEnvelope = {
  data: BulkOperationResult
}

export type CalendarMonthEnvelope = {
  data: {
    year: number
    month: number
    days: Record<string, {
      date: string
      posts: Post[]
    }>
  }
}

/** GET /contacts wraps the paged RESULT OBJECT in `data` — not a bare array. */
export type ContactListEnvelope = {
  data: {
    contacts: Contact[]
    total: number
    page: number
    limit: number
    total_pages: number
  }
}

export type FlowScheduledPostChip = {
  id: string
  scheduled_at: string | null
  /** The post status (open-ended), e.g. `draft`, `scheduled`, `published`. */
  status: string
  thumbnail_url: string | null
}

/** GET /flows returns `{ flows: [...] }` — raw flow documents decorated with total_triggers / unique_users / unique_clickers, and `scheduled_post` on a flow that belongs to a scheduled post (when post automations are on). Not paginated. */
export type FlowListEnvelope = {
  flows: {
    scheduled_post?: FlowScheduledPostChip
    [key: string]: unknown
  }[]
}

/** POST /flows returns `{ flow: <raw flow document> }` with HTTP 200. */
export type FlowEnvelope = {
  flow: Record<string, unknown>
}

export type FlowGraphEnvelope = {
  flow: Record<string, unknown>
  nodes: Record<string, unknown>[]
  edges: Record<string, unknown>[]
}

/** PATCH /flows/{id} returns `{ success, flow }`; `warnings` (keyword conflicts) only when non-empty. */
export type FlowUpdateEnvelope = {
  success: boolean
  flow: Record<string, unknown>
  warnings?: Record<string, unknown>[]
}

export type FlowNodeEnvelope = {
  node: Record<string, unknown>
}

export type FlowEdgeEnvelope = {
  edge: Record<string, unknown>
}

/** Bare (un-enveloped) body returned by GET /flows/{id}/stats. */
export type FlowStats = {
  total_triggers: number
  total_button_clicks: number
  unique_users: number
  status_breakdown: {
    active: number
    completed: number
    error: number
    abandoned: number
    waiting: number
  }
  daily_timeline: {
    date: string
    triggers: number
  }[]
}

export type CollectedDataPage = {
  success: boolean
  data: Record<string, unknown>[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters: Record<string, unknown>
}

export type CreatePostRequest = {
  content: {
    /** Post body. Each target publishes its platform override text, else this text, and it must fit the platform: instagram 2200, facebook 63206, twitter 280, linkedin 3000, threads 500, bluesky 300, youtube 5000, pinterest 800, tiktok 2200. An X account with X Premium may post up to 4000 characters where long posts are on for the account (rolling out); each account's limit is `text_limit` in GET /connected-accounts. Checked when the post is scheduled or published (drafts always save): a text that does not fit is a 400 whose `targets` lists each target ({ platform, account_id, message }). */
    text: string
    media?: {
      type: "image" | "video" | "gif"
      url: string
      /** Alt text for an image, sent to every platform that accepts alt text. */
      alt_text?: string
      /** Video only: the chosen cover image (an uploaded image or a grabbed frame). Sent to YouTube (custom thumbnail, unless yt_thumbnail_url is set), Instagram reels (cover_url) and Pinterest video pins (cover_image_url). `thumbnail_url` stays the automatic poster. */
      cover_url?: string
      /** Video only: the time of the chosen cover frame, in milliseconds. Sent to Instagram reels (thumb_offset, when there is no cover_url) and TikTok Direct Post (video_cover_timestamp_ms). */
      cover_time_ms?: number
    }[]
  }
  platform_overrides?: Record<string, {
    text?: string
    media?: {
      type: "image" | "video"
      url: string
      /** Alt text for an image, sent to every platform that accepts alt text. */
      alt_text?: string
      /** Video only: the chosen cover image (an uploaded image or a grabbed frame). Sent to YouTube (custom thumbnail, unless yt_thumbnail_url is set), Instagram reels (cover_url) and Pinterest video pins (cover_image_url). `thumbnail_url` stays the automatic poster. */
      cover_url?: string
      /** Video only: the time of the chosen cover frame, in milliseconds. Sent to Instagram reels (thumb_offset, when there is no cover_url) and TikTok Direct Post (video_cover_timestamp_ms). */
      cover_time_ms?: number
    }[]
    content_type?: string
    /** Follow-up parts published as replies after the post (threads), in order */
    parts?: {
      text: string
      media?: {
        type: "image" | "video"
        url: string
        /** Alt text for an image, sent to every platform that accepts alt text. */
        alt_text?: string
        /** Video only: the chosen cover image (an uploaded image or a grabbed frame). Sent to YouTube (custom thumbnail, unless yt_thumbnail_url is set), Instagram reels (cover_url) and Pinterest video pins (cover_image_url). `thumbnail_url` stays the automatic poster. */
        cover_url?: string
        /** Video only: the time of the chosen cover frame, in milliseconds. Sent to Instagram reels (thumb_offset, when there is no cover_url) and TikTok Direct Post (video_cover_timestamp_ms). */
        cover_time_ms?: number
      }[]
    }[]
    /** A comment posted under the post by the same account */
    first_comment?: string
    /** Admin preview (ignored for other accounts). This platform was detached from the shared draft: its text, media and options are its own and do not follow edits to `content`. */
    detached?: boolean
    /** Admin preview (ignored for other accounts). The signature appended to this target at publish: a signature id, or `none` for no signature. Omit for the account's default signature. */
    signature_id?: string
    /** Article platforms only: the article title. */
    title?: string
    /** Article platforms only: the article body, Markdown. */
    body?: string
    /** Article platforms only: where the article first appeared (http or https). */
    canonical_url?: string
    /** Article platforms only: cover image URL (http or https). */
    cover_image?: string
    /** Article platforms only: tags. */
    tags?: string[]
  }>
  platforms: {
    /** Platform id. Known values: `instagram`, `messenger`, `whatsapp`, `linkedin`, `twitter`, `tiktok`, `telegram`, `threads`, `youtube`, `bluesky`, `pinterest`, `facebook`, `discord`, `mastodon`, `lemmy`, `devto`, `hashnode`, `wordpress`, `listmonk`. Treat any other value as unknown, never as an error. */
    platform: string
    /** MongoDB ObjectId (24-character hex string) */
    account_id: string
    /** Platform format, e.g. Instagram feed, carousel, reels, stories; Facebook story; X article for an X Article (rolling out). An X Article must be the post's only target, has no platform override and does not repeat; content.text is its body (up to 100000 characters) and content.media holds its images (images only). */
    content_type?: string
    /** Platform options as flat string keys. X Article: x_article_title (required, one line, up to 200 characters), x_article_format (markdown, the default, or content_state: content.text is then X's raw block JSON with image data { media_url }), x_article_cover_url (https URL equal to one of the post's images). */
    metadata?: Record<string, string>
  }[]
  schedule_type: "immediate" | "scheduled"
  scheduled_at?: string
  timezone: string
}

/** Outcome of a CSV import. Every created post is a draft. */
export type PostImportResult = {
  created: number
  failed: number
  post_ids: string[]
  errors: {
    line: number
    error: string
  }[]
}

export type CreateFlowRequest = {
  name: string
  description?: string
  /** MongoDB ObjectId (24-character hex string) */
  account_id: string
  platform_user_id: string
  /** Connected-account platform identifier */
  platform?: Platform
  trigger?: {
    type: "post_comment" | "story_reply" | "message" | "comment" | "keyword" | "live_comment" | "ad_click" | "referral_link" | "instagram_story_mention"
  }
}

/** What has worked on your published posts: format, weekday and pillar compared with your average. */
export type ContentInsights = {
  version: string
  window_weeks: number
  posts_analyzed: number
  account_avg_engagement_rate: number
  /** False when there are too few posts to compare; cells and rationales are then empty. */
  sufficient: boolean
  cells: {
    dimension: "format" | "day_of_week" | "pillar"
    /** 'image_post' | 'text_post' | 'video_post', a weekday name, or a content pillar. */
    cell: string
    /** Cell mean engagement rate divided by the account mean. 1.0 is the account average. */
    index: number
    /** Posts in the cell. */
    n: number
    avg_engagement_rate: number
  }[]
  top_posts: {
    caption_excerpt: string
    engagement_rate: number
    reach?: number
    format: string
    /** 0 = Sunday, in the post timezone. */
    day_of_week: number
  }[]
  bottom_posts: {
    caption_excerpt: string
    engagement_rate: number
    reach?: number
    format: string
    /** 0 = Sunday, in the post timezone. */
    day_of_week: number
  }[]
  rationales: string[]
}

export type WebhookEvent = "message.received" | "comment.received" | "flow.triggered" | "flow.completed" | "flow.error" | "post.published" | "post.failed" | "post.review_decision" | "post.plug_fired" | "account.disconnected" | "whatsapp.template_status"

export type WebhookIntegrationType = "webhook" | "custom" | "n8n" | "make" | "zapier"

/** An outbound webhook subscription. Deliveries are signed with the signing secret. */
export type Webhook = {
  /** MongoDB ObjectId (24-character hex string) */
  id: string
  target_url: string
  events: WebhookEvent[]
  integration_type: WebhookIntegrationType
  active: boolean
  /** Connected accounts this webhook is limited to. Empty: every account. */
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

export type CreateWebhookRequest = {
  /** A public HTTPS URL. */
  target_url: string
  events: WebhookEvent[]
  integration_type?: WebhookIntegrationType
  account_ids?: string[]
}

export type UpdateWebhookRequest = {
  target_url?: string
  events?: WebhookEvent[]
  /** An empty list removes the limit. */
  account_ids?: string[]
  /** Turning a webhook back on resets its failure count. */
  active?: boolean
}

export type Device = {
  /** MongoDB ObjectId (24-character hex string) */
  id: string
  platform: "ios" | "android"
  app_version: string
  locale: string
  apns_environment?: "production" | "sandbox"
  last_seen_at: string
  created_at: string
}

export type RegisterDeviceRequest = {
  /** APNs device token (64-char hex) or FCM registration token. Treated as a credential — never echoed back in responses. */
  token: string
  platform: "ios" | "android"
  app_version: string
  locale: string
  /** Set to "sandbox" for dev/TestFlight builds. Defaults to "production". */
  apns_environment?: "production" | "sandbox"
}

export type PresignUploadRequest = {
  /** Client-supplied display name. Used for logging only; server picks the storage key. */
  filename: string
  /** Allowed MIME types only. Anything else is rejected with invalid_input. */
  mime_type: "image/jpeg" | "image/png" | "image/webp" | "video/mp4" | "video/quicktime"
  /** File size in bytes. Per-tier limits: Growth 25 MB, Scale 100 MB, Agency 500 MB. */
  size_bytes: number
}

export type PresignUploadResponse = {
  /** The server-chosen storage key. Send it to POST /uploads/verify after the PUT. */
  key: string
  /** Short-lived presigned PUT URL. Issue a single HTTP PUT carrying every header in required_headers. */
  upload_url: string
  /** Headers the PUT MUST carry verbatim. Each value is bound into the URL's SigV4 signature, so omitting or altering one makes R2 reject the upload with 403. Send every entry as returned; do not hardcode the list — it can grow. Optional so a client can fall back to Content-Type + Content-Length against an older server. */
  required_headers?: Record<string, string>
  /** Permanent public URL where the uploaded bytes will be served once the PUT completes. */
  public_url: string
  /** ISO 8601 timestamp at which upload_url stops accepting writes (15 min after issuance). */
  expires_at: string
}

export type VerifyUploadRequest = {
  /** The key returned by POST /uploads/presign. */
  key: string
  /** `scheduler` when the file is post media: it is added to the media library (SCHEDULER_MEDIA_LIBRARY). */
  purpose?: "scheduler"
  /** Display name in the media library. */
  filename?: string
}

export type VerifyUploadResponse = {
  verified: true
  /** The stored size, read from storage. */
  size_bytes: number
  public_url?: string
  /** The media library entry, when one was recorded. */
  asset_id?: string
}

export type UploadFromUrlRequest = {
  /** Public http(s) URL of a JPEG, PNG, WebP, MP4 or MOV file. */
  url: string
}

export type UploadFromUrlResponse = {
  /** Public URL of the stored copy. Use it as post media. */
  url: string
  key: string
  size_bytes: number
  mime_type: "image/jpeg" | "image/png" | "image/webp" | "video/mp4" | "video/quicktime"
}

export type RegisterActivityRequest = {
  /** ActivityKit push token for a single in-flight Live Activity. Hex-encoded. Treated as a credential — never echoed back. Apple emits one per Activity.request(pushType:.token); mobile clients POST it as soon as `pushTokenUpdates` fires. */
  push_token: string
  /** SHA-256 prefix of the post ID, matching `PostPublishingAttributes.postIdHash` on the iOS client. Backend dispatcher uses this as the key when fanning out platform-completion pushes. */
  post_id_hash: string
  /** Set to "sandbox" for dev/TestFlight builds. Defaults to "production". */
  apns_environment?: "production" | "sandbox"
  /** The Live Activity widget extension bundle ID. Used as `apns-topic: <bundle-id>.push-type.liveactivity` when sending updates. MUST match the extension target on the device. */
  bundle_id: string
}

export type LiveActivityRegistration = {
  /** MongoDB ObjectId (24-character hex string) */
  id: string
  post_id_hash: string
  apns_environment: "production" | "sandbox"
  bundle_id: string
  created_at: string
  last_seen_at: string
}

export type MeFeedAccountHealth = {
  /** MongoDB ObjectId (24-character hex string) */
  id: string
  /** Platform id. Known values: `instagram`, `messenger`, `whatsapp`, `linkedin`, `twitter`, `tiktok`, `telegram`, `threads`, `youtube`, `bluesky`, `pinterest`, `facebook`, `discord`, `mastodon`, `lemmy`, `devto`, `hashnode`, `wordpress`, `listmonk`. Treat any other value as unknown, never as an error. */
  platform: string
  username: string | null
  /** Connected-account status — connected, disconnected, needs_reauth, expired, or pending_phone */
  status: string
  /** True when status is anything other than "connected" — surface a warning in the UI */
  needs_attention: boolean
}

export type MeFeedResponse = {
  /** Posts scheduled to publish in the requested timezone today, across statuses scheduled / pending_approval / publishing / draft */
  posts_today: number
  /** Sum of unread message counts across all live-chat sessions for the user */
  unread_inbox_count: number
  /** Count of failed posts plus errored flow executions in the last 24 hours */
  error_count_24h: number
  account_health: MeFeedAccountHealth[]
  generated_at: string
  /** True when this payload was served from the 60s Redis cache */
  cached: boolean
}

export type NotificationCategoryToggles = {
  "inbox.message": boolean
  "ai.handoff": boolean
  "flow.error": boolean
  "post.published": boolean
  "post.failed": boolean
}

export type QuietHoursWindow = {
  /** Minutes from local midnight when quiet hours begin. */
  start_minute: number
  /** Minutes from local midnight when quiet hours end. May be less than start_minute to wrap midnight (e.g. 22:00 -> 06:00). */
  end_minute: number
  /** IANA timezone identifier (e.g. America/New_York). */
  timezone: string
}

export type NotificationPreferences = {
  categories: NotificationCategoryToggles
  quiet_hours: QuietHoursWindow & (Record<string, unknown> | null)
  updated_at: string
}

export type NotificationPreferencesResponse = {
  data: NotificationPreferences
}

export type NotificationPreferencesPatch = {
  categories?: NotificationCategoryToggles
  quiet_hours?: QuietHoursWindow & (Record<string, unknown> | null)
}

export type PostAutomationError = {
  /** Human-readable reason. */
  error: string
  code: string
}

export type PostAutomationBlank = {
  nodeId: string
  nodeName: string
  token: string
  context: string
  link: boolean
}

export type PostAutomationDraftPreview = {
  flow_id: string
  /** Build state. Known values: `building`, `ready`, `failed`. Treat any other value as unknown, never as an error. */
  state: string
  /** The web recipe projection. */
  snapshot: Record<string, unknown> | null
  /** The recipe as numbered plain lines. */
  steps: string[]
  blanks: PostAutomationBlank[]
  /** Send back as `previewed_hash` to arm. */
  content_hash: string
  error?: {
    reason: string
    message: string
  }
}

export type PostAutomationPreflight = {
  ok: boolean
  /** Why it would not turn on (open-ended), e.g. `link_placeholder`, `tier_limit`. */
  code?: string
  message?: string
  blanks?: PostAutomationBlank[]
  upgradeRequired?: boolean
  retryable?: boolean
}

export type PostAutomationTemplate = {
  id: string
  name: string
  outcome_label: string
  outcome: string
  input_fields: {
    id: string
    title: string
    input_key: string | null
    placeholder: string | null
    helper_text: string | null
  }[]
  default_inputs: Record<string, unknown>
}

/** Exactly the fields of one door; any other field is rejected with 400 invalid_body. */
export type CreatePostAutomationDraftRequest = {
  door: "funnel" | "template" | "prompt"
  /** The Instagram account the automation listens on. */
  account_id: string
  /** door `funnel` only (required there). */
  keyword?: string
  /** door `funnel` only. */
  link?: string
  /** door `template` only (required there). */
  template_id?: string
  /** door `template` only. */
  inputs?: Record<string, unknown>
  /** door `prompt` only (required there). */
  prompt?: string
}

export type ReviewDecision = {
  /** What the client did. Known values: `approved`, `changes_requested`, `comment`. Treat any other value as unknown, never as an error. */
  kind: string
  reviewer_name: string
  comment?: string
  created_at: string
}

export type ReviewLink = {
  /** MongoDB ObjectId (24-character hex string) */
  id: string
  /** MongoDB ObjectId (24-character hex string) */
  post_id: string
  /** The signed public URL. Returned only by POST, once. */
  url?: string
  reviewer_name?: string
  /** Whether the link still opens. Known values: `active`, `expired`, `revoked`. Treat any other value as unknown, never as an error. */
  state: string
  expires_at: string
  revoked_at?: string
  /** At most 50 per link, oldest first. */
  decisions: ReviewDecision[]
  created_at: string
}

export type ReviewSummary = {
  links: ReviewLink[]
  latest_decision?: ReviewDecision
  /** The newest decision is an approval and the post changed after it. Absent when it cannot be told. */
  approved_before_last_edit?: boolean
}

export type ReviewLinkError = {
  error: string
  code: string
}

/** The latest analytics of each target of one post. */
export type PostQuickStatsEnvelope = {
  data: {
    /** MongoDB ObjectId (24-character hex string) */
    post_id: string
    status: string
    targets: {
      /** Platform id. A free string: decode ids you do not know. */
      platform: string
      /** MongoDB ObjectId (24-character hex string) */
      account_id: string
      /** Target publish status (pending, processing, published, failed, ...). */
      status: string
      permalink?: string
      published_at?: string
      /** `null` until the platform has reported numbers. */
      metrics: {
        impressions: number
        reach: number
        engagement: number
        likes: number
        comments: number
        shares: number
        saves: number
        clicks: number
        video_views?: number
      } | null
      fetched_at: string | null
    }[]
  }
}

export type MediaAsset = {
  id: string
  kind: "image" | "video"
  /** Public URL. Use it as post media. */
  url: string
  /** Storage key, unique per user. */
  r2_key: string
  filename?: string
  mime_type?: string
  size_bytes?: number
  width?: number
  height?: number
  duration_ms?: number
  tags: string[]
  /** How many of your posts use this file. */
  used_in_count: number
  origin: "upload" | "ai_image" | "backfill"
  created_at: string
}

export type MediaLibraryPage = {
  items: MediaAsset[]
  /** Pass as `cursor` for the next page; null on the last page. */
  next_cursor: string | null
}

export type Plug = {
  /** MongoDB ObjectId (24-character hex string) */
  id: string
  /** MongoDB ObjectId (24-character hex string) */
  post_id: string
  /** The connected account (post target) the plug watches. */
  account_id: string
  trigger: {
    metric: "likes" | "comments" | "reposts" | "views"
    threshold: number
  }
  action: {
    kind: "repost" | "comment"
    text?: string
  }
  /** armed: watching (or firing). fired: the action ran once. expired: the window ended, or the post was deleted. failed: see error. */
  state: "armed" | "fired" | "expired" | "failed"
  /** Last value read from the platform. */
  last_value?: number
  last_checked_at?: string
  fired_at?: string
  expires_at: string
  /** Why the plug failed or ended, or a read problem while it keeps watching. AMBIGUOUS_MAY_HAVE_POSTED: check the platform before arming again. */
  error?: {
    code: string
    message: string
  }
  created_at: string
}

export type AiImageAllowance = {
  used: number
  /** Images per month on your plan; null is unlimited. */
  limit: number | null
  /** Null is unlimited. */
  remaining: number | null
  /** When the count starts again. */
  resetAt: string
}

export type GeneratedImage = {
  /** The media library entry (empty when it could not be recorded). */
  asset_id: string
  /** Public URL. Use it as post media (type `image`). */
  url: string
  width: number
  height: number
  mime_type: string
}

export type GenerateImageRequest = {
  /** What the image shows. Required unless `fromCaption` is set. */
  prompt?: string
  /** The post caption, used with `fromCaption`. */
  caption?: string
  /** Draw an image for the caption (no text in the image). */
  fromCaption?: boolean
  /** square 1024×1024, portrait 1024×1536, landscape 1536×1024. */
  aspect: "square" | "portrait" | "landscape"
  /** Options to make (default 1). Each uses one image of the allowance. */
  count?: number
  /** Retry with the same id to get the first result instead of new images. */
  requestId?: string
}

export type GenerateImageResponse = {
  images: GeneratedImage[]
  /** Images that could not be made; they were not counted. */
  failed: number
  allowance: AiImageAllowance
}

export type LinkClicks = {
  /** MongoDB ObjectId (24-character hex string) */
  post_id: string
  links: {
    /** MongoDB ObjectId (24-character hex string) */
    post_link_id: string
    /** The `/l/<code>` path segment. */
    code: string
    /** `<platform>:<account_id>` of the target the link was made for. */
    target_key: string
    destination_url: string
    /** Clicks since the link was made. Link previews and crawlers are not counted. */
    total: number
    /** The last 30 days, oldest first. */
    daily: {
      /** UTC day, YYYY-MM-DD. */
      day: string
      clicks: number
    }[]
  }[]
}

export type Signature = {
  /** MongoDB ObjectId (24-character hex string) */
  id: string
  name: string
  /** Appended after a blank line at publish. */
  text: string
  /** `"all"` applies to every connected account; otherwise the connected-account ids it applies to. */
  account_ids: "all" | string[]
  /** Added to every post on its accounts unless the post picks another signature or `none`. A default for one account wins over a default for all. */
  is_default: boolean
  created_at: string
  updated_at: string
}

export type PostingSlot = {
  /** MongoDB ObjectId (24-character hex string) */
  id: string
  /** Connected accounts this slot posts for. */
  account_ids: string[]
  /** 0 = Sunday … 6 = Saturday, in `timezone`. */
  weekday: number
  /** Minutes after local midnight (570 = 09:30). */
  minutes: number
  /** IANA zone. The slot keeps its wall-clock time across daylight-saving changes: a time the clocks skip moves to just after the gap, a repeated time uses its first occurrence. */
  timezone: string
  created_at: string
  updated_at: string
}

export type ClientInviteAccount = {
  /** MongoDB ObjectId (24-character hex string) */
  id: string
  platform: string
  username?: string
}

export type ClientInvite = {
  /** MongoDB ObjectId (24-character hex string) */
  id: string
  /** The account group the connected accounts land in. */
  group_id: string
  group_name?: string
  platforms: string[]
  max_accounts: number
  /** Connected-account ids added through this invite. */
  used_account_ids: string[]
  accounts: ClientInviteAccount[]
  /** The signed public URL. Returned only by POST, once. */
  url?: string
  /** Whether the link still adds accounts. Known values: `active`, `used_up`, `expired`, `revoked`. Treat any other value as unknown, never as an error. */
  state: string
  expires_at: string
  revoked_at?: string
  created_at: string
}

export type ClientInviteError = {
  error: string
  code: string
}

export type RssFeedTemplate = {
  instructions?: string
  tone?: string
} | null

export type RssFeed = {
  /** MongoDB ObjectId (24-character hex string) */
  _id: string
  url: string
  platforms: string[]
  /** Polled. Same as `!paused`. */
  active: boolean
  paused: boolean
  /** Turned off after 5 failed polls in a row. Resume to try again. */
  stopped_after_errors: boolean
  last_polled_at: string | null
  last_item_id: string | null
  error_count: number
  /** `draft`: each new item becomes a draft of its text. `ai_draft`: AI writes the post, it lands as a draft for review. `ai_schedule`: AI writes the post and schedules it into the next free posting slot of the feed's accounts, so it publishes without review. When no slot is free in the next 14 days the post stays a draft and you are notified. */
  mode: "draft" | "ai_draft" | "ai_schedule"
  template: RssFeedTemplate
  /** `feed`: the item's own image, when it has a public https one. `ai`: one AI image, counted against the plan's monthly AI image allowance (none once it is used up). */
  image: "none" | "feed" | "ai"
  /** Accounts AI posts go to. Empty: the first connected account of each platform. */
  account_ids: string[]
  /** AI posts a day from this feed. Across all feeds a user gets at most 10 AI posts a day. */
  daily_cap: number
}

export type PlatformCatalogOptionField = {
  /** The target `metadata` key it writes; the stored value is always a string. */
  key: string
  label: string
  /** Field type. Known values: `text`, `textarea`, `select`, `toggle`, `tags`, `url`, `image`, `datetime`. Treat any other value as unknown, never as an error. */
  type: string
  required?: boolean
  placeholder?: string
  help?: string
  choices?: {
    value: string
    label: string
  }[]
  maxLength?: number
  maxItems?: number
  maxItemLength?: number
  defaultValue?: string
  contentTypes?: string[]
}

export type PlatformCatalogEntry = {
  /** Lower snake_case platform id. */
  id: string
  label: string
  /** SF Symbol (or brand asset) name for iOS. */
  iosGlyph: string
  /** How an account connects. `legacy`: the platform's own connect routes; the others: `/api/platform-connect/<id>/*`. Known values: `legacy`, `oauth2`, `credentials`, `bot`, `webhook`. Treat any other value as unknown, never as an error. */
  connectKind: string
  approval?: {
    required: boolean
    /** Vendor review state. Known values: `not_submitted`, `submitted`, `approved`, `vendor_closed`. Treat any other value as unknown, never as an error. */
    status: string
    devModeUsable: boolean
    note?: string
    submittedAt?: string
    appliesTo?: string
  }
  content: {
    /** Content model. Known values: `short`, `article`. Treat any other value as unknown, never as an error. */
    model: string
    textLimit: number
    textLimitByContentType?: Record<string, number>
    /** Most characters when the post has media, where lower than `textLimit`. */
    textLimitWithMedia?: number
    /** How text is counted (`chars` = UTF-16 code units). Known values: `chars`, `graphemes`, `bytes`. Treat any other value as unknown, never as an error. */
    countBy: string
    threads: boolean
    firstComment: boolean
  }
  /** Your accounts on this platform whose limit differs from `content.textLimit`, by account id. */
  accountTextLimits?: Record<string, number>
  media: {
    maxImages: number
    maxVideos: number
    mixed: boolean
    mimeTypes: string[]
    maxImageBytes?: number
    maxVideoBytes?: number
    altText: boolean
    /** Known values: `image`, `frame`. */
    cover: string[]
    exactSizes?: {
      width: number
      height: number
    }[]
  }
  options: PlatformCatalogOptionField[]
  destinations: {
    /** How a target picks where it posts. Known values: `none`, `list`, `manual`. Treat any other value as unknown, never as an error. */
    mode: string
    required: boolean
    placeholder?: string
  }
  /** Whether a retried publish can post twice. Known values: `key`, `none`, `retry_safe`. Treat any other value as unknown, never as an error. */
  idempotency: string
  article?: {
    titleRequired: boolean
    titleMax: number
    tagsMax: number
    canonicalUrl: boolean
    coverImage: boolean
    /** Characters of the article body, when lower than the general ceiling. */
    bodyMax?: number
    /** Characters of one tag, when lower than the general ceiling. */
    tagMax?: number
    /** What one tag may contain: a regular expression (character classes only) matched against the whole tag after trimming and dropping a leading `#`. */
    tagPattern?: string
    /** The tag pattern in words ("letters and numbers"). */
    tagHint?: string
  }
  metrics: boolean
  /** Non-legacy connect only: the oauth2 instance field (sent as `instanceUrl` to start) or the credentials / bot / webhook fields. */
  connectForm?: {
    intro?: string
    steps?: string[]
    fields: {
      key: string
      label: string
      /** Input type. Known values: `text`, `url`, `password`, `select`. Treat any other value as unknown, never as an error. */
      type: string
      placeholder?: string
      help?: string
      options?: {
        value: string
        label: string
      }[]
      /** Typed in a secure field; never echoed back. */
      secret?: boolean
    }[]
  }
}

export type PlatformCatalog = {
  data: PlatformCatalogEntry[]
}

export type PlatformDestination = {
  /** Stored as the target's `metadata.destination_id`. */
  id: string
  /** Stored as `metadata.destination_label`. */
  label: string
  description?: string
}

export type BulkPostActionRequest = {
  action: "schedule" | "delete" | "update_status"
  post_ids: string[]
  /** ISO 8601. Required for `schedule`. */
  scheduled_for?: string
  /** IANA zone for `schedule`. Defaults to UTC. */
  timezone?: string
  /** Required for `update_status`. */
  status?: "draft" | "scheduled"
}

export type PlugTarget = {
  /** MongoDB ObjectId (24-character hex string) */
  account_id: string
  platform: Platform
  metrics: Array<"likes" | "comments" | "reposts" | "views">
  actions: Array<"repost" | "comment">
  max_comment_length: number
  published: boolean
}

export type PostPlugs = {
  plugs: Plug[]
  /** Targets of the post that can carry a plug (X, Instagram, Facebook, LinkedIn company pages). */
  targets: PlugTarget[]
  limits: {
    per_target: number
    armed_per_user: number
  }
}

export type ArmPlugRequest = {
  /** MongoDB ObjectId (24-character hex string) */
  account_id: string
  trigger: {
    metric: "likes" | "comments" | "reposts" | "views"
    threshold: number
  }
  action: {
    kind: "repost" | "comment"
    /** Required for `comment`. On X a comment is a reply under the post. */
    text?: string
  }
}

export type SignatureList = {
  signatures: Signature[]
  /** How many signatures you can save (20). */
  limit: number
}

export type CreateSignatureRequest = {
  name: string
  text: string
  /** Default `"all"`. */
  account_ids?: "all" | string[]
  /** Default false. Saving a default turns off the defaults it would compete with. */
  is_default?: boolean
}

export type UpdateSignatureRequest = {
  name?: string
  text?: string
  /** Default `"all"`. */
  account_ids?: "all" | string[]
  /** Default false. Saving a default turns off the defaults it would compete with. */
  is_default?: boolean
}

export type CreatePostingSlotRequest = {
  account_ids: string[]
  weekday: number
  /** Minutes after local midnight. Or send `time`. */
  minutes?: number
  /** "HH:mm", 24-hour. Or send `minutes`. */
  time?: string
  timezone: string
}

export type UpdatePostingSlotRequest = {
  account_ids?: string[]
  weekday?: number
  /** Minutes after local midnight. Or send `time`. */
  minutes?: number
  /** "HH:mm", 24-hour. Or send `minutes`. */
  time?: string
  timezone?: string
}

export type SlotOccurrence = {
  /** MongoDB ObjectId (24-character hex string) */
  slot_id: string
  at: string
  account_ids: string[]
  timezone: string
  /** No scheduled post targets one of the accounts within 5 minutes. */
  free: boolean
}

export type FreeSlot = {
  /** The slot instant (UTC). */
  at: string
  /** MongoDB ObjectId (24-character hex string) */
  slot_id: string
  /** The slot's zone. */
  timezone: string
  /** The slot is held for this caller until then (10 minutes), so concurrent requests get different slots. A post saved at `at` keeps it after that. */
  reserved_until: string
}

export type CreateRssFeedRequest = {
  url: string
  /** Platforms to post to. Defaults to the platforms of `account_ids`; one of the two is required. */
  platforms?: string[]
  /** `draft`: each new item becomes a draft of its text. `ai_draft`: AI writes the post, it lands as a draft for review. `ai_schedule`: AI writes the post and schedules it into the next free posting slot of the feed's accounts, so it publishes without review. When no slot is free in the next 14 days the post stays a draft and you are notified. */
  mode?: "draft" | "ai_draft" | "ai_schedule"
  template?: RssFeedTemplate
  /** `feed`: the item's own image, when it has a public https one. `ai`: one AI image, counted against the plan's monthly AI image allowance (none once it is used up). */
  image?: "none" | "feed" | "ai"
  account_ids?: string[]
  daily_cap?: number
}

export type UpdateRssFeedRequest = {
  platforms?: string[]
  paused?: boolean
  /** `draft`: each new item becomes a draft of its text. `ai_draft`: AI writes the post, it lands as a draft for review. `ai_schedule`: AI writes the post and schedules it into the next free posting slot of the feed's accounts, so it publishes without review. When no slot is free in the next 14 days the post stays a draft and you are notified. */
  mode?: "draft" | "ai_draft" | "ai_schedule"
  template?: RssFeedTemplate
  /** `feed`: the item's own image, when it has a public https one. `ai`: one AI image, counted against the plan's monthly AI image allowance (none once it is used up). */
  image?: "none" | "feed" | "ai"
  account_ids?: string[]
  daily_cap?: number
}

export type PlatformDestinationList = {
  /** `list`: pick one of `destinations`. `manual`: the platform cannot list them; POST what the user typed to verify it. */
  mode: "list" | "manual"
  destinations: PlatformDestination[]
}

/** Every v1 operation, keyed by "METHOD /path". */
export interface Operations {
  /** List connected social media accounts */
  "GET /connected-accounts": {
    path: never
    query: {
      /** Connected-account platform identifier */
      platform?: Platform
    }
    body: never
    response: {
      data: ConnectedAccount[]
      /** The account to open on when this client has no choice of its own: the one the user last picked on any device, else the oldest connected account. Null when there is none. */
      selected_account_id?: string | null
    }
  }
  /** Disconnect a connected account */
  "DELETE /connected-accounts/{id}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: {
      success: true
    }
  }
  /** List posts */
  "GET /posts": {
    path: never
    query: {
      status?: "draft" | "scheduled" | "publishing" | "published" | "partially_published" | "failed" | "pending_approval"
      /** Comma-separated post tag ids. Returns posts that carry any of them. */
      tags?: string
      limit?: number
      offset?: number | null
    }
    body: never
    response: PaginatedPosts
  }
  /** Create a post */
  "POST /posts": {
    path: never
    query: never
    body: CreatePostRequest
    response: PostEnvelope
  }
  /** Get a post by ID */
  "GET /posts/{id}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: PostEnvelope
  }
  /** Update a post */
  "PUT /posts/{id}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: {
      content?: {
        /** Post body. Each target publishes its platform override text, else this text, and it must fit the platform: instagram 2200, facebook 63206, twitter 280, linkedin 3000, threads 500, bluesky 300, youtube 5000, pinterest 800, tiktok 2200. An X account with X Premium may post up to 4000 characters where long posts are on for the account (rolling out); each account's limit is `text_limit` in GET /connected-accounts. Checked when the post is scheduled or published (drafts always save): a text that does not fit is a 400 whose `targets` lists each target ({ platform, account_id, message }). */
        text?: string
        media?: {
          type: "image" | "video"
          url: string
          /** Alt text for an image, sent to every platform that accepts alt text. */
          alt_text?: string
          /** Video only: the chosen cover image (an uploaded image or a grabbed frame). Sent to YouTube (custom thumbnail, unless yt_thumbnail_url is set), Instagram reels (cover_url) and Pinterest video pins (cover_image_url). `thumbnail_url` stays the automatic poster. */
          cover_url?: string
          /** Video only: the time of the chosen cover frame, in milliseconds. Sent to Instagram reels (thumb_offset, when there is no cover_url) and TikTok Direct Post (video_cover_timestamp_ms). */
          cover_time_ms?: number
        }[]
      }
      platform_overrides?: Record<string, {
        text?: string
        media?: {
          type: "image" | "video"
          url: string
          /** Alt text for an image, sent to every platform that accepts alt text. */
          alt_text?: string
          /** Video only: the chosen cover image (an uploaded image or a grabbed frame). Sent to YouTube (custom thumbnail, unless yt_thumbnail_url is set), Instagram reels (cover_url) and Pinterest video pins (cover_image_url). `thumbnail_url` stays the automatic poster. */
          cover_url?: string
          /** Video only: the time of the chosen cover frame, in milliseconds. Sent to Instagram reels (thumb_offset, when there is no cover_url) and TikTok Direct Post (video_cover_timestamp_ms). */
          cover_time_ms?: number
        }[]
        content_type?: string
        /** Follow-up parts published as replies after the post (threads), in order */
        parts?: {
          text: string
          media?: {
            type: "image" | "video"
            url: string
            /** Alt text for an image, sent to every platform that accepts alt text. */
            alt_text?: string
            /** Video only: the chosen cover image (an uploaded image or a grabbed frame). Sent to YouTube (custom thumbnail, unless yt_thumbnail_url is set), Instagram reels (cover_url) and Pinterest video pins (cover_image_url). `thumbnail_url` stays the automatic poster. */
            cover_url?: string
            /** Video only: the time of the chosen cover frame, in milliseconds. Sent to Instagram reels (thumb_offset, when there is no cover_url) and TikTok Direct Post (video_cover_timestamp_ms). */
            cover_time_ms?: number
          }[]
        }[]
        /** A comment posted under the post by the same account */
        first_comment?: string
        /** Admin preview (ignored for other accounts). This platform was detached from the shared draft: its text, media and options are its own and do not follow edits to `content`. */
        detached?: boolean
        /** Admin preview (ignored for other accounts). The signature appended to this target at publish: a signature id, or `none` for no signature. Omit for the account's default signature. */
        signature_id?: string
        /** Article platforms only: the article title. */
        title?: string
        /** Article platforms only: the article body, Markdown. */
        body?: string
        /** Article platforms only: where the article first appeared (http or https). */
        canonical_url?: string
        /** Article platforms only: cover image URL (http or https). */
        cover_image?: string
        /** Article platforms only: tags. */
        tags?: string[]
      }>
      platforms?: {
        /** Platform id. Known values: `instagram`, `messenger`, `whatsapp`, `linkedin`, `twitter`, `tiktok`, `telegram`, `threads`, `youtube`, `bluesky`, `pinterest`, `facebook`, `discord`, `mastodon`, `lemmy`, `devto`, `hashnode`, `wordpress`, `listmonk`. Treat any other value as unknown, never as an error. */
        platform: string
        /** MongoDB ObjectId (24-character hex string) */
        account_id: string
        /** Platform format, e.g. Instagram feed, carousel, reels, stories; Facebook story; X article for an X Article (rolling out). An X Article must be the post's only target, has no platform override and does not repeat; content.text is its body (up to 100000 characters) and content.media holds its images (images only). */
        content_type?: string
        /** Platform options as flat string keys. X Article: x_article_title (required, one line, up to 200 characters), x_article_format (markdown, the default, or content_state: content.text is then X's raw block JSON with image data { media_url }), x_article_cover_url (https URL equal to one of the post's images). */
        metadata?: Record<string, string>
      }[]
      schedule_type?: "immediate" | "scheduled"
      scheduled_at?: string
      timezone?: string
      status?: "draft" | "scheduled" | "publishing" | "published" | "partially_published" | "failed" | "pending_approval"
      tags?: string[]
      /** Send null to clear an existing recurrence */
      recurrence?: {
        frequency: "daily" | "weekly" | "biweekly" | "monthly"
        days_of_week?: number[]
        end_date?: string
        end_after_count?: number
      } | null
      /** Set true, after checking X, to re-arm an X Article whose last publish is unconfirmed (it may already be live). Without it such an edit answers 409 with code ARTICLE_UNCONFIRMED. */
      acknowledge_unconfirmed?: boolean
    }
    response: PostEnvelope
  }
  /** Delete a post */
  "DELETE /posts/{id}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: {
      data: {
        deleted: true
        /** MongoDB ObjectId (24-character hex string) */
        id: string
      }
    }
  }
  /** Schedule a draft post */
  "POST /posts/{id}/schedule": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: {
      scheduled_at: string
      timezone: string
      /** Set true, after checking X, to schedule a post with an X Article whose last publish is unconfirmed (it may already be live). Without it that answers 409 with code ARTICLE_UNCONFIRMED. */
      acknowledge_unconfirmed?: boolean
    }
    response: PostEnvelope
  }
  /** Publish a draft or scheduled post immediately */
  "POST /posts/{id}/publish": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: PostEnvelope
  }
  /** Cancel a scheduled post — reverts to draft */
  "POST /posts/{id}/cancel": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: PostEnvelope
  }
  /** Apply one action to existing posts */
  "POST /posts/bulk": {
    path: never
    query: never
    body: BulkPostActionRequest
    response: BulkOperationResultEnvelope
  }
  /** Import posts from a CSV file (drafts) */
  "POST /posts/import": {
    path: never
    query: never
    body: never
    response: {
      data: PostImportResult
    }
  }
  /** Get calendar of scheduled posts */
  "GET /calendar": {
    path: never
    query: {
      year?: number
      month?: number
      timezone?: string
      /** Comma-separated post tag ids. Returns posts that carry any of them. */
      tags?: string
      /** Account group: only posts with a target in it (SCHEDULER_CALENDAR_CARD_ACTIONS). */
      groupId?: string
    }
    body: never
    response: CalendarMonthEnvelope
  }
  /** List automation flows */
  "GET /flows": {
    path: never
    query: {
      /** The connected account's `platform_user_id`. Returns up to 200 flows, newest first. */
      platform_user_id: string
    }
    body: never
    response: FlowListEnvelope
  }
  /** Create a flow */
  "POST /flows": {
    path: never
    query: never
    body: CreateFlowRequest
    response: FlowEnvelope
  }
  /** Get a flow with nodes + edges */
  "GET /flows/{id}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: FlowGraphEnvelope
  }
  /** Update flow metadata or status */
  "PATCH /flows/{id}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: {
      name?: string
      description?: string
      status?: "draft" | "published" | "archived"
      trigger?: Record<string, unknown>
    }
    response: FlowUpdateEnvelope
  }
  /** Delete a flow */
  "DELETE /flows/{id}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: void
  }
  /** Add a node to a flow */
  "POST /flows/{id}/nodes": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: {
      type: string
      data: Record<string, unknown>
      position?: {
        x: number
        y: number
      }
    }
    response: FlowNodeEnvelope
  }
  /** Update a node's data */
  "PUT /flows/{id}/nodes/{nodeId}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
      nodeId: string
    }
    query: never
    body: {
      data: Record<string, unknown>
    }
    response: FlowNodeEnvelope
  }
  /** Add an edge connecting two nodes */
  "POST /flows/{id}/edges": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: {
      source: string
      target: string
      sourceHandle?: string
      targetHandle?: string
      type?: string
      data?: Record<string, unknown>
    }
    response: FlowEdgeEnvelope
  }
  /** Get execution stats for a flow */
  "GET /flows/{id}/stats": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: FlowStats
  }
  /** Get data collected by this flow's data_collection nodes */
  "GET /flows/{id}/collected-data": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: CollectedDataPage
  }
  /** Generate a flow from a natural-language description (AI) */
  "POST /flows/generate": {
    path: never
    query: never
    body: {
      description: string
      /** MongoDB ObjectId (24-character hex string) */
      account_id: string
      platform_user_id: string
      /** Connected-account platform identifier */
      platform?: Platform
    }
    response: void
  }
  /** Get analytics overview or per-post metrics */
  "GET /analytics": {
    path: never
    query: {
      /** MongoDB ObjectId (24-character hex string) */
      post_id?: string
      start_date?: string
      end_date?: string
      /** Connected-account platform identifier */
      platform?: Platform
    }
    body: never
    response: ObjectEnvelope
  }
  /** Export analytics data (CSV or JSON) */
  "GET /analytics/export": {
    path: never
    query: {
      type: "posts" | "flows" | "accounts"
      format?: "json" | "csv"
      from?: string
      to?: string
    }
    body: never
    response: void
  }
  /** Get content insights (what has worked) */
  "GET /analytics/content-insights": {
    path: never
    query: {
      weeks?: number
    }
    body: never
    response: {
      data: ContentInsights
    }
  }
  /** List contacts */
  "GET /contacts": {
    path: never
    query: {
      limit?: number
      offset?: number | null
      /** Connected-account platform identifier */
      platform?: Platform
    }
    body: never
    response: ContactListEnvelope
  }
  /** Create a contact */
  "POST /contacts": {
    path: never
    query: never
    body: {
      /** Connected-account platform identifier */
      platform: Platform
      platform_user_id: string
      first_name?: string
      last_name?: string
      email?: string
      phone?: string
    }
    response: ContactEnvelope
  }
  /** Get a contact */
  "GET /contacts/{id}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: ContactEnvelope
  }
  /** Bulk-import contacts via CSV */
  "POST /contacts/import": {
    path: never
    query: never
    body: never
    response: ObjectEnvelope
  }
  /** Export contacts as CSV */
  "GET /contacts/export": {
    path: never
    query: never
    body: never
    response: void
  }
  /** List custom-field definitions */
  "GET /contacts/custom-fields": {
    path: never
    query: never
    body: never
    response: {
      data: Record<string, unknown>[]
    }
  }
  /** Create a custom-field definition */
  "POST /contacts/custom-fields": {
    path: never
    query: never
    body: {
      key: string
      label: string
      type: "text" | "number" | "date" | "boolean" | "select"
    }
    response: ObjectEnvelope
  }
  /** List user-created flow templates */
  "GET /templates": {
    path: never
    query: never
    body: never
    response: {
      data: Record<string, unknown>[]
    }
  }
  /** Create a flow template */
  "POST /templates": {
    path: never
    query: never
    body: Record<string, unknown>
    response: ObjectEnvelope
  }
  /** List pre-built system flow templates */
  "GET /system-templates": {
    path: never
    query: never
    body: never
    response: {
      data: Record<string, unknown>[]
    }
  }
  /** List broadcasts */
  "GET /broadcasts": {
    path: never
    query: never
    body: never
    response: {
      data: Record<string, unknown>[]
      meta?: {
        quota: Record<string, unknown>
      }
    }
  }
  /** Create a broadcast */
  "POST /broadcasts": {
    path: never
    query: never
    body: Record<string, unknown>
    response: ObjectEnvelope
  }
  /** List sequences */
  "GET /sequences": {
    path: never
    query: never
    body: never
    response: {
      data: Record<string, unknown>[]
    }
  }
  /** Create a sequence */
  "POST /sequences": {
    path: never
    query: never
    body: Record<string, unknown>
    response: ObjectEnvelope
  }
  /** List tags */
  "GET /tags": {
    path: never
    query: never
    body: never
    response: {
      data: Record<string, unknown>[]
    }
  }
  /** Create a tag */
  "POST /tags": {
    path: never
    query: never
    body: Record<string, unknown>
    response: ObjectEnvelope
  }
  /** List segments */
  "GET /segments": {
    path: never
    query: never
    body: never
    response: {
      data: Record<string, unknown>[]
    }
  }
  /** Create a segment */
  "POST /segments": {
    path: never
    query: never
    body: Record<string, unknown>
    response: ObjectEnvelope
  }
  /** List bot fields */
  "GET /bot-fields": {
    path: never
    query: never
    body: never
    response: {
      data: Record<string, unknown>[]
    }
  }
  /** Create a bot field */
  "POST /bot-fields": {
    path: never
    query: never
    body: Record<string, unknown>
    response: ObjectEnvelope
  }
  /** List webhooks */
  "GET /webhooks": {
    path: never
    query: never
    body: never
    response: {
      data: Webhook[]
    }
  }
  /** Create a webhook */
  "POST /webhooks": {
    path: never
    query: never
    body: CreateWebhookRequest
    response: {
      /** An outbound webhook subscription. Deliveries are signed with the signing secret. */
      data: Webhook & {
        signing_secret: string
      }
    }
  }
  /** Update a webhook */
  "PATCH /webhooks/{id}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: UpdateWebhookRequest
    response: {
      data: Webhook
    }
  }
  /** Delete a webhook */
  "DELETE /webhooks/{id}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: {
      data: {
        /** MongoDB ObjectId (24-character hex string) */
        id: string
        deleted: true
      }
    }
  }
  /** List live-chat sessions */
  "GET /live-chat": {
    path: never
    query: never
    body: never
    response: {
      data: Record<string, unknown>[]
    }
  }
  /** Create a live-chat session */
  "POST /live-chat": {
    path: never
    query: never
    body: Record<string, unknown>
    response: ObjectEnvelope
  }
  /** Get notes on a live-chat session */
  "GET /live-chat/{sessionId}/notes": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      sessionId: string
    }
    query: never
    body: never
    response: {
      data: Record<string, unknown>[]
    }
  }
  /** Get auto-message settings (welcome, away, default reply) */
  "GET /settings/auto-messages": {
    path: never
    query: never
    body: never
    response: ObjectEnvelope
  }
  /** Update auto-message settings */
  "POST /settings/auto-messages": {
    path: never
    query: never
    body: Record<string, unknown>
    response: ObjectEnvelope
  }
  /** Register (or refresh) a mobile device for push notifications */
  "POST /devices": {
    path: never
    query: never
    body: RegisterDeviceRequest
    response: {
      data: Device
    }
  }
  /** Issue a presigned PUT URL for direct-to-R2 media uploads */
  "POST /uploads/presign": {
    path: never
    query: never
    body: PresignUploadRequest
    response: PresignUploadResponse
  }
  /** Confirm a presigned upload and enforce the size limit */
  "POST /uploads/verify": {
    path: never
    query: never
    body: VerifyUploadRequest
    response: VerifyUploadResponse
  }
  /** Copy a file from a public URL into your uploads */
  "POST /uploads/from-url": {
    path: never
    query: never
    body: UploadFromUrlRequest
    response: UploadFromUrlResponse
  }
  /** Unregister a mobile device — stops push delivery to this device */
  "DELETE /devices/{id}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: void
  }
  /** Register a Live Activity push token */
  "POST /activities/register": {
    path: never
    query: never
    body: RegisterActivityRequest
    response: {
      data: LiveActivityRegistration
    }
  }
  /** Aggregated cold-launch feed for the mobile app */
  "GET /me/feed": {
    path: never
    query: {
      /** IANA timezone identifier (e.g. America/New_York). Defaults to UTC if omitted or invalid. */
      tz?: string
      /** Optional connected-account scope. When set, counts include only items associated with this account. */
      account_id?: string
    }
    body: never
    response: MeFeedResponse
  }
  /** Get the authenticated user mobile push preferences */
  "GET /me/notification-preferences": {
    path: never
    query: never
    body: never
    response: NotificationPreferencesResponse
  }
  /** Update the authenticated user mobile push preferences */
  "PATCH /me/notification-preferences": {
    path: never
    query: never
    body: NotificationPreferencesPatch
    response: NotificationPreferencesResponse
  }
  /** Save the account the user picked */
  "PUT /me/selected-account": {
    path: never
    query: never
    body: {
      account_id: string
    }
    response: {
      saved: boolean
    }
  }
  /** List the comment-automation templates */
  "GET /automation/templates": {
    path: never
    query: never
    body: never
    response: {
      data: PostAutomationTemplate[]
    }
  }
  /** Build a draft comment automation */
  "POST /automation/drafts": {
    path: never
    query: never
    body: CreatePostAutomationDraftRequest
    response: {
      data: {
        flow_id: string
        /** The door used. Known values: `funnel`, `template`, `prompt`. Treat any other value as unknown, never as an error. */
        door: string
        /** Build state. Known values: `ready`, `building`. Treat any other value as unknown, never as an error. */
        state: string
      }
    }
  }
  /** Preview a draft comment automation */
  "GET /automation/drafts/{flowId}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      flowId: string
    }
    query: never
    body: never
    response: {
      data: PostAutomationDraftPreview
    }
  }
  /** Check a draft would turn on */
  "POST /automation/drafts/{flowId}/preflight": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      flowId: string
    }
    query: never
    body: never
    response: {
      data: PostAutomationPreflight
    }
  }
  /** Get a post's automation */
  "GET /posts/{id}/automation": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: {
      data: {
        automation: PostAutomationDTO & (Record<string, unknown> | null)
        preview: PostAutomationDraftPreview & (Record<string, unknown> | null)
      }
    }
  }
  /** Link a draft automation to a post */
  "POST /posts/{id}/automation": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: {
      /** MongoDB ObjectId (24-character hex string) */
      flow_id: string
      armed?: boolean
      previewed_hash?: string
      /** Replace the post's existing draft automation. */
      replace?: boolean
    }
    response: {
      data: {
        linked: boolean
        armed: boolean
      }
    }
  }
  /** Arm or unarm a post's automation */
  "PATCH /posts/{id}/automation": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: {
      armed: boolean
      previewed_hash?: string
    }
    response: {
      data: {
        armed: boolean
      }
    }
  }
  /** Remove a post's automation */
  "DELETE /posts/{id}/automation": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: {
      data: {
        detached: boolean
      }
    }
  }
  /** Re-bind a live post's automation to its media */
  "POST /posts/{id}/automation/rebind": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: {
      data: {
        bound: boolean
      }
    }
  }
  /** Attach a keyword comment-to-DM draft (deprecated) */
  "POST /posts/{id}/funnel": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: {
      keyword: string
      link?: string
      /** Required when the post targets several Instagram accounts. */
      accountId?: string
    }
    response: {
      data: {
        flowId: string
        flowName: string
      }
    }
  }
  /** Fill the blanks a draft flow still has */
  "POST /flows/{id}/fill-placeholders": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: {
      fills: {
        nodeId: string
        token: string
        value: string
      }[]
    }
    response: {
      ok: boolean
      filled: number
    }
  }
  /** Retry a draft flow's failed build */
  "POST /flows/{id}/generate-retry": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: {
      status: string
    }
  }
  /** List a post's client review links */
  "GET /posts/{id}/review-links": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: {
      data: ReviewSummary
    }
  }
  /** Make a client review link */
  "POST /posts/{id}/review-links": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: {
      /** Who the link is for. */
      reviewer_name?: string
    }
    response: {
      data: ReviewLink
    }
  }
  /** Revoke a client review link */
  "DELETE /posts/{id}/review-links": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: {
      /** MongoDB ObjectId (24-character hex string) */
      link_id: string
    }
    body: never
    response: {
      data: ReviewLink
    }
  }
  /** Duplicate a post as a draft */
  "POST /posts/{id}/duplicate": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: PostEnvelope
  }
  /** Quick stats of a post */
  "GET /calendar-actions/posts/{id}/stats": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: PostQuickStatsEnvelope
  }
  /** List your media library */
  "GET /media-library": {
    path: never
    query: {
      kind?: "image" | "video"
      tag?: string
      /** Search file names and tags. */
      q?: string
      /** Default 30. */
      limit?: number
      cursor?: string
    }
    body: never
    response: MediaLibraryPage
  }
  /** List a post's plugs */
  "GET /posts/{id}/plugs": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: {
      success: true
      data: PostPlugs
    }
  }
  /** Arm a plug on a post */
  "POST /posts/{id}/plugs": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: ArmPlugRequest
    response: {
      success: true
      data: Plug
    }
  }
  /** Remove a plug */
  "DELETE /posts/{id}/plugs": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: {
      /** MongoDB ObjectId (24-character hex string) */
      plug_id: string
    }
    body: never
    response: {
      success: true
      data: {
        deleted: true
      }
    }
  }
  /** Get your AI image allowance */
  "GET /media/generate-image": {
    path: never
    query: never
    body: never
    response: {
      allowance: AiImageAllowance
    }
  }
  /** Generate images for a post */
  "POST /media/generate-image": {
    path: never
    query: never
    body: GenerateImageRequest
    response: GenerateImageResponse
  }
  /** Clicks on a post's short links */
  "GET /posts/{id}/link-clicks": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: {
      success: true
      data: LinkClicks
    }
  }
  /** List your signatures */
  "GET /signatures": {
    path: never
    query: never
    body: never
    response: {
      success: true
      data: SignatureList
    }
  }
  /** Create a signature */
  "POST /signatures": {
    path: never
    query: never
    body: CreateSignatureRequest
    response: {
      success: true
      data: Signature
    }
  }
  /** Update a signature */
  "PATCH /signatures/{id}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: UpdateSignatureRequest
    response: {
      success: true
      data: Signature
    }
  }
  /** Delete a signature */
  "DELETE /signatures/{id}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: {
      success: true
      data: {
        deleted: true
      }
    }
  }
  /** List posting slots */
  "GET /posting-slots": {
    path: never
    query: {
      /** Comma-separated connected-account ids. */
      account_ids?: string
    }
    body: never
    response: {
      success: true
      data: PostingSlot[]
    }
  }
  /** Add a posting slot */
  "POST /posting-slots": {
    path: never
    query: never
    body: CreatePostingSlotRequest
    response: {
      success: true
      data: PostingSlot
    }
  }
  /** Change a posting slot */
  "PATCH /posting-slots/{id}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: UpdatePostingSlotRequest
    response: {
      success: true
      data: PostingSlot
    }
  }
  /** Remove a posting slot */
  "DELETE /posting-slots/{id}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: never
    response: {
      success: true
      data: {
        deleted: true
      }
    }
  }
  /** Posting slot times in a date range */
  "GET /posting-slots/occurrences": {
    path: never
    query: {
      from: string
      to: string
      timezone?: string
      /** Comma-separated connected-account ids. */
      account_ids?: string
    }
    body: never
    response: {
      success: true
      data: SlotOccurrence[]
    }
  }
  /** Find the next free posting slot */
  "GET /find-slot": {
    path: never
    query: {
      /** Comma-separated connected-account ids. */
      account_ids: string
      /** Only slots after this time. Default: now. */
      after?: string
    }
    body: never
    response: {
      success: true
      data: FreeSlot
    }
  }
  /** List client invites */
  "GET /client-invites": {
    path: never
    query: {
      /** MongoDB ObjectId (24-character hex string) */
      group_id?: string
    }
    body: never
    response: {
      data: ClientInvite[]
    }
  }
  /** Make a client invite */
  "POST /client-invites": {
    path: never
    query: never
    body: {
      /** MongoDB ObjectId (24-character hex string) */
      group_id: string
      /** Default: all five. */
      platforms?: string[]
      /** Default 5. */
      max_accounts?: number
    }
    response: {
      data: ClientInvite
    }
  }
  /** Turn off a client invite */
  "DELETE /client-invites": {
    path: never
    query: {
      /** MongoDB ObjectId (24-character hex string) */
      invite_id: string
    }
    body: never
    response: {
      data: ClientInvite
    }
  }
  /** List RSS feeds */
  "GET /rss-feeds": {
    path: never
    query: never
    body: never
    response: {
      success: true
      data: RssFeed[]
    }
  }
  /** Add an RSS feed */
  "POST /rss-feeds": {
    path: never
    query: never
    body: CreateRssFeedRequest
    response: {
      success: true
      data: RssFeed
    }
  }
  /** Change an RSS feed */
  "PATCH /rss-feeds/{id}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: UpdateRssFeedRequest
    response: {
      success: true
      data: RssFeed
    }
  }
  /** Pause or resume an RSS feed */
  "POST /rss-feeds/{id}/pause": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      id: string
    }
    query: never
    body: {
      /** Default true. */
      paused?: boolean
    }
    response: {
      success: true
      data: RssFeed
    }
  }
  /** List the platforms you can schedule to */
  "GET /scheduler/platforms": {
    path: never
    query: never
    body: never
    response: PlatformCatalog
  }
  /** List an account's destinations */
  "GET /composer-platform-parts/destinations/{accountId}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      accountId: string
    }
    query: {
      fresh?: "1"
    }
    body: never
    response: {
      success: true
      data: PlatformDestinationList
    }
  }
  /** Verify a destination */
  "POST /composer-platform-parts/destinations/{accountId}": {
    path: {
      /** MongoDB ObjectId (24-character hex string) */
      accountId: string
    }
    query: never
    body: {
      input: string
    }
    response: {
      success: true
      data: PlatformDestinationList
    }
  }
}

export type OperationKey = keyof Operations
export type ResponseOf<K extends OperationKey> = Operations[K]['response']
export type BodyOf<K extends OperationKey> = Operations[K]['body']
export type QueryOf<K extends OperationKey> = Operations[K]['query']
/** The `data` of a `{ data }` envelope, or the response itself. */
export type DataOf<K extends OperationKey> = ResponseOf<K> extends { data: infer D } ? D : ResponseOf<K>
