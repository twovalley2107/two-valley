/**
 * Phone number normalization and helper utility.
 * Normalizes phone numbers to standard E.164 format.
 * Supports common Indian formats (10-digit, +91, 0-prefixed) and standard E.164 international numbers.
 */

export function normalizePhone(rawPhone: string): string | null {
  if (!rawPhone || typeof rawPhone !== "string") return null;

  // Clean raw input by removing spaces, hyphens, parentheses, and dots
  const cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, "").trim();
  if (!cleaned) return null;

  // 1. Standard Indian 10-digit number starting with 6, 7, 8, 9
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  // 2. Indian number with leading 0 (e.g. 09876543210)
  if (/^0[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned.substring(1)}`;
  }

  // 3. Indian number with 91 prefix without plus (e.g. 919876543210)
  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  // 4. Indian number with explicit +91 prefix (e.g. +919876543210)
  if (/^\+91[6-9]\d{9}$/.test(cleaned)) {
    return cleaned;
  }

  // 5. General E.164 international number starting with + and 7 to 15 digits
  if (/^\+[1-9]\d{6,14}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

/**
 * Detects whether a login identifier is a phone number or an email.
 * If identifier contains '@', it is considered an email.
 * Otherwise, if it consists mostly of digits/plus/dashes/spaces, it is treated as a phone.
 */
export function isPhoneNumber(identifier: string): boolean {
  if (!identifier || typeof identifier !== "string") return false;
  if (identifier.includes("@")) return false;
  const digitsOnly = identifier.replace(/\D/g, "");
  return digitsOnly.length >= 7;
}
