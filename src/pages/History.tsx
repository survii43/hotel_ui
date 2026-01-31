import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp, useCurrency } from '../hooks/useApp';
import { useOrder } from '../hooks/queries';
import { useOrderStatusLabels } from '../hooks/useOrderStatusLabels';
import { getOrder } from '../api/client';
import AppBar from '../components/AppBar';
import Footer from '../components/Footer';
import './History.css';

export default function History() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [orderIdInput, setOrderIdInput] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  const currentOrderId = state.currentOrderId;
  const currentOrder = state.currentOrder;
  const currency = useCurrency();

  const { data: currentOrderData } = useOrder(currentOrderId ?? null, {
    enabled: !!currentOrderId && !currentOrder,
  });

  useEffect(() => {
    if (currentOrderData?.order) {
      dispatch({ type: 'SET_ORDER', payload: currentOrderData.order });
    }
  }, [currentOrderData?.order, dispatch]);

  async function handleTrackOrder(e: React.FormEvent) {
    e.preventDefault();
    const id = orderIdInput.trim();
    if (!id) return;
    setTrackError(null);
    setTrackLoading(true);
    try {
      const res = await getOrder(id);
      dispatch({ type: 'SET_ORDER', payload: res.order });
      dispatch({ type: 'SET_CURRENT_ORDER_ID', payload: res.order.id });
      navigate(`/order/${res.order.id}`);
    } catch (err) {
      setTrackError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setTrackLoading(false);
    }
  }

  const statusLabels = useOrderStatusLabels();

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
                disabled={trackLoading}
              />
              {trackError && <p className="history-error">{trackError}</p>}
              <button type="submit" className="btn btn-primary" disabled={trackLoading}>
                {trackLoading ? t('common.loading') : t('history.viewOrder')}
              </button>
            </form>
          </section>
          {currentOrder && (
            <section className="history-current card">
              <h2>{t('history.orderNumber', { number: currentOrder.order_number })}</h2>
              <p className="history-status">
                <span className="history-status-label">{t('history.status')}</span>
                <span className={`history-status-value status-${currentOrder.status}`}>
                  {statusLabels[currentOrder.status] ?? currentOrder.status}
                </span>
              </p>
              <p className="history-total">
                <span>{t('history.total')}</span>
                <strong>
                  {currency} {currentOrder.total_amount?.toFixed(2) ?? '0.00'}
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
      <Footer />
    </>
  );
}
