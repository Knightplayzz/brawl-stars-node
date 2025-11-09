import fetch from 'node-fetch';
import { BrawlStarsAPIError } from './errors.js';

export type Json = Record<string, unknown>;

export type FetchOptions = {
    retries?: number;
    cacheSeconds?: number;
};

export type EndpointFunction<TArgs extends unknown[] = unknown[]> = (...args: TArgs) => Promise<Json>;

export interface PlayerEndpoints {
    getPlayer: EndpointFunction<[string, FetchOptions?]>;
    getBattlelog: EndpointFunction<[string, FetchOptions?]>;
}

export interface ClubEndpoints {
    getClub: EndpointFunction<[string, FetchOptions?]>;
    getClubMembers: EndpointFunction<[string, { before?: string; after?: string; limit?: number; cacheSeconds?: number }?]>;
}

export interface BrawlerEndpoints {
    getBrawler: EndpointFunction<[string, FetchOptions?]>;
    getBrawlerById: EndpointFunction<[number, FetchOptions?]>;
}

export interface EventEndpoints {
    getGamemodes: EndpointFunction<[{ before?: string; after?: string; limit?: number; cacheSeconds?: number }?]>;
    getRotation: EndpointFunction<[FetchOptions?]>;
}

export class BrawlStarsClient {
    players: PlayerEndpoints;
    clubs: ClubEndpoints;
    brawlers: BrawlerEndpoints;
    events: EventEndpoints;

    #authToken: string;
    #cache: Map<string, { data: Json; expiry: number }> = new Map();
    #queue: Array<() => void> = [];
    #isProcessing = false;

    constructor(authToken: string) {
        if (!authToken) throw new Error('Authentication token is required');
        this.#authToken = authToken;

        this.players = {
            getPlayer: this.#makeEndpoint('/players/{playerTag}'),
            getBattlelog: this.#makeEndpoint('/players/{playerTag}/battlelog'),
        };

        this.clubs = {
            getClub: this.#makeEndpoint('/clubs/{clubTag}'),
            getClubMembers: this.#makeEndpoint('/clubs/{clubTag}/members'),
        };

        this.brawlers = {
            getBrawler: this.#makeEndpoint('/brawlers'),
            getBrawlerById: this.#makeEndpoint('/brawlers/{brawlerId}'),
        };

        this.events = {
            getGamemodes: this.#makeEndpoint('/gamemodes'),
            getRotation: this.#makeEndpoint('/events/rotation'),
        };
    }

    #makeEndpoint(base: string): EndpointFunction<unknown[]> {
        return async (...args: unknown[]): Promise<Json> => {
            let endpoint = base;
            let options: FetchOptions | undefined;

            if (args.length > 0) {
                const first = args[0];
                if (typeof first === 'string' || typeof first === 'number') {
                    endpoint = endpoint.replace(/\{.*\}/, encodeURIComponent(String(first)));
                    options = args[1] as FetchOptions;
                } else {
                    options = first as FetchOptions;
                }
            }

            return this.#fetch(endpoint, options);
        };
    }

    async #enqueueRequest<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.#queue.push(async () => {
                try {
                    const result = await fn();
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            });
            void this.#processQueue();
        });
    }

    async #processQueue(): Promise<void> {
        if (this.#isProcessing || this.#queue.length === 0) return;
        this.#isProcessing = true;
        const request = this.#queue.shift();
        if (request) await request();
        setTimeout(() => {
            this.#isProcessing = false;
            void this.#processQueue();
        }, 1000 / 5);
    }

    async #fetch(endpoint: string, options: FetchOptions = {}): Promise<Json> {
        const { retries = 3, cacheSeconds = 0 } = options;

        if (cacheSeconds > 0 && this.#cache.has(endpoint)) {
            const cached = this.#cache.get(endpoint)!;
            if (Date.now() < cached.expiry) return cached.data;
        }

        let attempt = 0;
        while (attempt < retries) {
            try {
                const response = await this.#enqueueRequest(() =>
                    fetch(`https://api.brawlstars.com/v1${endpoint}`, {
                        headers: { Authorization: `Bearer ${this.#authToken}` },
                    })
                );

                // Read body as text first. Some endpoints may return an empty body
                // for error responses which causes `response.json()` to throw.
                // We'll attempt to parse JSON only when there's a non-empty body.
                const bodyText = await response.text();
                let json: Json | undefined;
                if (bodyText && bodyText.trim().length > 0) {
                    try {
                        json = JSON.parse(bodyText) as Json;
                    } catch {
                        // Ignore parse errors; we'll treat missing/invalid JSON as an empty object for
                        // downstream code. Avoid noisy logging here.
                    }
                }

                if (!response.ok) {
                    // Prefer API-provided message if available, otherwise include status and a short
                    // body snippet to help debugging (first 200 chars).
                    const apiMessage = json && typeof json === 'object' && 'message' in json ? String((json as Record<string, unknown>).message) : undefined;
                    const bodySnippet = bodyText ? (bodyText.length > 200 ? bodyText.slice(0, 200) + '...' : bodyText) : '';
                    const message = apiMessage ?? (bodySnippet ? `HTTP ${response.status} ${response.statusText}: ${bodySnippet}` : `HTTP ${response.status} ${response.statusText}`);
                    // Attach bodySnippet to the thrown error via message; the BrawlStarsAPIError keeps status and endpoint.
                    throw new BrawlStarsAPIError(message, response.status, endpoint);
                }

                const resultJson: Json = json ?? {};

                if (cacheSeconds > 0) {
                    this.#cache.set(endpoint, { data: resultJson, expiry: Date.now() + cacheSeconds * 1000 });
                }

                return resultJson;
            } catch (err) {
                attempt++;
                if (attempt >= retries) throw err;
            }
        }

        throw new Error('Unreachable code');
    }

    get fetch() {
        return this.#fetch.bind(this);
    }
}
