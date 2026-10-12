import { BrawlStarsClient, Json } from "../../client.js";

/**
 * Retrieves the current event rotation.
 * @param options Optional request, timeout, retry, and cache settings.
 * @returns JSON data of ongoing events rotation
 */
export default (client: BrawlStarsClient) =>
  async (options?: { cacheSeconds?: number }): Promise<Json> => {
    return client.fetch("/events/rotation", options);
  };
