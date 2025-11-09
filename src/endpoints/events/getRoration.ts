import { BrawlStarsClient, Json } from '../../client.js';

/**
 * Retrieves the current event rotation for ongoing events.
 * @param options Optional settings, like cache duration in seconds.
 * @returns JSON data of ongoing events rotation
 */
export default (client: BrawlStarsClient) =>
    async (options?: { cacheSeconds?: number }): Promise<Json> => {
        const cacheDuration = options?.cacheSeconds ?? 3600; // default 1 hour
        return client.fetch('/events/rotation', { cacheSeconds: cacheDuration });
    };
