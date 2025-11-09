/**
 * Validates that a tag is a non-empty string starting with '#'.
 */
export function validateTag(tag: string, type: 'player' | 'club' = 'player'): void {
    if (!tag) throw new Error(`${type}Tag is required`);
    if (typeof tag !== 'string') throw new TypeError(`${type}Tag must be a string`);
    if (!tag.startsWith('#')) throw new Error(`${type}Tag must start with #`);
}

/**
 * Validates that a country code is either 'global' or a 2-letter country code.
 */
export function validateCountryCode(code: string): void {
    if (!code) throw new Error('countryCode is required');
    if (typeof code !== 'string') throw new TypeError('countryCode must be a string');
    if (code !== 'global' && !/^[A-Z]{2}$/i.test(code)) {
        throw new Error('countryCode must be \'global\' or a 2-letter country code');
    }
}

/**
 * Validates that a brawlerId is a positive integer.
 */
export function validateBrawlerId(id: number): void {
    if (id === undefined || id === null) throw new Error('brawlerId is required');
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
        throw new TypeError('brawlerId must be a positive integer');
    }
}
