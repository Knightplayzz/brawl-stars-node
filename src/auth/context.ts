import { BrawlStarsClient } from '../client.js';

let authToken: string | null = null;
let clientInstance: BrawlStarsClient | null = null;

/**
 * Sets the authentication token and initializes a client instance.
 * @param token Your Brawl Stars API token
 */
export function setAuthToken(token: string): void {
    if (typeof token !== 'string') throw new TypeError('authToken must be a string');
    authToken = token;
    clientInstance = new BrawlStarsClient(token);
}

/**
 * Returns the current auth token
 */
export function getAuthToken(): string {
    if (!authToken) throw new Error('Auth token is not set. Please call login first.');
    return authToken;
}

/**
 * Returns the current BrawlStarsClient instance
 */
export function getClient(): BrawlStarsClient {
    if (!clientInstance) throw new Error('Client not initialized. Please call login first.');
    return clientInstance;
}
