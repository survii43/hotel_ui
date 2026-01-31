/**
 * Centralized query keys for React Query.
 * Single source of truth for cache keys and invalidation.
 */
export const queryKeys = {
  activeMenu: (outletId: string) => ['activeMenu', outletId] as const,
  order: (orderId: string) => ['order', orderId] as const,
} as const;
