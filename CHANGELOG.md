# 📜 Changelog

All notable changes to **brawl-stars-node** will be documented in this file.

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
