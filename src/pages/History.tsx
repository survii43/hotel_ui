import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { getOrder } from '../api/client';
import AppBar from '../components/AppBar';
import BottomNav from '../components/BottomNav';
import './History.css';

export default function History() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [orderIdInput, setOrderIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentOrder = state.currentOrder;

  useEffect(() => {
    if (state.currentOrderId && !currentOrder) {
      setLoading(true);
      getOrder(state.currentOrderId)
        .then((res) => {
          dispatch({ type: 'SET_ORDER', payload: res.order });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [state.currentOrderId]);

  async function handleTrackOrder(e: React.FormEvent) {
    e.preventDefault();
    const id = orderIdInput.trim();
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const res = await getOrder(id);
      dispatch({ type: 'SET_ORDER', payload: res.order });
      dispatch({ type: 'SET_CURRENT_ORDER_ID', payload: res.order.id });
      navigate(`/order/${res.order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  const statusKey: Record<string, string> = {
    pending: t('order.status_pending'),
    confirmed: t('order.status_confirmed'),
    preparing: t('order.status_preparing'),
    ready: t('order.status_ready'),
    served: t('order.status_served'),
    completed: t('order.status_completed'),
    cancelled: t('order.status_cancelled'),
  };

  return (
    <>
      <AppBar title={t('history.title')} />
      <main className="main-content">
        <div className="container history-page">
          <section className="history-track card">
            <h2>{t('history.trackOrder')}</h2>
            <form onSubmit={handleTrackOrder} className="history-track-form">
              <input
                type="text"
                className="input"
                placeholder={t('history.orderNumber', { number: '...' })}
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                disabled={loading}
              />
              {error && <p className="history-error">{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? t('common.loading') : t('history.viewOrder')}
              </button>
            </form>
          </section>
          {currentOrder && (
            <section className="history-current card">
              <h2>{t('history.orderNumber', { number: currentOrder.order_number })}</h2>
              <p className="history-status">
                <span className="history-status-label">{t('history.status')}</span>
                <span className={`history-status-value status-${currentOrder.status}`}>
                  {statusKey[currentOrder.status] ?? currentOrder.status}
                </span>
              </p>
              <p className="history-total">
                <span>{t('history.total')}</span>
                <strong>
                  {state.qrContext?.qrContext?.currency ?? 'INR'} {currentOrder.total_amount?.toFixed(2) ?? '0.00'}
                </strong>
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(`/order/${currentOrder.id}`)}
              >
                {t('order.tracking')}
              </button>
            </section>
          )}
          {!currentOrder && !orderIdInput && (
            <p className="history-empty">{t('history.empty')}</p>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
