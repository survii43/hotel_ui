import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { createOrder } from '../api/client';
import type { CartItem as CartItemType } from '../api/types';
import AppBar from '../components/AppBar';
import BottomNav from '../components/BottomNav';
import './Cart.css';

export default function Cart() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch, addNotification, showOrderStatusPopup } = useApp();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cart = state.cart;
  const outletId = state.outlet?.id;
  const orderType = state.orderType;
  const tableId = state.tableId ?? undefined;
  const tableNumber = state.tableNumber ?? undefined;
  const sessionId = state.sessionId ?? undefined;

  const subtotal = cart.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const currency = state.qrContext?.qrContext?.currency ?? 'INR';

  function updateQty(index: number, delta: number) {
    const item = cart[index];
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: index });
      return;
    }
    dispatch({ type: 'UPDATE_CART_ITEM', payload: { index, item: { quantity: newQty } } });
  }

  function removeItem(index: number) {
    dispatch({ type: 'REMOVE_FROM_CART', payload: index });
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!outletId || cart.length === 0) return;
    setError(null);
    setPlacing(true);
    try {
      const orderTypeApi = orderType === 'dine_in' ? 'dine_in' : orderType === 'takeaway' ? 'takeaway' : 'delivery';
      const res = await createOrder({
        outlet_id: outletId,
        order_type: orderTypeApi,
        items: cart.map((i: CartItemType) => ({
          menu_item_id: i.menu_item_id,
          quantity: i.quantity,
          variant_id: i.variant_id,
          special_instructions: i.special_instructions,
          addons: i.addons?.map((a) => ({ addon_id: a.addon_id, quantity: a.quantity })),
        })),
        table_id: tableId,
        table_number: tableNumber,
        session_id: sessionId,
        qr_context: tableId || tableNumber ? { tableId, tableNumber } : undefined,
        customer_name: customerName.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
        customer_email: customerEmail.trim() || undefined,
        special_instructions: specialInstructions.trim() || undefined,
      });
      dispatch({ type: 'CLEAR_CART' });
      dispatch({ type: 'SET_CURRENT_ORDER_ID', payload: res.order.id });
      const minimalOrder: import('../api/types').GetOrderResponse['order'] = {
        id: res.order.id,
        order_number: res.order.order_number,
        status: res.order.status as import('../api/types').OrderStatus,
        total_amount: res.order.total_amount,
        order_type: res.order.order_type,
        created_at: res.order.created_at,
        updated_at: res.order.created_at,
        items: [],
        outlet: null,
        table: null,
        customer_name: null,
        customer_phone: null,
        special_instructions: null,
      };
      dispatch({ type: 'SET_ORDER', payload: minimalOrder });
      addNotification(t('order.placed') + ' #' + res.order.order_number, res.order.id);
      showOrderStatusPopup(res.order.status as import('../api/types').OrderStatus);
      navigate('/history', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setPlacing(false);
    }
  }

  if (!outletId) {
    return (
      <>
        <AppBar />
        <main className="main-content">
          <div className="container">
            <p className="cart-empty-msg">{t('menu.noMenu')}</p>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
              {t('scan.title')}
            </button>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  if (cart.length === 0) {
    return (
      <>
        <AppBar />
        <main className="main-content">
          <div className="container cart-empty">
            <p className="cart-empty-msg">{t('cart.empty')}</p>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/menu')}>
              {t('nav.menu')}
            </button>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <AppBar title={t('cart.title')} />
      <main className="main-content">
        <div className="container cart-page">
          <ul className="cart-list">
            {cart.map((item, index) => (
              <li key={`${item.menu_item_id}-${index}`} className="cart-item card">
                <div className="cart-item-info">
                  <span className="cart-item-name">{item.menu_item_name}</span>
                  {item.variant_name && (
                    <span className="cart-item-variant">{item.variant_name}</span>
                  )}
                  <span className="cart-item-price">
                    {currency} {item.unit_price} × {item.quantity}
                  </span>
                </div>
                <div className="cart-item-actions">
                  <div className="cart-item-qty">
                    <button
                      type="button"
                      className="cart-qty-btn"
                      onClick={() => updateQty(index, -1)}
                      aria-label="-"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="cart-qty-num">{item.quantity}</span>
                    <button
                      type="button"
                      className="cart-qty-btn"
                      onClick={() => updateQty(index, 1)}
                      aria-label="+"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="cart-remove-btn"
                    onClick={() => removeItem(index)}
                    aria-label={t('cart.remove')}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <form className="cart-form" onSubmit={handlePlaceOrder}>
            <label className="cart-label">
              <span>{t('cart.customerName')}</span>
              <input
                type="text"
                className="input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t('cart.customerName')}
              />
            </label>
            <label className="cart-label">
              <span>{t('cart.customerPhone')}</span>
              <input
                type="tel"
                className="input"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder={t('cart.customerPhone')}
              />
            </label>
            <label className="cart-label">
              <span>{t('cart.customerEmail')}</span>
              <input
                type="email"
                className="input"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder={t('cart.customerEmail')}
              />
            </label>
            <label className="cart-label">
              <span>{t('cart.specialInstructions')}</span>
              <textarea
                className="input cart-textarea"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder={t('cart.specialInstructions')}
                rows={2}
              />
            </label>
            <div className="cart-subtotal">
              <span>{t('cart.subtotal')}</span>
              <strong>{currency} {subtotal.toFixed(2)}</strong>
            </div>
            {error && <p className="cart-error">{error}</p>}
            <button type="submit" className="btn btn-primary cart-place-btn" disabled={placing}>
              {placing ? t('common.loading') : t('cart.placeOrder')}
            </button>
          </form>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
