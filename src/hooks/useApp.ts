import { useContext, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

/** Single source of truth for current outlet id (for menu, cart, order API). Prefers state.outlet.id, falls back to qrContext.outletId. */
export function useOutletId(): string | null {
  const { state } = useApp();
  return useMemo(
    () => state.outlet?.id ?? state.qrContext?.qrContext?.outletId ?? null,
    [state.outlet?.id, state.qrContext?.qrContext?.outletId]
  );
}
