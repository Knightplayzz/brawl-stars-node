import { BrawlStarsClient, Json, PaginatedRequestOptions } from "../../client.js";

/**
 * Retrieves the available game modes.
 * @param options Optional pagination, timeout, retry, and cache settings.
 */
export default (client: BrawlStarsClient) =>
  async (options?: PaginatedRequestOptions): Promise<Json> =>
    client.fetch("/gamemodes", options);
