import { useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext';

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

/** Returns toast context or null so add-to-cart (and similar) never break if ToastProvider is missing. */
export function useToastOptional() {
  return useContext(ToastContext);
}
