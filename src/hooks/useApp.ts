import { useContext, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

/** Outlet id for menu / display. Prefers state.outlet.id, falls back to qrContext.outletId (short code ok for menu). */
export function useOutletId(): string | null {
  const { state } = useApp();
  return useMemo(
    () => state.outlet?.id ?? state.qrContext?.qrContext?.outletId ?? null,
    [state.outlet?.id, state.qrContext?.qrContext?.outletId]
  );
}

/** Outlet UUID for order API only. Backend requires UUID; returns null when only short code is available. */
export function useOutletIdForOrder(): string | null {
  const { state } = useApp();
  return useMemo(() => state.outlet?.id ?? null, [state.outlet?.id]);
}

/** Total cart item count (sum of quantities). Single source for badge/bar. */
export function useCartCount(): number {
  const { state } = useApp();
  return useMemo(
    () => state.cart.reduce((sum, i) => sum + i.quantity, 0),
    [state.cart]
  );
}

/** Currency from session (e.g. INR). Single source for display. */
export function useCurrency(): string {
  const { state } = useApp();
  return state.qrContext?.qrContext?.currency ?? 'INR';
}
