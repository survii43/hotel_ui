import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ORDER_STATUS_I18N_KEYS } from '../utils/orderStatus';

/** Translated order status labels. Single source for History and OrderTracking. */
export function useOrderStatusLabels(): Record<string, string> {
  const { t } = useTranslation();
  return useMemo(
    () =>
      Object.fromEntries(
        Object.entries(ORDER_STATUS_I18N_KEYS).map(([k, key]) => [k, t(key)])
      ),
    [t]
  );
}
