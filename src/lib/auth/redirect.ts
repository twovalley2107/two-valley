/**
 * Validates a redirect URL to prevent open redirect vulnerabilities.
 * Ensures the target URL is a safe internal relative path (starts with '/', no double slashes, no backslashes, no scheme).
 */
export function validateRedirectUrl(
  urlStr: string | null | undefined,
  fallback: string = "/account"
): string {
  if (!urlStr) return fallback;

  const trimmed = urlStr.trim();

  // Must start with '/' and must NOT start with '//', '/\', or contain protocol schemes like 'http:' or 'javascript:'
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\") &&
    !trimmed.includes(":") &&
    !trimmed.includes("\\")
  ) {
    return trimmed;
  }

  return fallback;
}
