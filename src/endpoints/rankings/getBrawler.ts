import { BrawlStarsClient, Json } from '../../client.js';
import { validateCountryCode, validateBrawlerId } from '../../utils/validation.js';

/**
 * Retrieves brawler rankings for a country or global rankings.
 * @param countryCode Two-letter country code or 'global' (required)
 * @param brawlerId Numeric ID of the brawler (required)
 * @param options Optional settings:
 *   - before: Return items before this marker (from response paging)
 *   - after: Return items after this marker (from response paging)
 *   - limit: Maximum number of items to return
 *   - cacheSeconds: Optional cache duration in seconds
 * @returns JSON data of the brawler rankings
 */
export default (client: BrawlStarsClient) =>
    async (
        countryCode: string,
        brawlerId: number,
        options?: { before?: string; after?: string; limit?: number; cacheSeconds?: number }
    ): Promise<Json> => {
        validateCountryCode(countryCode);
        validateBrawlerId(brawlerId);

        const queryParams: string[] = [];
        if (options?.before) queryParams.push(`before=${encodeURIComponent(options.before)}`);
        if (options?.after) queryParams.push(`after=${encodeURIComponent(options.after)}`);
        if (options?.limit !== undefined) queryParams.push(`limit=${options.limit}`);

        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
        const cacheDuration = options?.cacheSeconds ?? 3600; // default 1 hour

        return client.fetch(`/rankings/${encodeURIComponent(countryCode)}/brawlers/${brawlerId}${queryString}`, {
            cacheSeconds: cacheDuration,
        });
    };
