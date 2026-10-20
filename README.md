<p align="center">
  <a href="https://www.sociahive.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/sociahive/.github/main/assets/brand/logo-dark.svg">
      <img alt="SociaHive" src="https://raw.githubusercontent.com/sociahive/.github/main/assets/brand/logo-light.svg" width="220">
    </picture>
  </a>
</p>

<p align="center">Run your social media from your AI tool: schedule posts, build DM and comment automations, and read analytics.</p>
<p align="center">This is the official Node.js SDK for the SociaHive API.</p>

<p align="center">
  <a href="https://www.sociahive.com">Website</a> ·
  <a href="https://www.sociahive.com/developers">Developers</a> ·
  <a href="https://docs.sociahive.com">Docs</a> ·
  <a href="https://www.sociahive.com/connect-ai">Connect your AI</a> ·
  <a href="https://www.sociahive.com/auth/login?view=sign_up">Sign up</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@sociahive/sdk"><img alt="npm: @sociahive/sdk" src="https://img.shields.io/npm/v/@sociahive/sdk"></a>
  <a href="https://www.npmjs.com/package/@sociahive/sdk"><img alt="npm downloads" src="https://img.shields.io/npm/dw/@sociahive/sdk"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue"></a>
</p>

# @sociahive/sdk

Official Node.js client for the [SociaHive](https://www.sociahive.com) API: schedule and publish posts, manage your media library, posting slots, signatures, client review links and plugs, build and run DM and comment automations, receive webhooks and read analytics from your own code.

API access is part of the 7-day trial and every paid plan. On the free plan the API answers `403 upgrade_required`.

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
  scheduled_at: '2027-03-01T09:00:00Z', // any future time
  timezone: 'UTC',
})
console.log(`Scheduled post ${post.id}`)
```

## Auth

Pass either an API key or an OAuth bearer token, not both:

```ts
// API key (long-lived, programmatic)
const sh = new SociaHive({ apiKey: 'sk_…' })

// OAuth 2.1 token (from /api/oauth/token, scoped per user)
const sh = new SociaHive({ oauthToken: 'mcp_at_…' })
```

Generate API keys at <https://www.sociahive.com/settings?tab=api-keys>. For
OAuth flows, see the OAuth quickstart in
[the developer quickstart](https://docs.sociahive.com/developer-quickstart).

## What's covered

| Resource | Methods |
|---|---|
| `accounts` | `list` |
| `posts` | `list`, `get`, `create`, `update`, `delete`, `schedule`, `publish`, `cancel`, `bulk`, `duplicate` |
| `media` | `list` (media library), `upload` (presign, PUT and verify in one call), `presign`, `verify`, `uploadFromUrl`, `generateImage`, `imageAllowance` |
| `signatures` | `list`, `create`, `update`, `delete` |
| `postingSlots` | `list`, `create`, `update`, `delete`, `occurrences`, `findSlot` |
| `linkClicks` | `get` |
| `reviewLinks` | `list`, `create`, `revoke` |
| `plugs` | `list`, `arm`, `delete` |
| `calendar` | `month`, `duplicate`, `stats` |
| `clientInvites` | `list`, `create`, `revoke` |
| `rssFeeds` | `list`, `create`, `update`, `pause` |
| `webhooks` | `list`, `create`, `update`, `delete` |
| `flows` | `list`, `get`, `create`, `update`, `delete`, `activate`, `deactivate`, `addNode`, `updateNode`, `addEdge`, `stats`, `collectedData`, `generate` |
| `analytics` | `get`, `export`, `contentInsights` |

Some features depend on your plan: client review links, client invites and AI images need Studio or above, plugs need Creator or above. On a plan without the feature its calls throw a `SociaHiveError` with `status: 403`.

`flows.list` needs the account's `platform_user_id`:

```ts
const { data: flows } = await sh.flows.list({ platform_user_id: accounts[0].platform_user_id })
```

`posts.bulk` applies one action to up to 50 existing posts. It does not create posts; call `posts.create` for each one.

```ts
await sh.posts.bulk({ action: 'schedule', post_ids: ['p1', 'p2'], scheduled_for: '2027-03-01T09:00:00Z' })
await sh.posts.bulk({ action: 'update_status', post_ids: ['p3'], status: 'draft' })
await sh.posts.bulk({ action: 'delete', post_ids: ['p4'] })
```

Schedule into the next free posting slot:

```ts
const slot = await sh.postingSlots.findSlot({ accountIds: [accounts[0].id] })
await sh.posts.create({
  text: 'New arrivals are in',
  platforms: [{ platform: accounts[0].platform, account_id: accounts[0].id }],
  schedule_type: 'scheduled',
  scheduled_at: slot.at,
  timezone: slot.timezone,
})
```

For an operation without a method, use the typed transport:
`sh.http.call('GET /posts/{id}/link-clicks', { path: { id } })`. The full
OpenAPI spec is at <https://www.sociahive.com/api/v1/openapi.json>.

## Platforms

### Publish to

<p align="center">
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/instagram.svg" alt="Instagram" title="Instagram" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/facebook.svg" alt="Facebook" title="Facebook" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/linkedin.svg" alt="LinkedIn" title="LinkedIn" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/x.svg" alt="X" title="X" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/threads.svg" alt="Threads" title="Threads" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/tiktok.svg" alt="TikTok" title="TikTok" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/youtube.svg" alt="YouTube" title="YouTube" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/bluesky.svg" alt="Bluesky" title="Bluesky" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/pinterest.svg" alt="Pinterest" title="Pinterest" width="24"></a>
</p>

<p align="center">Also Telegram channels, Discord, Slack, Mastodon, Lemmy, Tumblr, Dev.to, Hashnode, WordPress, Listmonk, Dribbble, Twitch and Kick.</p>

### Automate DMs and comments on

<p align="center">
  <a href="https://www.sociahive.com/automation/instagram"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/instagram.svg" alt="Instagram" title="Instagram" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/automation/facebook"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/facebook.svg" alt="Facebook" title="Facebook" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/messenger"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/messenger.svg" alt="Messenger" title="Messenger" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/automation/whatsapp"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/whatsapp.svg" alt="WhatsApp" title="WhatsApp" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/automation/telegram"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/telegram.svg" alt="Telegram" title="Telegram" width="24"></a>
</p>

## Errors

Every non-2xx response throws a `SociaHiveError`:

```ts
import { SociaHive, SociaHiveError } from '@sociahive/sdk'

try {
  await sh.posts.create({ /* ... */ })
} catch (err) {
  if (err instanceof SociaHiveError) {
    if (err.isAuthError) console.error('Bad API key or insufficient scope')
    else if (err.isRateLimited) console.error(`Rate limited, retry in ${err.retryAfter}s`)
    else console.error(`HTTP ${err.status}: ${err.message}`)
  } else {
    throw err
  }
}
```

## Rate limits

Limits are per user, across all your keys: 120 reads and 30 writes a minute, 5 a minute for AI generation, and 1,000 requests a day in total. A `429` carries a `Retry-After` header; wait that long before retrying. See [rate limits](https://docs.sociahive.com/rate-limits).

## Configuration

```ts
new SociaHive({
  apiKey: 'sk_…',
  baseUrl: 'https://www.sociahive.com/api/v1',     // default
  timeoutMs: 60000,                                 // default 30s
  fetch: customFetch,                               // override for testing
})
```

## Types

Request and response types are generated from SociaHive's OpenAPI document
into `src/generated.ts` and exported as the `Api` namespace:

```ts
import type { Api } from '@sociahive/sdk'

type Slot = Api.FreeSlot
type ArmBody = Api.BodyOf<'POST /posts/{id}/plugs'>
```

Platform ids are `KnownPlatform | (string & {})`, so a platform added later
still type-checks.

## Webhooks

`sh.webhooks.create({ target_url, events })` subscribes an HTTPS endpoint.
`verifyWebhookSignature({ body, signature, secret })` checks the
`X-SociaHive-Signature` header of a delivery (HMAC-SHA256 with a five-minute
replay window). It uses Web Crypto, so it needs Node 20 or newer.

```ts
import { verifyWebhookSignature } from '@sociahive/sdk'

const ok = await verifyWebhookSignature({
  body: rawBody,
  signature: req.headers['x-sociahive-signature'],
  secret: process.env.SOCIAHIVE_WEBHOOK_SECRET!,
})
```

## Works with your AI tool

Prefer to ask instead of writing code? The same account works from your AI tool through the [SociaHive MCP server](https://www.sociahive.com/mcp).

<p align="center">
  <a href="https://www.sociahive.com/connect-ai/chatgpt"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/agents/chatgpt.svg" alt="ChatGPT" title="ChatGPT" width="28"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/connect-ai/claude"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/agents/claude.svg" alt="Claude" title="Claude" width="28"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/connect-ai/claude-code"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/agents/claude-code.svg" alt="Claude Code" title="Claude Code" width="28"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/connect-ai/cursor"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/agents/cursor.svg" alt="Cursor" title="Cursor" width="28"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/connect-ai/codex"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/agents/codex.svg" alt="Codex" title="Codex" width="28"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/connect-ai/gemini"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/agents/gemini.svg" alt="Gemini" title="Gemini" width="28"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/connect-ai/grok"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/agents/grok.svg" alt="Grok" title="Grok" width="28"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/mcp"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/agents/mcp.svg" alt="MCP" title="Any MCP client" width="28"></a>
</p>

## Data and permissions

- An API key only reaches what its scopes allow (for example `posts:read`, `posts:write`, `flows:write`). Revoke a key any time in **Settings > API keys**.
- Accounts connect through each platform's official login and APIs. SociaHive does not scrape and never asks for your account password (Bluesky uses an app password, Telegram a bot token).
- Platform tokens are stored encrypted on SociaHive's servers and are never returned by the API.

## Links

- [Developer quickstart](https://docs.sociahive.com/developer-quickstart) · [API reference (OpenAPI)](https://www.sociahive.com/api/v1/openapi.json)
- [Python SDK](https://github.com/sociahive/sociahive-python) · [Cookbook](https://github.com/sociahive/cookbook) · [MCP server and plugins](https://github.com/sociahive/sociahive-mcp)
- [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE)
