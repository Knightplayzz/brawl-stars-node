<div align="center">
  <img src="https://static.wikia.nocookie.net/supercell-fankit/images/f/ff/Brawl_Stars_Smile_Logo.png/revision/latest/scale-to-width-down/250?cb=20201119180831" height="200" alt="Brawl Stars logo">
  <br><br>
  <p><b>A lightweight, strongly typed Node.js wrapper for the official <a href="https://developer.brawlstars.com/">Brawl Stars API</a>.</b></p>

<a href="https://github.com/Knightplayzz/brawl-stars-node/actions/workflows/ci.yml"><img src="https://github.com/Knightplayzz/brawl-stars-node/actions/workflows/ci.yml/badge.svg" alt="Build Status"></a>
<a href='https://coveralls.io/github/Knightplayzz/brawl-stars-node?branch=main'><img src='https://coveralls.io/repos/github/Knightplayzz/brawl-stars-node/badge.svg?branch=main' alt='Coverage Status' /></a>
<a href="https://www.npmjs.com/package/brawl-stars-node"><img src="https://img.shields.io/npm/dt/brawl-stars-node.svg?maxAge=3600" alt="npm downloads"></a>

<a href="https://www.npmjs.com/package/brawl-stars-node"><img src="https://img.shields.io/npm/v/brawl-stars-node" alt="npm version"></a>
<a href="https://packagephobia.now.sh/result?p=brawl-stars-node"><img src="https://badgen.net/packagephobia/install/brawl-stars-node" alt="Current version"></a>
<a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript&logoColor=white" alt="TypeScript ready"></a>
</div>

---

> **Important:** This project is not affiliated with, endorsed, sponsored, or
> specifically approved by Supercell. Supercell is not responsible for this
> project. Please follow the [Supercell Fan Content Policy](https://supercell.com/en/fan-content-policy/).

## Table of contents

- [Overview](#overview)
- [Requirements and installation](#requirements-and-installation)
- [Getting an API token](#getting-an-api-token)
- [Creating a client](#creating-a-client)
- [Supported endpoints](#supported-endpoints)
- [Tags, country codes, and IDs](#tags-country-codes-and-ids)
- [Pagination](#pagination)
- [Caching](#caching)
- [Timeouts, cancellation, and retries](#timeouts-cancellation-and-retries)
- [Errors](#errors)
- [Legacy login API](#legacy-login-api)
- [TypeScript and public exports](#typescript-and-public-exports)
- [Development](#development)
- [Limitations](#limitations)
- [License and attribution](#license-and-attribution)

## Overview

`brawl-stars-node` provides a typed client for the public Brawl Stars API. It
centralizes authentication, URL construction, validation, rate-aware request
pacing, retries, timeouts, cancellation, optional in-memory caching, and
consistent errors.

The package does not contain game data and does not bypass the official API.
Every request requires an API token issued by the Brawl Stars Developer Portal.

## Requirements and installation

Node.js **20.14.0 or newer** is required.

```bash
npm install brawl-stars-node
```

The package is published as ESM. It includes JavaScript output and TypeScript
declaration files in `dist`.

## Getting an API token

1. Open the [Brawl Stars Developer Portal](https://developer.brawlstars.com/).
2. Create or sign in to your developer account.
3. Create an API key for the IP address or environment where your application
   will run.
4. Store the key in an environment variable.

Never commit an API token, put it in a URL, or paste it into an issue or log.

```bash
# PowerShell
$env:BRAWL_STARS_API_TOKEN = "your-token"
```

## Creating a client

The recommended constructor accepts an options object:

```ts
import { BrawlStarsClient } from "brawl-stars-node";

const token = process.env.BRAWL_STARS_API_TOKEN;
if (!token) {
  throw new Error("BRAWL_STARS_API_TOKEN is not configured");
}

const client = new BrawlStarsClient({
  token,
  timeout: 10_000,
  retries: 2,
  cache: {
    enabled: true,
    ttl: 180_000,
    maxSize: 100
  }
});
```

For backwards compatibility, the constructor also accepts a token directly:

```ts
const client = new BrawlStarsClient(token);
```

## Supported endpoints

The public method names follow the resource and API operation. The old
descriptive aliases remain available where they existed, but the short names
below are recommended.

### Players

| API endpoint                         | Recommended method                       |
| ------------------------------------ | ---------------------------------------- |
| `GET /players/{playerTag}`           | `client.players.get(playerTag)`          |
| `GET /players/{playerTag}/battlelog` | `client.players.getBattlelog(playerTag)` |

```ts
const player = await client.players.get("#8CG8LUJ");
const battlelog = await client.players.getBattlelog("#8CG8LUJ");
```

`players.getPlayer()` is retained as an alias for `players.get()`.

### Clubs

| API endpoint                   | Recommended method                               |
| ------------------------------ | ------------------------------------------------ |
| `GET /clubs/{clubTag}`         | `client.clubs.get(clubTag)`                      |
| `GET /clubs/{clubTag}/members` | `client.clubs.getClubMembers(clubTag, options?)` |

```ts
const club = await client.clubs.get("#CLUBTAG");
const members = await client.clubs.getClubMembers("#CLUBTAG", { limit: 25 });
```

`clubs.getClub()` and `clubs.getClubMembers()` are retained as aliases.

### Rankings

| API endpoint                                       | Recommended method                                                     |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| `GET /rankings/{countryCode}/players`              | `client.rankings.getPlayerRankings(countryCode, options?)`             |
| `GET /rankings/{countryCode}/clubs`                | `client.rankings.getClubRankings(countryCode, options?)`               |
| `GET /rankings/{countryCode}/brawlers/{brawlerId}` | `client.rankings.getBrawlerRankings(countryCode, brawlerId, options?)` |

```ts
const globalPlayers = await client.rankings.getPlayerRankings("global", { limit: 10 });
const BelgianClubs = await client.rankings.getClubRankings("BE", { after: "cursor" });
const brawlerRankings = await client.rankings.getBrawlerRankings("global", 16000001);
```

The aliases `getPlayerRankings()`, `getClubRankings()`, and
`getBrawlerRankings()` remain available.

### Brawlers

| API endpoint                | Recommended method                      |
| --------------------------- | --------------------------------------- |
| `GET /brawlers`             | `client.brawlers.getBrawlers(options?)` |
| `GET /brawlers/{brawlerId}` | `client.brawlers.getBrawler(brawlerId)` |

```ts
const brawlers = await client.brawlers.getBrawlers({ limit: 20 });
const shelly = await client.brawlers.getBrawler(16000000);
```

`brawlers.getAll()` and `brawlers.getBrawlerById()` remain available as
compatibility aliases. `getBrawlers()` is the recommended name because it
matches the plural collection returned by `GET /brawlers`.

### Events

| API endpoint           | Recommended method                     |
| ---------------------- | -------------------------------------- |
| `GET /events/rotation` | `client.events.getRotation()`          |
| `GET /gamemodes`       | `client.events.getGameModes(options?)` |

```ts
const rotation = await client.events.getRotation();
```

The game modes collection supports the same pagination options as the other
list endpoints:

```ts
const gameModes = await client.events.getGameModes({ limit: 20 });
```

## Tags, country codes, and IDs

Player and club tags may be written with or without the leading `#`:

```ts
await client.players.get("#8CG8LUJ");
await client.players.get("8CG8LUJ");
```

Tags are trimmed, normalized, validated, and encoded once when the URL is
created. Empty tags and characters that cannot be part of a Brawl Stars tag
are rejected before an HTTP request is made.

Country codes are either `global` or a two-letter ISO-style code such as `US`,
`BE`, or `NL`. Brawler IDs must be positive integers. Invalid values produce a
`ValidationError`.

## Pagination

`before`, `after`, and `limit` are **not accepted by every endpoint**. They are
only available on API operations that return a paginated list:

| Method                          | `before` | `after` | `limit` |
| ------------------------------- | :------: | :-----: | :-----: |
| `clubs.getClubMembers()`        |   Yes    |   Yes   |   Yes   |
| `rankings.getClubRankings()`    |   Yes    |   Yes   |   Yes   |
| `rankings.getBrawlerRankings()` |   Yes    |   Yes   |   Yes   |
| `rankings.getPlayerRankings()`  |   Yes    |   Yes   |   Yes   |
| `brawlers.getBrawlers()`        |   Yes    |   Yes   |   Yes   |
| `events.getGameModes()`         |   Yes    |   Yes   |   Yes   |

They are intentionally absent from the TypeScript options for:

- `players.get()`
- `players.getBattlelog()`
- `clubs.get()`
- `brawlers.getBrawler()`
- `events.getRotation()`

Cursor values are passed through as supplied. The wrapper does not automatically
iterate pages; callers can request the next page using the cursor returned by
the API:

```ts
const firstPage = await client.clubs.getClubMembers("#CLUBTAG", { limit: 25 });
// Read the API's paging.after value from firstPage, then:
const nextPage = await client.clubs.getClubMembers("#CLUBTAG", {
  after: "cursor-from-the-previous-response",
  limit: 25
});
```

## Caching

Caching is disabled by default. Enable it per client:

```ts
const client = new BrawlStarsClient({
  token,
  cache: {
    enabled: true,
    ttl: 180_000,
    maxSize: 100
  }
});
```

The cache is local to one client instance and one Node.js process. It is not
persistent and is not shared between clients, processes, or machines.

Use `useCache: false` for a fresh request, `clearCache()` to remove every
entry, or `invalidateCache()` to remove one endpoint:

```ts
await client.players.get("#8CG8LUJ", { useCache: false });
client.clearCache();
client.invalidateCache("/players/%238CG8LUJ");
```

Failed requests are never cached. Cache entries are bounded by `maxSize`, and
different query parameters create different entries.

## Timeouts, cancellation, and retries

The default request timeout is 10 seconds. Use `timeout` globally or per
request. Pass an `AbortSignal` to cancel the caller's wait:

```ts
const controller = new AbortController();
const request = client.players.get("#8CG8LUJ", {
  timeout: 5_000,
  signal: controller.signal
});
controller.abort();
await request;
```

The client retries transient network failures, HTTP 5xx responses, and 429
responses. Retries use bounded exponential backoff with jitter and respect
`Retry-After` when the API provides it. Client errors such as 400, 401, 403,
and 404 are not retried. Set `retries: 0` to disable retries.

## Errors

All request failures use `BrawlStarsAPIError` or one of its specialized
classes:

- `AuthenticationError` — invalid or rejected token (`401`).
- `AuthorizationError` — token is not authorized (`403`).
- `NotFoundError` — resource does not exist (`404`).
- `RateLimitError` — rate limit exceeded (`429`), including retry metadata.
- `ServerError` — upstream server failure (`5xx`).
- `RequestTimeoutError` — the configured timeout elapsed.
- `NetworkError` — the request could not reach the API.
- `RequestAbortedError` — the caller cancelled the request.
- `ValidationError` — an input or configuration value is invalid.

```ts
import { BrawlStarsAPIError, NotFoundError, RateLimitError } from "brawl-stars-node";

try {
  await client.players.get("#8CG8LUJ");
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error("Player was not found");
  } else if (error instanceof RateLimitError) {
    console.error(`Retry after ${error.retryAfter ?? 0} ms`);
  } else if (error instanceof BrawlStarsAPIError) {
    console.error(error.message);
  }
}
```

## Legacy login API

The original shared-client API remains available:

```ts
import { getClient, login } from "brawl-stars-node";

await login(token);
const player = await getClient().players.getPlayer("#8CG8LUJ");
```

`login()` validates the token through the centralized client before storing
the shared client context.

## TypeScript and public exports

The package exports `BrawlStarsClient`, all public endpoint option types, and
all error classes from the package root:

```ts
import { BrawlStarsClient, PaginatedRequestOptions, ValidationError } from "brawl-stars-node";
```

## Development

```bash
npm install
npm run build
npm run lint
npm test
npm pack --dry-run
```

Tests use local mocks and do not require a live API token. Live integration
testing should be opt-in because it depends on Supercell availability and a
valid developer token.

## Limitations

- Response objects are exposed as JSON records because the upstream API can
  evolve independently of this package.
- The wrapper does not automatically paginate or persist cache data.
- Live API access requires a token from the official developer portal.
- Only endpoints documented and verifiable in the official API are exposed.

For the authoritative endpoint contract and response schemas, see the
[official Brawl Stars API documentation](https://developer.brawlstars.com/).

## License and attribution

Copyright (c) 2025 Philippe Smeets. All rights reserved.

This project is licensed under **CC BY-NC**. See [SECURITY.md](./SECURITY.md)
for security reporting guidance.

**© 2025 - Philippe Smeets**
[philippesmeets@icloud.com](mailto:philippesmeets@icloud.com)
