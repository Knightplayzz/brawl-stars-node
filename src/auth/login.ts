import fetch from 'node-fetch';
import { setAuthToken } from './context.js';

/**
 * Logs in using a Brawl Stars API token.
 * Validates the token by making a test request.
 * @param token Your API token
 */
export async function login(token: string): Promise<void> {
    if (!token) throw new Error('API token is required');

    // Validate token by making a test request
    const response = await fetch('https://api.brawlstars.com/v1/brawlers', {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error('Authentication failed. Please check your API token.');
    }

    setAuthToken(token);
    console.log('Login successful, client initialized.');
}
