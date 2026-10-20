# Changelog

All notable changes to `@sociahive/sdk` are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-10-20

### Added

- New resources: `media` (media library, uploads, AI images), `signatures`, `postingSlots` (with `findSlot`), `linkClicks`, `reviewLinks`, `plugs`, `calendar`, `clientInvites`, `rssFeeds` and `webhooks`.
- `posts.delete`, `posts.duplicate` and `analytics.contentInsights`.
- Request and response types generated from the OpenAPI spec (`src/generated.ts`), exported as the `Api` namespace.
- `verifyWebhookSignature` checks the `X-SociaHive-Signature` header of a webhook delivery.
- `SociaHiveError.retryAfter`: seconds from the `Retry-After` header on a 429.
- The transport is public as `sh.http` (`call`, `raw`, `request`).

### Changed

- `Platform` is now `KnownPlatform | (string & {})`, so new platforms type-check.
- `SociaHiveError.code` prefers the server's `code` field and falls back to `error`.

### Fixed

- `posts.bulk` now matches `POST /posts/bulk`: it takes `{ action, post_ids, ... }` (schedule, delete or update_status on up to 50 existing posts) and returns the counts. It used to send `{ posts: [...] }`, which the API refuses. **Breaking** for anyone calling the old signature; create posts with `posts.create` instead.
- `flows.list` requires `platform_user_id` and no longer accepts `limit` / `offset`, which the API refuses.

## [0.1.0] - 2026-05-20

First release on npm.

### Added

- `SociaHive` client with API key (`X-API-Key`) or OAuth bearer token auth, a configurable base URL, timeout and `fetch`.
- `accounts.list`.
- `posts`: `list`, `get`, `create`, `update`, `schedule`, `publish`, `cancel`, `bulk`.
- `flows`: `list`, `get`, `create`, `update`, `delete`, `activate`, `deactivate`, `addNode`, `updateNode`, `addEdge`, `stats`, `collectedData`, `generate`.
- `analytics`: `get`, `export`.
- `SociaHiveError` with `status`, `isAuthError` and `isRateLimited`.
- CommonJS and ES module builds with type declarations. Node 18 or later.

[0.1.0]: https://www.npmjs.com/package/@sociahive/sdk/v/0.1.0
[0.2.0]: https://www.npmjs.com/package/@sociahive/sdk/v/0.2.0
