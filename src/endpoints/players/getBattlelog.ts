import { BrawlStarsClient, Json } from '../../client.js';
import { validateTag } from '../../utils/validation.js';

/**
 * Retrieves user battlelog information by playerTag.
 * @param playerTag Tag of the player (required, must start with '#')
 * @param options Optional settings, like cache duration in seconds.
 * @returns JSON data of the player's battlelog
 */
export default (client: BrawlStarsClient) =>
    async (playerTag: string, options?: { cacheSeconds?: number }): Promise<Json> => {
        validateTag(playerTag, 'player');

        const cacheDuration = options?.cacheSeconds ?? 3600; // default 1 hour
        return client.fetch(`/players/${encodeURIComponent(playerTag)}/battlelog`, { cacheSeconds: cacheDuration });
    };
