/**
 * Contract test: every resource method sends the request the v1 spec
 * describes, against a mocked server, and returns the unwrapped `data`.
 *
 * The coverage check at the bottom fails when the spec gains a program
 * endpoint no SDK method calls.
 *
 * Run: npm test
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { SociaHive, SociaHiveError } from '../src/index'

const ID = '507f1f77bcf86cd799439011'
const ID2 = '507f1f77bcf86cd799439012'

interface Seen {
  method: string
  path: string
  query: Record<string, string>
  body: unknown
  headers: Record<string, string>
}

function mockClient(respond: (seen: Seen) => { status?: number; body: unknown; headers?: Record<string, string> } = () => ({ body: { success: true, data: { ok: true } } })) {
  const calls: Seen[] = []
  const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input))
    const seen: Seen = {
      method: init?.method ?? 'GET',
      path: url.pathname.replace(/^\/api\/v1/, ''),
      query: Object.fromEntries(url.searchParams.entries()),
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body,
      headers: Object.fromEntries(Object.entries((init?.headers ?? {}) as Record<string, string>)),
    }
    calls.push(seen)
    const out = respond(seen)
    return new Response(out.body === undefined ? '' : JSON.stringify(out.body), { status: out.status ?? 200, headers: out.headers })
  }) as typeof fetch
  const sh = new SociaHive({ apiKey: 'sk_test', baseUrl: 'https://api.test/api/v1', fetch: fetchImpl })
  return { sh, calls }
}

/** [spec operation key, call, expected path, expected query?, expected body?] */
type Case = [string, (sh: SociaHive) => Promise<unknown>, string, Record<string, string>?, unknown?]

const CASES: Case[] = [
  ['GET /connected-accounts', (sh) => sh.accounts.list('instagram'), '/connected-accounts', { platform: 'instagram' }],
  ['GET /posts', (sh) => sh.posts.list({ status: 'scheduled' }), '/posts', { status: 'scheduled' }],
  ['POST /posts', (sh) => sh.posts.create({ text: 'hi', platforms: [{ platform: 'x-new', account_id: ID }], schedule_type: 'immediate' }), '/posts', {}, { platforms: [{ platform: 'x-new', account_id: ID }], schedule_type: 'immediate', content: { text: 'hi' } }],
  ['GET /posts/{id}', (sh) => sh.posts.get(ID), `/posts/${ID}`],
  ['PUT /posts/{id}', (sh) => sh.posts.update(ID, { text: 'new' }), `/posts/${ID}`, {}, { content: { text: 'new' } }],
  ['DELETE /posts/{id}', (sh) => sh.posts.delete(ID), `/posts/${ID}`],
  ['POST /posts/{id}/schedule', (sh) => sh.posts.schedule(ID, '2026-11-01T09:00:00Z'), `/posts/${ID}/schedule`, {}, { scheduled_at: '2026-11-01T09:00:00Z', timezone: 'UTC' }],
  ['POST /posts/{id}/publish', (sh) => sh.posts.publish(ID), `/posts/${ID}/publish`],
  ['POST /posts/{id}/cancel', (sh) => sh.posts.cancel(ID), `/posts/${ID}/cancel`],
  ['POST /posts/bulk', (sh) => sh.posts.bulk({ action: 'schedule', post_ids: [ID, ID2], scheduled_for: '2026-11-01T09:00:00Z' }), '/posts/bulk', {}, { action: 'schedule', post_ids: [ID, ID2], scheduled_for: '2026-11-01T09:00:00Z' }],
  ['POST /posts/{id}/duplicate', (sh) => sh.calendar.duplicate(ID), `/posts/${ID}/duplicate`],
  ['GET /calendar', (sh) => sh.calendar.month({ year: 2026, month: 11 }), '/calendar', { year: '2026', month: '11' }],
  ['GET /calendar-actions/posts/{id}/stats', (sh) => sh.calendar.stats(ID), `/calendar-actions/posts/${ID}/stats`],
  ['GET /analytics', (sh) => sh.analytics.get({ platform: 'instagram' }), '/analytics', { platform: 'instagram' }],
  ['GET /analytics/export', (sh) => sh.analytics.export({ type: 'posts' }), '/analytics/export', { type: 'posts' }],
  ['GET /analytics/content-insights', (sh) => sh.analytics.contentInsights({ weeks: 4 }), '/analytics/content-insights', { weeks: '4' }],
  ['GET /media-library', (sh) => sh.media.list({ kind: 'image', limit: 5 }), '/media-library', { kind: 'image', limit: '5' }],
  ['POST /uploads/from-url', (sh) => sh.media.uploadFromUrl('https://x.test/a.png'), '/uploads/from-url', {}, { url: 'https://x.test/a.png' }],
  ['POST /uploads/presign', (sh) => sh.media.presign({ filename: 'a.png', mime_type: 'image/png', size_bytes: 3 }), '/uploads/presign', {}, { filename: 'a.png', mime_type: 'image/png', size_bytes: 3 }],
  ['POST /uploads/verify', (sh) => sh.media.verify({ key: 'k', purpose: 'scheduler' }), '/uploads/verify', {}, { key: 'k', purpose: 'scheduler' }],
  ['POST /media/generate-image', (sh) => sh.media.generateImage({ prompt: 'a cat', aspect: 'square' }), '/media/generate-image', {}, { prompt: 'a cat', aspect: 'square' }],
  ['GET /media/generate-image', (sh) => sh.media.imageAllowance(), '/media/generate-image'],
  ['GET /signatures', (sh) => sh.signatures.list(), '/signatures'],
  ['POST /signatures', (sh) => sh.signatures.create({ name: 'Sign', text: '-- us' }), '/signatures', {}, { name: 'Sign', text: '-- us' }],
  ['PATCH /signatures/{id}', (sh) => sh.signatures.update(ID, { is_default: true }), `/signatures/${ID}`, {}, { is_default: true }],
  ['DELETE /signatures/{id}', (sh) => sh.signatures.delete(ID), `/signatures/${ID}`],
  ['GET /posting-slots', (sh) => sh.postingSlots.list({ accountIds: [ID, ID2] }), '/posting-slots', { account_ids: `${ID},${ID2}` }],
  ['POST /posting-slots', (sh) => sh.postingSlots.create({ account_ids: [ID], weekday: 1, time: '09:00', timezone: 'UTC' }), '/posting-slots', {}, { account_ids: [ID], weekday: 1, time: '09:00', timezone: 'UTC' }],
  ['PATCH /posting-slots/{id}', (sh) => sh.postingSlots.update(ID, { weekday: 2 }), `/posting-slots/${ID}`, {}, { weekday: 2 }],
  ['DELETE /posting-slots/{id}', (sh) => sh.postingSlots.delete(ID), `/posting-slots/${ID}`],
  ['GET /posting-slots/occurrences', (sh) => sh.postingSlots.occurrences({ from: '2026-11-01', to: '2026-11-07' }), '/posting-slots/occurrences', { from: '2026-11-01', to: '2026-11-07' }],
  ['GET /find-slot', (sh) => sh.postingSlots.findSlot({ accountIds: [ID], after: '2026-11-01T00:00:00Z' }), '/find-slot', { account_ids: ID, after: '2026-11-01T00:00:00Z' }],
  ['GET /posts/{id}/link-clicks', (sh) => sh.linkClicks.get(ID), `/posts/${ID}/link-clicks`],
  ['GET /posts/{id}/review-links', (sh) => sh.reviewLinks.list(ID), `/posts/${ID}/review-links`],
  ['POST /posts/{id}/review-links', (sh) => sh.reviewLinks.create(ID, { reviewer_name: 'Ana' }), `/posts/${ID}/review-links`, {}, { reviewer_name: 'Ana' }],
  ['DELETE /posts/{id}/review-links', (sh) => sh.reviewLinks.revoke(ID, ID2), `/posts/${ID}/review-links`, { link_id: ID2 }],
  ['GET /posts/{id}/plugs', (sh) => sh.plugs.list(ID), `/posts/${ID}/plugs`],
  ['POST /posts/{id}/plugs', (sh) => sh.plugs.arm(ID, { account_id: ID2, trigger: { metric: 'likes', threshold: 100 }, action: { kind: 'repost' } }), `/posts/${ID}/plugs`, {}, { account_id: ID2, trigger: { metric: 'likes', threshold: 100 }, action: { kind: 'repost' } }],
  ['DELETE /posts/{id}/plugs', (sh) => sh.plugs.delete(ID, ID2), `/posts/${ID}/plugs`, { plug_id: ID2 }],
  ['GET /client-invites', (sh) => sh.clientInvites.list({ group_id: ID }), '/client-invites', { group_id: ID }],
  ['POST /client-invites', (sh) => sh.clientInvites.create({ group_id: ID, max_accounts: 2 }), '/client-invites', {}, { group_id: ID, max_accounts: 2 }],
  ['DELETE /client-invites', (sh) => sh.clientInvites.revoke(ID2), '/client-invites', { invite_id: ID2 }],
  ['GET /rss-feeds', (sh) => sh.rssFeeds.list(), '/rss-feeds'],
  ['POST /rss-feeds', (sh) => sh.rssFeeds.create({ url: 'https://blog.test/feed', mode: 'ai_draft' }), '/rss-feeds', {}, { url: 'https://blog.test/feed', mode: 'ai_draft' }],
  ['PATCH /rss-feeds/{id}', (sh) => sh.rssFeeds.update(ID, { daily_cap: 2 }), `/rss-feeds/${ID}`, {}, { daily_cap: 2 }],
  ['POST /rss-feeds/{id}/pause', (sh) => sh.rssFeeds.pause(ID, false), `/rss-feeds/${ID}/pause`, {}, { paused: false }],
  ['GET /webhooks', (sh) => sh.webhooks.list(), '/webhooks'],
  ['POST /webhooks', (sh) => sh.webhooks.create({ target_url: 'https://n8n.test/hook', events: ['post.published'], integration_type: 'n8n' }), '/webhooks', {}, { target_url: 'https://n8n.test/hook', events: ['post.published'], integration_type: 'n8n' }],
  ['PATCH /webhooks/{id}', (sh) => sh.webhooks.update(ID, { active: false }), `/webhooks/${ID}`, {}, { active: false }],
  ['DELETE /webhooks/{id}', (sh) => sh.webhooks.delete(ID), `/webhooks/${ID}`],
]

describe('contract: each resource method sends the spec request', () => {
  for (const [key, invoke, path, query, body] of CASES) {
    it(key, async () => {
      const { sh, calls } = mockClient((seen) =>
        seen.path === '/uploads/presign'
          ? { body: { key: 'k', upload_url: 'https://r2.test/put', public_url: 'https://cdn.test/k', expires_at: 'x' } }
          : { body: { success: true, data: { ok: true } } },
      )
      await invoke(sh)
      assert.equal(calls.length, 1)
      const [method] = key.split(' ')
      assert.equal(calls[0]!.method, method)
      assert.equal(calls[0]!.path, path)
      assert.deepEqual(calls[0]!.query, query ?? {})
      if (body !== undefined) assert.deepEqual(calls[0]!.body, body)
      assert.equal(calls[0]!.headers['X-API-Key'], 'sk_test')
    })
  }
})

describe('flows', () => {
  it('flows.list sends only platform_user_id and normalizes `flows` to `data`', async () => {
    const { sh, calls } = mockClient(() => ({ body: { flows: [{ _id: ID, name: 'Price DM' }] } }))
    const out = await sh.flows.list({ platform_user_id: '17841400000000000' })
    assert.equal(calls[0]!.path, '/flows')
    assert.deepEqual(calls[0]!.query, { platform_user_id: '17841400000000000' })
    assert.equal(out.data[0]!.id, ID)
  })
})

describe('posts.bulk', () => {
  it('refuses an empty list or more than 50 ids before sending', async () => {
    const { sh, calls } = mockClient()
    await assert.rejects(sh.posts.bulk({ action: 'delete', post_ids: [] }), /1 to 50/)
    await assert.rejects(sh.posts.bulk({ action: 'delete', post_ids: Array.from({ length: 51 }, () => ID) }), /1 to 50/)
    assert.equal(calls.length, 0)
  })

  it('returns the counts', async () => {
    const result = { total: 2, succeeded: 2, failed: 0, errors: [] }
    const { sh } = mockClient(() => ({ body: { data: result } }))
    assert.deepEqual(await sh.posts.bulk({ action: 'delete', post_ids: [ID, ID2] }), result)
  })
})

describe('responses', () => {
  it('unwraps { success, data } envelopes, arrays included', async () => {
    const { sh } = mockClient(() => ({ body: { success: true, data: [{ id: ID }] } }))
    assert.deepEqual(await sh.postingSlots.list(), [{ id: ID }])
  })

  it('returns bodies without an envelope as-is (media library page)', async () => {
    const page = { items: [{ id: ID }], next_cursor: null }
    const { sh } = mockClient(() => ({ body: page }))
    assert.deepEqual(await sh.media.list(), page)
  })

  it('returns the next free slot', async () => {
    const slot = { at: '2026-11-02T09:00:00.000Z', slot_id: ID, timezone: 'UTC', reserved_until: 'x' }
    const { sh } = mockClient(() => ({ body: { success: true, data: slot } }))
    assert.deepEqual(await sh.postingSlots.findSlot({ accountIds: [ID] }), slot)
  })

  it('maps errors to SociaHiveError with the server code', async () => {
    const { sh } = mockClient(() => ({ status: 404, body: { error: 'No posting slots', code: 'no_slots' } }))
    await assert.rejects(sh.postingSlots.findSlot({ accountIds: [ID] }), (err: unknown) => {
      assert.ok(err instanceof SociaHiveError)
      assert.equal(err.status, 404)
      assert.equal(err.code, 'no_slots')
      assert.equal(err.message, 'No posting slots')
      return true
    })
  })

  it('reads Retry-After on a 429', async () => {
    const { sh } = mockClient(() => ({ status: 429, body: { error: 'rate_limited' }, headers: { 'Retry-After': '12' } }))
    await assert.rejects(sh.signatures.list(), (err: unknown) => {
      assert.ok(err instanceof SociaHiveError)
      assert.equal(err.isRateLimited, true)
      assert.equal(err.retryAfter, 12)
      return true
    })
  })

  it('leaves retryAfter undefined without the header', async () => {
    const { sh } = mockClient(() => ({ status: 429, body: { error: 'rate_limited' } }))
    await assert.rejects(sh.signatures.list(), (err: unknown) => err instanceof SociaHiveError && err.retryAfter === undefined)
  })

  it('keeps `error` as the code when the server sends no `code`', async () => {
    const { sh } = mockClient(() => ({ status: 403, body: { error: 'feature_disabled' } }))
    await assert.rejects(sh.signatures.list(), (err: unknown) => err instanceof SociaHiveError && err.code === 'feature_disabled')
  })

  it('upload() presigns, PUTs the bytes, then verifies into the media library', async () => {
    const { sh, calls } = mockClient((seen) => {
      if (seen.path === '/uploads/presign') {
        return { body: { key: 'uploads/u/1.png', upload_url: 'https://r2.test/put', required_headers: { 'x-amz-acl': 'private' }, public_url: 'https://cdn.test/1.png', expires_at: 'x' } }
      }
      if (seen.path === '/put') return { body: undefined }
      return { body: { verified: true, size_bytes: 3, asset_id: ID } }
    })
    const out = await sh.media.upload({ data: new Uint8Array([1, 2, 3]), filename: '1.png', mimeType: 'image/png' })
    assert.deepEqual(calls.map((c) => `${c.method} ${c.path}`), ['POST /uploads/presign', 'PUT /put', 'POST /uploads/verify'])
    assert.equal(calls[1]!.headers['x-amz-acl'], 'private')
    assert.equal(calls[1]!.headers['X-API-Key'], undefined, 'the API key never goes to the storage URL')
    assert.deepEqual(calls[2]!.body, { key: 'uploads/u/1.png', purpose: 'scheduler', filename: '1.png' })
    assert.equal(out.public_url, 'https://cdn.test/1.png')
    assert.equal(out.asset_id, ID)
  })

  it('upload() fails when the storage PUT fails', async () => {
    const { sh } = mockClient((seen) =>
      seen.path === '/uploads/presign'
        ? { body: { key: 'k', upload_url: 'https://r2.test/put', public_url: 'p', expires_at: 'x' } }
        : { status: 403, body: { error: 'denied' } },
    )
    await assert.rejects(
      sh.media.upload({ data: new Uint8Array([1]), filename: 'a.png', mimeType: 'image/png' }),
      (err: unknown) => err instanceof SociaHiveError && err.code === 'upload_failed',
    )
  })
})

describe('coverage', () => {
  it('every program operation in the spec has an SDK method', () => {
    const generated = readFileSync(join(__dirname, '../src/generated.ts'), 'utf8')
    const keys = Array.from(generated.matchAll(/^ {2}"((?:GET|POST|PUT|PATCH|DELETE) \/[^"]*)": \{/gm), (m) => m[1]!)
    const program = /^(GET|POST|PUT|PATCH|DELETE) \/(media-library|media\/|uploads\/|signatures|posting-slots|find-slot|client-invites|rss-feeds|calendar|webhooks|connected-accounts$|analytics|posts(\/bulk|\/\{id\}(\/(schedule|publish|cancel|duplicate|link-clicks|review-links|plugs))?)?$)/
    const covered = new Set(CASES.map(([key]) => key))
    const missing = keys.filter((k) => program.test(k) && !covered.has(k))
    assert.deepEqual(missing, [])
    assert.ok(keys.length > 50, 'generated.ts lists the operations')
  })
})
