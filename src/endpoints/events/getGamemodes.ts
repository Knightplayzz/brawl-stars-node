import { BrawlStarsClient, Json } from '../../client.js';

/**
 * Retrieves the list of all available game modes.
 * @param options Optional query and cache settings:
 *   - before: Return items before this marker (from response paging)
 *   - after: Return items after this marker (from response paging)
 *   - limit: Maximum number of items to return
 *   - cacheSeconds: Optional cache duration in seconds
 * @returns JSON data of available game modes
 */
export default (client: BrawlStarsClient) =>
    async (options?: { before?: string; after?: string; limit?: number; cacheSeconds?: number }): Promise<Json> => {
        const queryParams: string[] = [];

        if (options?.before) queryParams.push(`before=${encodeURIComponent(options.before)}`);
        if (options?.after) queryParams.push(`after=${encodeURIComponent(options.after)}`);
        if (options?.limit !== undefined) queryParams.push(`limit=${options.limit}`);

        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
        const cacheDuration = options?.cacheSeconds ?? 3600; // default 1 hour

        return client.fetch(`/gamemodes${queryString}`, { cacheSeconds: cacheDuration });
    };
