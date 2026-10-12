import { ValidationError } from "../errors.js";

export function normalizeTag(tag: string, type: "player" | "club"): string {
  if (typeof tag !== "string" || tag.trim() === "") {
    throw new ValidationError(`${type}Tag must be a non-empty string.`);
  }

  const normalized = tag.trim().replace(/^#/, "");
  if (normalized.length === 0 || !/^[0289PYLQGRJCUV]+$/i.test(normalized)) {
    throw new ValidationError(`${type}Tag contains invalid characters.`);
  }
  return normalized.toUpperCase();
}

export function validateTag(tag: string, type: "player" | "club" = "player"): void {
  normalizeTag(tag, type);
}

export function validateCountryCode(code: string): void {
  if (typeof code !== "string" || !/^(global|[A-Za-z]{2})$/.test(code)) {
    throw new ValidationError('countryCode must be "global" or a 2-letter country code.');
  }
}

export function normalizeCountryCode(code: string): string {
  validateCountryCode(code);
  return code.toLowerCase();
}

export function validateBrawlerId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError("brawlerId must be a positive integer.");
  }
}

export function validateLimit(limit: number | undefined): void {
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 100)) {
    throw new ValidationError("limit must be an integer between 1 and 100.");
  }
}
