import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UtensilsCrossed, ShoppingCart, History } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import './BottomNav.css';

export default function BottomNav() {
  const { t } = useTranslation();
  const { state } = useApp();
  const cartCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <nav className="bottom-nav" role="navigation" aria-label={t('nav.menu')}>
      <NavLink
        to="/menu"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        end
      >
        <UtensilsCrossed size={22} strokeWidth={2} />
        <span>{t('nav.menu')}</span>
      </NavLink>
      <NavLink
        to="/cart"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="bottom-nav-cart-wrap">
          <ShoppingCart size={22} strokeWidth={2} />
          {cartCount > 0 && <span className="bottom-nav-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
        </span>
        <span>{t('nav.cart')}</span>
      </NavLink>
      <NavLink
        to="/history"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <History size={22} strokeWidth={2} />
        <span>{t('nav.history')}</span>
      </NavLink>
    </nav>
  );
}
