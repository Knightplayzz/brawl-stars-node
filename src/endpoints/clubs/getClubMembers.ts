import { BrawlStarsClient, Json } from '../../client.js';
import { validateTag } from '../../utils/validation.js';

/**
 * Retrieves club members by clubTag.
 * @param clubTag The tag of the club (required, must start with '#')
 * @param options Optional settings:
 *   - before: Return items before this marker (from response paging)
 *   - after: Return items after this marker (from response paging)
 *   - limit: Maximum number of items to return
 *   - cacheSeconds: Optional cache duration in seconds
 * @returns JSON data of the club members
 */
export default (client: BrawlStarsClient) =>
    async (
        clubTag: string,
        options?: { before?: string; after?: string; limit?: number; cacheSeconds?: number }
    ): Promise<Json> => {
    // Validate club tag
        validateTag(clubTag, 'club');

        const queryParams: string[] = [];
        if (options?.before) queryParams.push(`before=${encodeURIComponent(options.before)}`);
        if (options?.after) queryParams.push(`after=${encodeURIComponent(options.after)}`);
        if (options?.limit !== undefined) queryParams.push(`limit=${options.limit}`);

        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
        const cacheDuration = options?.cacheSeconds ?? 3600; // default 1 hour

        return client.fetch(`/clubs/${encodeURIComponent(clubTag)}/members${queryString}`, { cacheSeconds: cacheDuration });
    };
