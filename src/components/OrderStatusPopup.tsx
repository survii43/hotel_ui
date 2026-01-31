import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import type { OrderStatus } from '../api/types';
import './OrderStatusPopup.css';

const statusKey: Record<OrderStatus, string> = {
  pending: 'order.status_pending',
  confirmed: 'order.status_confirmed',
  preparing: 'order.status_preparing',
  ready: 'order.status_ready',
  served: 'order.status_served',
  completed: 'order.status_completed',
  cancelled: 'order.status_cancelled',
};

export default function OrderStatusPopup() {
  const { t } = useTranslation();
  const { state, closeOrderStatusPopup } = useApp();
  const status = state.orderStatusPopup;
  if (!status) return null;

  return (
    <div className="order-status-overlay" role="dialog" aria-modal="true" aria-label={t('order.tracking')}>
      <div className="order-status-popup">
        <button
          type="button"
          className="order-status-close"
          onClick={closeOrderStatusPopup}
          aria-label={t('common.cancel')}
        >
          <X size={20} />
        </button>
        <div className={`order-status-icon status-${status}`} />
        <h3 className="order-status-title">{t(statusKey[status])}</h3>
        {state.currentOrder && (
          <p className="order-status-number">
            {t('history.orderNumber', { number: state.currentOrder.order_number })}
          </p>
        )}
        <button type="button" className="order-status-dismiss" onClick={closeOrderStatusPopup}>
          {t('common.ok')}
        </button>
      </div>
    </div>
  );
}
