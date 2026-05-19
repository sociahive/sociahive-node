# @sociahive/sdk

Official Node.js client for the [SociaHive](https://www.sociahive.com) API.

```bash
npm install @sociahive/sdk
```

## Quickstart

```ts
import { SociaHive } from '@sociahive/sdk'

const sh = new SociaHive({ apiKey: process.env.SOCIAHIVE_API_KEY! })

const { data: accounts } = await sh.accounts.list()
console.log(`Connected: ${accounts.map(a => a.platform).join(', ')}`)

const post = await sh.posts.create({
  text: 'Hello from Node!',
  platforms: [{ platform: 'instagram', account_id: accounts[0].id }],
  schedule_type: 'scheduled',
  scheduled_at: '2026-06-01T09:00:00Z',
  timezone: 'UTC',
})
console.log(`Scheduled post ${post.id}`)
```

## Auth

Either an API key OR an OAuth bearer token — not both:

```ts
// API key (long-lived, programmatic)
const sh = new SociaHive({ apiKey: 'sk_…' })

// OAuth 2.1 token (from /api/oauth/token, scoped per user)
const sh = new SociaHive({ oauthToken: 'sh_at_…' })
```

Generate API keys at <https://www.sociahive.com/settings?tab=api-keys>. For
OAuth flows, see the OAuth quickstart in
[the developer quickstart](https://docs.sociahive.com/developer-quickstart).

## What's covered

| Domain | Methods |
|---|---|
| `accounts` | `list` |
| `posts` | `list`, `get`, `create`, `update`, `schedule`, `publish`, `cancel`, `bulk` |
| `flows` | `list`, `get`, `create`, `update`, `delete`, `activate`, `deactivate`, `addNode`, `updateNode`, `addEdge`, `stats`, `collectedData`, `generate` |
| `analytics` | `get`, `export` |

For endpoints not surfaced here, drop down to the raw HTTP client or hit the
endpoint via `fetch` with `X-API-Key`. The full OpenAPI spec is at
<https://www.sociahive.com/api/v1/openapi.json>.

## Errors

Every non-2xx response throws a `SociaHiveError`:

```ts
import { SociaHive, SociaHiveError } from '@sociahive/sdk'

try {
  await sh.posts.create({ /* ... */ })
} catch (err) {
  if (err instanceof SociaHiveError) {
    if (err.isAuthError) console.error('Bad API key or insufficient scope')
    else if (err.isRateLimited) console.error('Slow down — 1000 req/hr default')
    else console.error(`HTTP ${err.status}: ${err.message}`)
  } else {
    throw err
  }
}
```

## Configuration

```ts
new SociaHive({
  apiKey: 'sk_…',
  baseUrl: 'https://staging.sociahive.com/api/v1', // for staging/test
  timeoutMs: 60000,                                 // default 30s
  fetch: customFetch,                               // override for testing
})
```

## Regenerating types from OpenAPI

The hand-written types in `src/types.ts` cover the high-traffic endpoints.
For fuller coverage, regenerate from the live spec:

```bash
npm run generate:types
```

This pulls <https://www.sociahive.com/api/v1/openapi.json> into
`src/generated.ts`. Import from there for endpoints the hand-written types
don't cover yet.

## License

MIT
