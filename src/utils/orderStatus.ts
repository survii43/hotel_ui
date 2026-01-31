import type { OrderStatus } from '../api/types';

/** i18n keys for order status labels. Single source for History, OrderTracking, OrderStatusPopup. */
export const ORDER_STATUS_I18N_KEYS: Record<OrderStatus, string> = {
  pending: 'order.status_pending',
  confirmed: 'order.status_confirmed',
  preparing: 'order.status_preparing',
  ready: 'order.status_ready',
  served: 'order.status_served',
  completed: 'order.status_completed',
  cancelled: 'order.status_cancelled',
};
