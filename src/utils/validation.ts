/** UUID v4-style: 8-4-4-4-12 hex digits. Used to ensure outlet_id and other IDs sent to API are full UUIDs. */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(s: string | null | undefined): boolean {
  return typeof s === 'string' && UUID_REGEX.test(s.trim());
}
