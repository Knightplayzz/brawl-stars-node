# 📜 Changelog

All notable changes to **brawl-stars-node** will be documented in this file.

---

## [3.0.0] - 12/10/2026

### Added

- Added a typed `BrawlStarsClient` options object for configuring the API token, request timeout, retry count, and cache.
- Added a public package-root export for the client, option types, endpoint types, error classes, and legacy authentication helpers.
- Added client access to player, club, ranking, brawler, and event endpoints, including country and brawler rankings.
- Added per-request timeouts and `AbortSignal` cancellation.
- Added retries for transient network failures, rate limits, and server errors, with bounded backoff and support for `Retry-After`.
- Added optional bounded in-memory caching, cache controls, and de-duplication of concurrent requests for the same endpoint.
- Added input validation and normalization for player and club tags, country codes, brawler IDs, and pagination limits.
- Added specific API errors for authentication, authorization, missing resources, rate limits, server failures, timeouts, network failures, cancellation, and validation.
- Switched HTTP requests to Node.js's built-in `fetch`, removing the package's runtime dependencies.
- Added build, formatting, lint, test, coverage, CI, and npm publishing workflows. Published packages include compiled JavaScript and TypeScript declarations.

### Changed

- Raised the minimum supported Node.js version to **22**.
- Made the options-object constructor the recommended setup; passing the token string directly remains supported.
- Standardized endpoint names, including `players.get()`, `clubs.get()`, `brawlers.getBrawlers()`, and `events.getGameModes()`.
- Exposed the package through the package root; use imports such as `import { BrawlStarsClient } from "brawl-stars-node"`.

### Migration notes

- Use Node.js 22 or newer. Node.js 20 is no longer supported.
- Use `brawlers.getBrawlers()` to retrieve the collection. `brawlers.getBrawler(id)` now retrieves one brawler; `getBrawlerById(id)` remains as an alias.
- Rename `events.getGamemodes()` to `events.getGameModes()`.
- Replace `FetchOptions` with the exported `RequestOptions` type; use `PaginatedRequestOptions` for cursor-based lists.
- Import public APIs from `brawl-stars-node`; direct package subpath imports are not exported.

---

## [2.0.0] - 08-11-2025

### 🎉 Initial Stable Release

The first major release of **brawl-stars-node** — a lightweight and developer-friendly wrapper for the [Brawl Stars API](https://developer.brawlstars.com/).

#### ✨ Features

- Complete TypeScript rewrite for type safety and scalability.
- Modular structure with automatic endpoint loading.
- Built-in rate limiting (5 requests per second).
- Caching layer with customizable expiration.
- Error handling via `BrawlStarsAPIError`.
- Input validation for:
  - `playerTag` and `clubTag`
  - `countryCode` (supports ISO country codes and `global`)
  - `brawlerId` validation (numeric)
- ESLint + Prettier integration.
- Jest testing setup.
- Travis CI and Coveralls configuration.
- Full documentation and security guidelines.

#### 🧩 Endpoints Implemented

- **Players**
  - `getPlayer(tag)`
  - `getBattlelog(tag)`
- **Clubs**
  - `getClub(tag)`
  - `getClubMembers(tag, options?)`
- **Rankings**
  - `getPlayerRankings(countryCode, options?)`
  - `getClubRankings(countryCode, options?)`
  - `getBrawlerRankings(countryCode, brawlerId, options?)`
- **Brawlers**
  - `getBrawlers(options?)`
  - `getBrawlerById(brawlerId, options?)`
- **Events**
  - `getEventRotation(options?)`
- **Game Modes**
  - `getGameModes(options?)`

#### 🧠 Developer Experience

- Added validation utilities in `src/utils/validation.ts`
- Centralized client logic in `src/client.ts`
- Included linting rules and Jest config for testing
- Added badges and improved project README

#### 🔒 Security

- Added [`SECURITY.md`](./SECURITY.md) with contact and vulnerability reporting process.

---

## [1.0.0] - 08-06-2024

### 🧪 Beta Release

**Created and maintained by [Philippe Smeets](mailto:philippesmeets@icloud.com)**  
© 2025 — Not affiliated with or endorsed by Supercell.
