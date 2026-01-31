import { useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import CartSummaryBar, { CART_SUMMARY_BAR_HEIGHT } from './CartSummaryBar';
import BottomNav from './BottomNav';
import './Footer.css';

export default function Footer() {
  const { state } = useApp();
  const cartCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);
  const showBar = cartCount > 0;

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--footer-extra',
      showBar ? `${CART_SUMMARY_BAR_HEIGHT}px` : '0px'
    );
    return () => {
      document.documentElement.style.removeProperty('--footer-extra');
    };
  }, [showBar]);

  return (
    <footer className="footer-wrapper" role="contentinfo">
      {showBar && <CartSummaryBar />}
      <BottomNav />
    </footer>
  );
}
