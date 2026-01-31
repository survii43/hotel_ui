import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { getActiveMenu } from '../api/client';
import type { MenuCategory, MenuItemSummary } from '../api/types';
import type { CartItem } from '../api/types';
import AppBar from '../components/AppBar';
import BottomNav from '../components/BottomNav';
import './Menu.css';

export default function Menu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [menu, setMenu] = useState<{ categories?: MenuCategory[]; items?: MenuItemSummary[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const outletId = state.outlet?.id;

  useEffect(() => {
    if (!outletId) {
      setLoading(false);
      setError(t('menu.noMenu'));
      return;
    }
    let cancelled = false;
    getActiveMenu(outletId)
      .then((res) => {
        if (!cancelled) {
          setMenu(res.data as { categories?: MenuCategory[]; items?: MenuItemSummary[] });
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : t('common.error'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [outletId, t]);

  function addToCart(item: MenuItemSummary, quantity = 1) {
    const price = item.price ?? 0;
    const cartItem: CartItem = {
      menu_item_id: item.id,
      menu_item_name: item.name,
      quantity,
      unit_price: price,
    };
    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
  }

  if (!outletId) {
    return (
      <>
        <AppBar />
        <main className="main-content">
          <div className="container">
            <p className="menu-empty">{t('menu.noMenu')}</p>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
              {t('scan.title')}
            </button>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <AppBar />
        <main className="main-content">
          <div className="container menu-loading">{t('common.loading')}</div>
        </main>
        <BottomNav />
      </>
    );
  }

  if (error || !menu) {
    return (
      <>
        <AppBar />
        <main className="main-content">
          <div className="container">
            <p className="menu-error">{error ?? t('common.error')}</p>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
              {t('common.retry')}
            </button>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  const categories = menu.categories ?? [];
  const items = menu.items ?? [];
  const hasCategories = categories.length > 0;
  const list = hasCategories
    ? categories.flatMap((c) => (c.items ?? []))
    : items;

  return (
    <>
      <AppBar />
      <main className="main-content">
        <div className="container menu-page">
          {hasCategories && (
            <nav className="menu-categories" aria-label={t('menu.categories')}>
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#cat-${cat.id}`}
                  className="menu-cat-link"
                >
                  {cat.name}
                </a>
              ))}
            </nav>
          )}
          <div className="menu-list">
            {hasCategories
              ? categories.map((cat) => (
                  <section key={cat.id} id={`cat-${cat.id}`} className="menu-section">
                    <h3 className="menu-section-title">{cat.name}</h3>
                    {(cat.items ?? []).map((item) => (
                      <div key={item.id} className="menu-item card">
                        <div className="menu-item-info">
                          <h4 className="menu-item-name">{item.name}</h4>
                          {item.description && (
                            <p className="menu-item-desc">{item.description}</p>
                          )}
                          <p className="menu-item-price">
                            {state.qrContext?.qrContext?.currency ?? 'INR'} {item.price ?? 0}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary menu-item-add"
                          onClick={() => addToCart(item)}
                          aria-label={t('menu.addToCart')}
                        >
                          <Plus size={18} />
                          {t('menu.addToCart')}
                        </button>
                      </div>
                    ))}
                  </section>
                ))
              : list.map((item) => (
                  <div key={item.id} className="menu-item card">
                    <div className="menu-item-info">
                      <h4 className="menu-item-name">{item.name}</h4>
                      {item.description && (
                        <p className="menu-item-desc">{item.description}</p>
                      )}
                      <p className="menu-item-price">
                        {state.qrContext?.qrContext?.currency ?? 'INR'} {item.price ?? 0}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary menu-item-add"
                      onClick={() => addToCart(item)}
                      aria-label={t('menu.addToCart')}
                    >
                      <Plus size={18} />
                      {t('menu.addToCart')}
                    </button>
                  </div>
                ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
