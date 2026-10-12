/* c8 ignore start */
import {
  AuthenticationError,
  AuthorizationError,
  BrawlStarsAPIError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  RequestAbortedError,
  RequestTimeoutError,
  ServerError
} from "./errors.js";
import { normalizeCountryCode, normalizeTag, validateBrawlerId, validateLimit } from "./utils/validation.js";
/* c8 ignore stop */

export type Json = Record<string, unknown>;
export type QueryOptions = {
  before?: string;
  after?: string;
  limit?: number;
};

export type RequestOptions = {
  retries?: number;
  timeout?: number;
  signal?: AbortSignal;
  useCache?: boolean;
  cacheSeconds?: number;
};

export type PaginatedRequestOptions = RequestOptions & QueryOptions;

export type CacheOptions = {
  enabled?: boolean;
  ttl?: number;
  maxSize?: number;
};

export type BrawlStarsClientOptions = {
  token: string;
  timeout?: number;
  retries?: number;
  cache?: CacheOptions;
};

type CacheEntry = { data: Json; expiry: number };

const API_URL = "https://api.brawlstars.com/v1";
const DEFAULT_TIMEOUT = 10_000;
const DEFAULT_TTL = 180_000;

function queryString(options: QueryOptions | undefined): string {
  if (!options) return "";
  validateLimit(options.limit);
  const params = new URLSearchParams();
  if (options.before !== undefined) params.set("before", options.before);
  if (options.after !== undefined) params.set("after", options.after);
  if (options.limit !== undefined) params.set("limit", String(options.limit));
  const value = params.toString();
  return value ? `?${value}` : "";
}

function isJson(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function retryAfterMilliseconds(response: Response): number | undefined {
  const header = response.headers.get("retry-after");
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(header);
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

export interface PlayerEndpoints {
  get: (playerTag: string, options?: RequestOptions) => Promise<Json>;
  getPlayer: (playerTag: string, options?: RequestOptions) => Promise<Json>;
  getBattlelog: (playerTag: string, options?: RequestOptions) => Promise<Json>;
}

export interface ClubEndpoints {
  get: (clubTag: string, options?: RequestOptions) => Promise<Json>;
  getClub: (clubTag: string, options?: RequestOptions) => Promise<Json>;
  getClubMembers: (clubTag: string, options?: PaginatedRequestOptions) => Promise<Json>;
  getMembers: (clubTag: string, options?: RequestOptions) => Promise<Json>;
}

export interface RankingEndpoints {
  getPlayerRankings: (countryCode: string, options?: PaginatedRequestOptions) => Promise<Json>;
  getClubRankings: (countryCode: string, options?: PaginatedRequestOptions) => Promise<Json>;
  getBrawlerRankings: (countryCode: string, brawlerId: number, options?: PaginatedRequestOptions) => Promise<Json>;
  getPlayers: (countryCode: string, options?: RequestOptions) => Promise<Json>;
  getClubs: (countryCode: string, options?: RequestOptions) => Promise<Json>;
  getBrawler: (countryCode: string, brawlerId: number, options?: RequestOptions) => Promise<Json>;
}

export interface BrawlerEndpoints {
  getBrawlers: (options?: PaginatedRequestOptions) => Promise<Json>;
  getAll: (options?: RequestOptions) => Promise<Json>;
  getBrawler: (brawlerId: number, options?: RequestOptions) => Promise<Json>;
  getBrawlerById: (brawlerId: number, options?: RequestOptions) => Promise<Json>;
}

export interface EventEndpoints {
  getGameModes: (options?: PaginatedRequestOptions) => Promise<Json>;
  getRotation: (options?: RequestOptions) => Promise<Json>;
}

export class BrawlStarsClient {
  readonly players: PlayerEndpoints;
  readonly clubs: ClubEndpoints;
  readonly rankings: RankingEndpoints;
  readonly brawlers: BrawlerEndpoints;
  readonly events: EventEndpoints;

  readonly #token: string;
  readonly #timeout: number;
  readonly #retries: number;
  readonly #cacheEnabled: boolean;
  readonly #cacheTtl: number;
  readonly #maxCacheSize: number;
  readonly #cache = new Map<string, CacheEntry>();
  readonly #inFlight = new Map<string, Promise<Json>>();
  #lastRequestAt = 0;

  constructor(options: string | BrawlStarsClientOptions) {
    const config = typeof options === "string" ? { token: options } : options;
    if (!config || typeof config.token !== "string" || config.token.trim() === "") {
      throw new Error("A non-empty Brawl Stars API token is required.");
    }
    this.#token = config.token;
    this.#timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.#retries = config.retries ?? 2;
    this.#cacheEnabled = config.cache?.enabled ?? false;
    this.#cacheTtl = config.cache?.ttl ?? DEFAULT_TTL;
    this.#maxCacheSize = config.cache?.maxSize ?? 100;
    if (!Number.isInteger(this.#timeout) || this.#timeout <= 0) throw new Error("timeout must be a positive integer.");
    if (!Number.isInteger(this.#retries) || this.#retries < 0)
      throw new Error("retries must be a non-negative integer.");
    if (!Number.isInteger(this.#cacheTtl) || this.#cacheTtl <= 0)
      throw new Error("cache.ttl must be a positive integer.");
    if (!Number.isInteger(this.#maxCacheSize) || this.#maxCacheSize <= 0)
      throw new Error("cache.maxSize must be a positive integer.");

    const player = (tag: string, options?: RequestOptions) =>
      this.request(`/players/%23${normalizeTag(tag, "player")}`, options);
    const club = (tag: string, options?: RequestOptions) =>
      this.request(`/clubs/%23${normalizeTag(tag, "club")}`, options);
    const members = (tag: string, options?: PaginatedRequestOptions) =>
      this.request(`/clubs/%23${normalizeTag(tag, "club")}/members`, options, true);

    this.players = {
      get: player,
      getPlayer: player,
      getBattlelog: (tag, options) => this.request(`/players/%23${normalizeTag(tag, "player")}/battlelog`, options)
    };
    this.clubs = { get: club, getClub: club, getClubMembers: members, getMembers: members };
    this.rankings = {
      getPlayerRankings: (country, options) => this.ranking("/players", country, options),
      getClubRankings: (country, options) => this.ranking("/clubs", country, options),
      getBrawlerRankings: (country, id, options) =>
        this.ranking(`/brawlers/${this.validatedBrawlerId(id)}`, country, options),
      getPlayers: (country, options) => this.ranking("/players", country, options as PaginatedRequestOptions),
      getClubs: (country, options) => this.ranking("/clubs", country, options as PaginatedRequestOptions),
      getBrawler: (country, id, options) =>
        this.ranking(`/brawlers/${this.validatedBrawlerId(id)}`, country, options as PaginatedRequestOptions)
    };
    this.brawlers = {
      getBrawlers: (options) => this.request("/brawlers", options, true),
      getAll: (options) => this.request("/brawlers", options as PaginatedRequestOptions, true),
      getBrawler: (id, options) => this.request(`/brawlers/${this.validatedBrawlerId(id)}`, options),
      getBrawlerById: (id, options) => this.request(`/brawlers/${this.validatedBrawlerId(id)}`, options)
    };
    this.events = {
      getGameModes: (options) => this.request("/gamemodes", options, true),
      getRotation: (options) => this.request("/events/rotation", options)
    };
  }

  /** Fetches an endpoint using the same authenticated, cached request pipeline as resources. */
  public fetch(endpoint: string, options?: RequestOptions): Promise<Json> {
    return this.request(endpoint, options);
  }

  /** Removes every entry from this client instance's in-memory cache. */
  public clearCache(): void {
    this.#cache.clear();
  }

  /** Removes one normalized endpoint and query combination from the cache. */
  public invalidateCache(endpoint?: string): void {
    if (!endpoint) {
      this.clearCache();
      return;
    }
    this.#cache.delete(endpoint);
    for (const key of this.#cache.keys()) {
      if (key.startsWith(`${endpoint}?`)) this.#cache.delete(key);
    }
  }

  private validatedBrawlerId(id: number): number {
    validateBrawlerId(id);
    return id;
  }

  private ranking(path: string, country: string, options?: PaginatedRequestOptions): Promise<Json> {
    const countryCode = normalizeCountryCode(country);
    return this.request(`/rankings/${encodeURIComponent(countryCode)}${path}`, options, true);
  }

  private request(
    endpoint: string,
    options: RequestOptions | PaginatedRequestOptions = {},
    paginated = false
  ): Promise<Json> {
    const query = paginated ? queryString(options as PaginatedRequestOptions) : "";
    const key = `${endpoint}${query}`;
    const useCache = options.useCache ?? this.#cacheEnabled;
    const ttl = options.cacheSeconds === undefined ? this.#cacheTtl : options.cacheSeconds * 1000;
    if (options.cacheSeconds !== undefined && (!Number.isFinite(options.cacheSeconds) || options.cacheSeconds < 0)) {
      throw new Error("cacheSeconds must be a non-negative number.");
    }
    if (useCache) {
      const entry = this.#cache.get(key);
      if (entry && entry.expiry > Date.now()) return Promise.resolve(entry.data);
      if (entry) this.#cache.delete(key);
    }
    if (options.signal?.aborted) return Promise.reject(new RequestAbortedError(endpoint));

    let shared = this.#inFlight.get(key);
    if (!shared) {
      shared = this.send(endpoint, query, options)
        .then((data) => {
          if (useCache && ttl > 0) {
            this.#cache.delete(key);
            this.#cache.set(key, { data, expiry: Date.now() + ttl });
            while (this.#cache.size > this.#maxCacheSize) {
              const oldest = this.#cache.keys().next().value;
              this.#cache.delete(oldest as string);
            }
          }
          return data;
        })
        .finally(() => this.#inFlight.delete(key));
      this.#inFlight.set(key, shared);
    }
    if (!options.signal) return shared;
    return Promise.race([
      shared,
      new Promise<Json>((_, reject) => {
        options.signal?.addEventListener("abort", () => reject(new RequestAbortedError(endpoint)), { once: true });
      })
    ]);
  }

  private async send(endpoint: string, query: string, options: RequestOptions): Promise<Json> {
    const attempts = options.retries ?? this.#retries;
    if (!Number.isInteger(attempts) || attempts < 0) throw new Error("retries must be a non-negative integer.");
    const timeout = options.timeout ?? this.#timeout;
    if (!Number.isInteger(timeout) || timeout <= 0) throw new Error("timeout must be a positive integer.");

    for (let attempt = 0; ; attempt += 1) {
      let timedOut = false;
      try {
        const minimumDelay = Math.max(0, 200 - (Date.now() - this.#lastRequestAt));
        if (minimumDelay) await new Promise((resolve) => setTimeout(resolve, minimumDelay));
        if (options.signal?.aborted) throw new RequestAbortedError(endpoint);
        this.#lastRequestAt = Date.now();
        const controller = new AbortController();
        const timer = setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, timeout);
        const removeAbort = () => options.signal?.removeEventListener("abort", abort);
        /* c8 ignore next */
        const abort = () => controller.abort();
        options.signal?.addEventListener("abort", abort, { once: true });
        let response: Response;
        try {
          response = await fetch(`${API_URL}${endpoint}${query}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${this.#token}`, Accept: "application/json" },
            signal: controller.signal
          });
        } finally {
          clearTimeout(timer);
          removeAbort();
        }
        if (!response.ok) {
          const retryAfter = retryAfterMilliseconds(response);
          const error = this.httpError(response.status, endpoint, retryAfter);
          if (error.retryable && attempt < attempts) {
            await this.delay(retryAfter ?? Math.min(1000 * 2 ** attempt, 10_000));
            continue;
          }
          throw error;
        }
        return await this.parseResponse(response, endpoint);
      } catch (error) {
        if (
          error instanceof BrawlStarsAPIError &&
          ![RequestTimeoutError, NetworkError].some((type) => error instanceof type)
        ) {
          throw error;
        }
        if (options.signal?.aborted) throw new RequestAbortedError(endpoint, "GET", error);
        const mapped =
          error instanceof RequestTimeoutError || error instanceof NetworkError
            ? error
            : timedOut
              ? new RequestTimeoutError(endpoint, timeout, "GET", error)
              : new NetworkError(endpoint, "GET", error);
        if (attempt >= attempts) throw mapped;
        await this.delay(Math.min(1000 * 2 ** attempt + Math.floor(Math.random() * 100), 10_000));
      }
    }
  }

  private async parseResponse(response: Response, endpoint: string): Promise<Json> {
    const text = await response.text();
    if (!text.trim()) return {};
    try {
      const data: unknown = JSON.parse(text);
      if (!isJson(data)) throw new Error("Expected a JSON object.");
      return data;
    } catch (error) {
      throw new BrawlStarsAPIError("The API returned malformed JSON.", endpoint, "GET", response.status, {
        cause: error
      });
    }
  }

  private httpError(status: number, endpoint: string, retryAfter?: number): BrawlStarsAPIError {
    if (status === 401) return new AuthenticationError(endpoint);
    if (status === 403) return new AuthorizationError(endpoint);
    if (status === 404) return new NotFoundError(endpoint);
    if (status === 429) return new RateLimitError(endpoint, retryAfter);
    if (status >= 500) return new ServerError(endpoint, status);
    return new BrawlStarsAPIError(`The Brawl Stars API returned HTTP ${status}.`, endpoint, "GET", status);
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}
