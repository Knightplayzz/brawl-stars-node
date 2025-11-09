import { BrawlStarsClient, Json } from '../../client.js';
import { validateBrawlerId } from '../../utils/validation.js';

/**
 * Retrieves information for a single brawler by ID.
 * @param brawlerId The numeric ID of the brawler (required)
 * @param options Optional settings, like cache duration in seconds
 * @returns JSON data of the requested brawler
 */
export default (client: BrawlStarsClient) =>
    async (brawlerId: number, options?: { cacheSeconds?: number }): Promise<Json> => {
        validateBrawlerId(brawlerId);

        const cacheDuration = options?.cacheSeconds ?? 3600; // default 1 hour
        return client.fetch(`/brawlers/${brawlerId}`, { cacheSeconds: cacheDuration });
    };
