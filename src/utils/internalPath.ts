/**
 * Accept only paths that stay on the current origin when used for navigation.
 * Backslashes are rejected because browsers normalize them as slashes in HTTP
 * URLs, which can turn `/\\example.com` into an external host.
 */
export function isSafeInternalPath(
  value: string | null | undefined,
): value is string {
  return Boolean(
    value &&
      value.startsWith('/') &&
      !value.startsWith('//') &&
      !value.includes('\\'),
  );
}
