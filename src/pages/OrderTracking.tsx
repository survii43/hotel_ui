import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../hooks/useApp';
import { useOrder } from '../hooks/queries';
import AppBar from '../components/AppBar';
import BottomNav from '../components/BottomNav';
import './OrderTracking.css';

const REFETCH_INTERVAL_MS = 20_000; // 20s – live-ish order status

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const { data, isLoading, error, isError } = useOrder(orderId ?? null, {
    enabled: !!orderId,
    refetchInterval: REFETCH_INTERVAL_MS,
  });

  const order = data?.order ?? null;

  useEffect(() => {
    if (order) {
      dispatch({ type: 'SET_ORDER', payload: order });
      dispatch({ type: 'SET_CURRENT_ORDER_ID', payload: order.id });
    }
  }, [order, dispatch]);

  const statusKey: Record<string, string> = {
    pending: t('order.status_pending'),
    confirmed: t('order.status_confirmed'),
    preparing: t('order.status_preparing'),
    ready: t('order.status_ready'),
    served: t('order.status_served'),
    completed: t('order.status_completed'),
    cancelled: t('order.status_cancelled'),
  };

  if (isLoading) {
    return (
      <>
        <AppBar title={t('order.tracking')} />
        <main className="main-content">
          <div className="container order-loading">{t('common.loading')}</div>
        </main>
        <BottomNav />
      </>
    );
  }

  if (isError || !order) {
    return (
      <>
        <AppBar title={t('order.tracking')} />
        <main className="main-content">
          <div className="container">
            <p className="order-error">
              {error instanceof Error ? error.message : t('common.error')}
            </p>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/history')}>
              {t('history.title')}
            </button>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  const currency = state.qrContext?.qrContext?.currency ?? 'INR';

  return (
    <>
      <AppBar title={t('history.orderNumber', { number: order.order_number })} />
      <main className="main-content">
        <div className="container order-tracking-page">
          <div className="order-header card">
            <div className="order-header-row">
              <span>{t('history.status')}</span>
              <span className={`order-status-badge status-${order.status}`}>
                {statusKey[order.status] ?? order.status}
              </span>
            </div>
            <div className="order-header-row">
              <span>{t('history.total')}</span>
              <strong>{currency} {order.total_amount?.toFixed(2) ?? '0.00'}</strong>
            </div>
            {order.outlet && (
              <p className="order-outlet">
                {order.outlet.name}
                {order.outlet.address && ` · ${order.outlet.address}`}
              </p>
            )}
            {order.table && (
              <p className="order-table">
                {t('order.tracking')} · {order.table.table_name ?? order.table.table_number}
              </p>
            )}
          </div>
          <section className="order-items card">
            <h3>{t('menu.title')}</h3>
            <ul className="order-items-list">
              {order.items?.map((item) => (
                <li key={item.id} className="order-item-row">
                  <span className="order-item-name">
                    {item.menu_item?.name ?? '—'} × {item.quantity}
                    {item.variant?.name && ` (${item.variant.name})`}
                  </span>
                  <span className="order-item-price">
                    {currency} {item.total_price?.toFixed(2) ?? '0.00'}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
