import { BrawlStarsClient, Json } from '../../client.js';
import { validateTag } from '../../utils/validation.js';

/**
 * Retrieves player information by playerTag.
 * @param playerTag Tag of the player (required, must start with '#')
 * @param options Optional settings, like cache duration in seconds.
 * @returns JSON data of the player
 */
export default (client: BrawlStarsClient) =>
    async (playerTag: string, options?: { cacheSeconds?: number }): Promise<Json> => {
        validateTag(playerTag, 'player');

        const cacheDuration = options?.cacheSeconds ?? 0;
        return client.fetch(`/players/${encodeURIComponent(playerTag)}`, { cacheSeconds: cacheDuration });
    };
