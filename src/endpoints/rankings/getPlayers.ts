import { BrawlStarsClient, Json } from '../../client.js';
import { validateCountryCode } from '../../utils/validation.js';

/**
 * Retrieves player rankings for a country or global rankings.
 * @param countryCode Two-letter country code or 'global' (required)
 * @param options Optional settings:
 *   - before: Return items before this marker (from response paging)
 *   - after: Return items after this marker (from response paging)
 *   - limit: Maximum number of items to return
 *   - cacheSeconds: Optional cache duration in seconds
 * @returns JSON data of the player rankings
 */
export default (client: BrawlStarsClient) =>
    async (
        countryCode: string,
        options?: { before?: string; after?: string; limit?: number; cacheSeconds?: number }
    ): Promise<Json> => {
        validateCountryCode(countryCode);

        const queryParams: string[] = [];
        if (options?.before) queryParams.push(`before=${encodeURIComponent(options.before)}`);
        if (options?.after) queryParams.push(`after=${encodeURIComponent(options.after)}`);
        if (options?.limit !== undefined) queryParams.push(`limit=${options.limit}`);

        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
        const cacheDuration = options?.cacheSeconds ?? 3600; // default 1 hour

        return client.fetch(`/rankings/${encodeURIComponent(countryCode)}/players${queryString}`, {
            cacheSeconds: cacheDuration,
        });
    };
