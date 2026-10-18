// Run with: npm test (node's built-in test runner through tsx).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SociaHive } from '../src/client'
import { SociaHiveError } from '../src/errors'

function fakeFetch(status: number, body: unknown, headers: Record<string, string> = {}) {
  const calls: Array<{ url: string; init: RequestInit }> = []
  const impl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init })
    return new Response(JSON.stringify(body), { status, headers })
  }) as unknown as typeof fetch
  return { impl, calls }
}

test('posts.bulk sends the action body the API expects', async () => {
  const result = { total: 2, succeeded: 2, failed: 0, errors: [] }
  const { impl, calls } = fakeFetch(200, { data: result })
  const sh = new SociaHive({ apiKey: 'sk_test', fetch: impl })

  const out = await sh.posts.bulk({
    action: 'schedule',
    post_ids: ['a', 'b'],
    scheduled_for: '2027-03-01T09:00:00Z',
  })

  assert.equal(calls[0].url, 'https://www.sociahive.com/api/v1/posts/bulk')
  assert.equal(calls[0].init.method, 'POST')
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), {
    action: 'schedule',
    post_ids: ['a', 'b'],
    scheduled_for: '2027-03-01T09:00:00Z',
  })
  assert.deepEqual(out, result)
})

test('posts.bulk refuses more than 50 posts before calling the API', async () => {
  const { impl, calls } = fakeFetch(200, {})
  const sh = new SociaHive({ apiKey: 'sk_test', fetch: impl })
  const ids = Array.from({ length: 51 }, (_, i) => `p${i}`)
  await assert.rejects(sh.posts.bulk({ action: 'delete', post_ids: ids }), /1 to 50/)
  assert.equal(calls.length, 0)
})

test('flows.list sends platform_user_id', async () => {
  const { impl, calls } = fakeFetch(200, { flows: [] })
  const sh = new SociaHive({ apiKey: 'sk_test', fetch: impl })
  await sh.flows.list({ platform_user_id: '1784' })
  assert.equal(calls[0].url, 'https://www.sociahive.com/api/v1/flows?platform_user_id=1784')
})

test('a 429 exposes Retry-After as retryAfter', async () => {
  const { impl } = fakeFetch(429, { error: 'rate_limit' }, { 'Retry-After': '23' })
  const sh = new SociaHive({ apiKey: 'sk_test', fetch: impl })
  await assert.rejects(sh.posts.list(), (err: unknown) => {
    assert.ok(err instanceof SociaHiveError)
    assert.equal(err.isRateLimited, true)
    assert.equal(err.retryAfter, 23)
    return true
  })
})
