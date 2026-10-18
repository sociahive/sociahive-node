# Changelog

All notable changes to `@sociahive/sdk` are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-20

First release on npm.

### Added

- `SociaHive` client with API key (`X-API-Key`) or OAuth bearer token auth, a configurable base URL, timeout and `fetch`.
- `accounts.list`.
- `posts`: `list`, `get`, `create`, `update`, `schedule`, `publish`, `cancel`, `bulk`.
- `flows`: `list`, `get`, `create`, `update`, `delete`, `activate`, `deactivate`, `addNode`, `updateNode`, `addEdge`, `stats`, `collectedData`, `generate`.
- `analytics`: `get`, `export`.
- `SociaHiveError` with `status`, `isAuthError` and `isRateLimited`.
- Hand-written types, plus `npm run generate:types` to generate types from the OpenAPI spec.
- CommonJS and ES module builds with type declarations. Node 18 or later.

[0.1.0]: https://www.npmjs.com/package/@sociahive/sdk/v/0.1.0
