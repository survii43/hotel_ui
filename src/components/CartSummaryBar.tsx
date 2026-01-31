import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react';
import { useCartCount } from '../hooks/useApp';
import './CartSummaryBar.css';

const CART_BAR_HEIGHT_PX = 48;

export const CART_SUMMARY_BAR_HEIGHT = CART_BAR_HEIGHT_PX;

export default function CartSummaryBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const cartCount = useCartCount();

  if (cartCount < 1) return null;

  return (
    <button
      type="button"
      className="cart-summary-bar"
      onClick={() => navigate('/cart')}
      aria-label={t('cart.viewItemsAdded', { count: cartCount })}
    >
      <ShoppingCart size={20} strokeWidth={2} aria-hidden />
      <span className="cart-summary-bar-text">
        {t('cart.viewItemsAdded', { count: cartCount })}
      </span>
    </button>
  );
}
