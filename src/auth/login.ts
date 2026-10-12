import { BrawlStarsClient } from "../client.js";
import { setAuthToken } from "./context.js";

/**
 * Validates an API token and initializes the legacy shared client.
 * @param token Your Brawl Stars API token.
 */
export async function login(token: string): Promise<void> {
  const client = new BrawlStarsClient(token);
  await client.brawlers.getBrawlers({ useCache: false });
  setAuthToken(token);
}
