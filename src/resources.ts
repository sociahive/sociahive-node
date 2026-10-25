/**
 * Scheduler resources typed from the generated OpenAPI types. Each method is a
 * thin call to one v1 operation; the request and response types come from
 * `generated.ts`, so a spec change shows up as a type change here.
 *
 * Several features roll out behind per-account flags: until a feature reaches
 * your account its endpoints answer 403 with code `feature_disabled`.
 */

import type * as Api from './generated'
import { SociaHiveError } from './errors'
import type { Transport } from './transport'
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
  WebhookSubscription,
} from './types'

export function mediaResource(t: Transport) {
  return {
    /** Your media library, newest first. Page with `cursor` (`next_cursor` of the previous page). */
    list: (q: Api.QueryOf<'GET /media-library'> = {}): Promise<Api.MediaLibraryPage> =>
      t.call('GET /media-library', { query: q }),
    /** Copy a public image or video URL into SociaHive storage. */
    uploadFromUrl: (url: string): Promise<Api.UploadFromUrlResponse> =>
      t.call('POST /uploads/from-url', { body: { url } }),
    /** Step 1 of a direct upload: a presigned URL to PUT the file to. */
    presign: (input: Api.PresignUploadRequest): Promise<Api.PresignUploadResponse> =>
      t.call('POST /uploads/presign', { body: input }),
    /** Step 3 of a direct upload: confirm the file landed. `purpose: 'scheduler'` adds it to the media library. */
    verify: (input: Api.VerifyUploadRequest): Promise<Api.VerifyUploadResponse> =>
      t.call('POST /uploads/verify', { body: input }),
    /**
     * Upload bytes in one call: presign, PUT, verify. The file is added to the
     * media library. Returns the public URL to use in a post.
     */
    upload: async (input: {
      data: Blob | ArrayBuffer | Uint8Array
      filename: string
      mimeType: Api.PresignUploadRequest['mime_type']
    }): Promise<Api.VerifyUploadResponse & { public_url: string; key: string }> => {
      const bytes = input.data instanceof Blob ? new Uint8Array(await input.data.arrayBuffer()) : new Uint8Array(input.data)
      const presigned = await t.call('POST /uploads/presign', {
        body: { filename: input.filename, mime_type: input.mimeType, size_bytes: bytes.byteLength },
      })
      const put = await t.fetchImpl(presigned.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': input.mimeType, ...(presigned.required_headers ?? {}) },
        body: bytes,
      })
      if (!put.ok) {
        throw new SociaHiveError(`Upload failed with HTTP ${put.status}`, put.status, null, 'upload_failed')
      }
      const verified = await t.call('POST /uploads/verify', {
        body: { key: presigned.key, purpose: 'scheduler', filename: input.filename },
      })
      return { ...verified, key: presigned.key, public_url: verified.public_url ?? presigned.public_url }
    },
    /** Make up to 4 AI images from a description or a caption. They are added to the media library. */
    generateImage: (input: Api.GenerateImageRequest): Promise<Api.GenerateImageResponse> =>
      t.call('POST /media/generate-image', { body: input }),
    /** AI images made this month. Each image costs 5 AI credits. */
    imageAllowance: async (): Promise<Api.AiImageAllowance> =>
      (await t.call('GET /media/generate-image')).allowance,
  }
}

export function signaturesResource(t: Transport) {
  return {
    list: (): Promise<Api.SignatureList> => t.call('GET /signatures'),
    create: (input: Api.CreateSignatureRequest): Promise<Api.Signature> => t.call('POST /signatures', { body: input }),
    update: (id: string, patch: Api.UpdateSignatureRequest): Promise<Api.Signature> =>
      t.call('PATCH /signatures/{id}', { path: { id }, body: patch }),
    delete: (id: string): Promise<{ deleted: true }> => t.call('DELETE /signatures/{id}', { path: { id } }),
  }
}

export function postingSlotsResource(t: Transport) {
  return {
    list: (q: { accountIds?: string[] } = {}): Promise<Api.PostingSlot[]> =>
      t.call('GET /posting-slots', { query: { account_ids: q.accountIds } }),
    create: (input: Api.CreatePostingSlotRequest): Promise<Api.PostingSlot> =>
      t.call('POST /posting-slots', { body: input }),
    update: (id: string, patch: Api.UpdatePostingSlotRequest): Promise<Api.PostingSlot> =>
      t.call('PATCH /posting-slots/{id}', { path: { id }, body: patch }),
    delete: (id: string): Promise<{ deleted: true }> => t.call('DELETE /posting-slots/{id}', { path: { id } }),
    /** Slot instants between two dates. */
    occurrences: (q: { from: string; to: string; timezone?: string; accountIds?: string[] }): Promise<Api.SlotOccurrence[]> =>
      t.call('GET /posting-slots/occurrences', {
        query: { from: q.from, to: q.to, timezone: q.timezone, account_ids: q.accountIds },
      }),
    /**
     * The next free posting slot of these accounts (held for you for 10
     * minutes). Create the post with `scheduled_at` = `at` to keep it.
     */
    findSlot: (q: { accountIds: string[]; after?: string }): Promise<Api.FreeSlot> =>
      t.call('GET /find-slot', { query: { account_ids: q.accountIds, after: q.after } }),
  }
}

export function reviewLinksResource(t: Transport) {
  return {
    /** A post's review links and the client's decisions. URLs are not returned here. */
    list: (postId: string): Promise<Api.ReviewSummary> => t.call('GET /posts/{id}/review-links', { path: { id: postId } }),
    /** Make a link. The response carries the URL once; store it. */
    create: (postId: string, input: { reviewer_name?: string } = {}): Promise<Api.ReviewLink> =>
      t.call('POST /posts/{id}/review-links', { path: { id: postId }, body: input }),
    revoke: (postId: string, linkId: string): Promise<Api.ReviewLink> =>
      t.call('DELETE /posts/{id}/review-links', { path: { id: postId }, query: { link_id: linkId } }),
  }
}

export function plugsResource(t: Transport) {
  return {
    /** Plugs on a post, and the targets that can carry one. */
    list: (postId: string): Promise<Api.PostPlugs> => t.call('GET /posts/{id}/plugs', { path: { id: postId } }),
    /** Arm a plug: fires once when the metric reaches the threshold (repost or comment to a real audience). */
    arm: (postId: string, input: Api.ArmPlugRequest): Promise<Api.Plug> =>
      t.call('POST /posts/{id}/plugs', { path: { id: postId }, body: input }),
    delete: (postId: string, plugId: string): Promise<{ deleted: true }> =>
      t.call('DELETE /posts/{id}/plugs', { path: { id: postId }, query: { plug_id: plugId } }),
  }
}

export function linkClicksResource(t: Transport) {
  return {
    /** Every short link of a post with its total clicks and the last 30 days. */
    get: (postId: string): Promise<Api.LinkClicks> => t.call('GET /posts/{id}/link-clicks', { path: { id: postId } }),
  }
}

export function calendarResource(t: Transport) {
  return {
    /** Posts of one month, grouped by day. */
    month: (q: Api.QueryOf<'GET /calendar'> = {}): Promise<Api.DataOf<'GET /calendar'>> =>
      t.call('GET /calendar', { query: q }),
    /** Copy a post as a new draft (no schedule, no publish results). */
    duplicate: (postId: string): Promise<Api.Post> => t.call('POST /posts/{id}/duplicate', { path: { id: postId } }),
    /** The latest numbers each target of a post reported. */
    stats: (postId: string): Promise<Api.DataOf<'GET /calendar-actions/posts/{id}/stats'>> =>
      t.call('GET /calendar-actions/posts/{id}/stats', { path: { id: postId } }),
  }
}

export function clientInvitesResource(t: Transport) {
  return {
    list: (q: { group_id?: string } = {}): Promise<Api.ClientInvite[]> => t.call('GET /client-invites', { query: q }),
    /** Make an invite for an account group. The response carries the URL once. */
    create: (input: Api.BodyOf<'POST /client-invites'>): Promise<Api.ClientInvite> =>
      t.call('POST /client-invites', { body: input }),
    revoke: (inviteId: string): Promise<Api.ClientInvite> =>
      t.call('DELETE /client-invites', { query: { invite_id: inviteId } }),
  }
}

export function rssFeedsResource(t: Transport) {
  return {
    list: (): Promise<Api.RssFeed[]> => t.call('GET /rss-feeds'),
    create: (input: Api.CreateRssFeedRequest): Promise<Api.RssFeed> => t.call('POST /rss-feeds', { body: input }),
    update: (id: string, patch: Api.UpdateRssFeedRequest): Promise<Api.RssFeed> =>
      t.call('PATCH /rss-feeds/{id}', { path: { id }, body: patch }),
    pause: (id: string, paused = true): Promise<Api.RssFeed> =>
      t.call('POST /rss-feeds/{id}/pause', { path: { id }, body: { paused } }),
  }
}

/**
 * Outbound webhook subscriptions. The public spec types these loosely, so the
 * SDK carries its own types (`WebhookSubscription`).
 */
export function webhooksResource(t: Transport) {
  return {
    list: async (): Promise<WebhookSubscription[]> =>
      (await t.request<{ data: WebhookSubscription[] }>('GET', '/webhooks')).data,
    /** Subscribe an HTTPS URL. The response carries `signing_secret` once. */
    create: async (input: CreateWebhookInput): Promise<WebhookSubscription & { signing_secret: string }> =>
      (await t.request<{ data: WebhookSubscription & { signing_secret: string } }>('POST', '/webhooks', input)).data,
    update: async (id: string, patch: UpdateWebhookInput): Promise<WebhookSubscription> =>
      (await t.request<{ data: WebhookSubscription }>('PATCH', `/webhooks/${encodeURIComponent(id)}`, patch)).data,
    delete: async (id: string): Promise<void> => {
      await t.request('DELETE', `/webhooks/${encodeURIComponent(id)}`)
    },
  }
}
