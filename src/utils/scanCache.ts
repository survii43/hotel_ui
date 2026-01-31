import type { QRContextResponse } from '../api/types';

const CACHE_PREFIX = 'hotel_ui_scan_';
const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes

function cacheKey(code: string): string {
  return `${CACHE_PREFIX}${code.trim()}`;
}

interface CachedEntry {
  data: QRContextResponse;
  expiresAt: number;
}

function safeParse<T>(raw: string | null): T | null {
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Returns cached scan context for the code if present and not expired.
 * Reduces server load for repeat visits (e.g. same table code).
 */
export function getCachedContext(code: string): QRContextResponse | null {
  if (typeof localStorage === 'undefined') return null;
  const key = cacheKey(code);
  const raw = localStorage.getItem(key);
  const entry = safeParse<CachedEntry>(raw);
  if (!entry?.data?.qrContext || !entry.expiresAt) return null;
  if (Date.now() >= entry.expiresAt) {
    localStorage.removeItem(key);
    return null;
  }
  return entry.data;
}

/**
 * Stores scan context in localStorage with TTL.
 * Call after a successful scan to serve future requests from cache.
 */
export function setCachedContext(
  code: string,
  data: QRContextResponse,
  ttlMs: number = DEFAULT_TTL_MS
): void {
  if (typeof localStorage === 'undefined') return;
  const key = cacheKey(code);
  const entry: CachedEntry = {
    data,
    expiresAt: Date.now() + ttlMs,
  };
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // quota exceeded or private mode – ignore
  }
}
