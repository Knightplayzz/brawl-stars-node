import { BrawlStarsClient, Json } from '../../client.js';
import { validateTag } from '../../utils/validation.js';

/**
 * Retrieves club information by clubTag.
 * @param clubTag The tag of the club (required, must start with '#')
 * @param options Optional settings, like cache duration in seconds.
 * @returns JSON data of the requested club
 */
export default (client: BrawlStarsClient) =>
    async (clubTag: string, options?: { cacheSeconds?: number }): Promise<Json> => {
    // Validate the clubTag
        validateTag(clubTag, 'club');

        const cacheDuration = options?.cacheSeconds ?? 0;
        return client.fetch(`/clubs/${encodeURIComponent(clubTag)}`, { cacheSeconds: cacheDuration });
    };
