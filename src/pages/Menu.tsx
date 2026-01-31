import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { useActiveMenu } from '../hooks/queries';
import { normalizeScanMenu } from '../utils/normalizeScanMenu';
import type { MenuCategory, MenuItemSummary } from '../api/types';
import type { CartItem } from '../api/types';
import AppBar from '../components/AppBar';
import BottomNav from '../components/BottomNav';
import AddToCartModal from '../components/AddToCartModal';
import './Menu.css';

export default function Menu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch, addNotification } = useApp();
  const [modalItem, setModalItem] = useState<MenuItemSummary | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const outletId = state.outlet?.id ?? state.qrContext?.qrContext?.outletId ?? null;
  const currency = state.qrContext?.qrContext?.currency ?? 'INR';

  // Prefer menu from scan response when present – no API call (avoids duplicate/failing request)
  const hasScanMenu =
    state.qrContext?.menu &&
    Array.isArray((state.qrContext.menu as { categories?: unknown[] }).categories) &&
    (state.qrContext.menu as { categories: unknown[] }).categories.length > 0;

  const activeMenuQuery = useActiveMenu(outletId, { enabled: !!outletId && !hasScanMenu });

  const menu = useMemo(() => {
    if (!outletId) return null;
    if (hasScanMenu) {
      return normalizeScanMenu(state.qrContext!.menu as Parameters<typeof normalizeScanMenu>[0]) ?? null;
    }
    const data = activeMenuQuery.data?.data as { categories?: MenuCategory[]; items?: MenuItemSummary[] } | undefined;
    if (!data) return null;
    return data?.categories?.length
      ? data
      : { categories: data?.categories ?? [], items: data?.items ?? [] };
  }, [outletId, hasScanMenu, state.qrContext, activeMenuQuery.data?.data]);

  const categories = useMemo(() => menu?.categories ?? [], [menu?.categories]);
  const items = menu?.items ?? [];
  const hasCategories = categories.length > 0;
  const list = hasCategories ? categories.flatMap((c) => (c.items ?? [])) : items;

  const loading = !!outletId && !hasScanMenu && activeMenuQuery.isLoading;
  const error = !outletId
    ? t('menu.noMenu')
    : hasScanMenu
      ? null
      : (activeMenuQuery.error instanceof Error ? activeMenuQuery.error.message : activeMenuQuery.error ? t('common.error') : null);

  /* Sync active tab and expanded state when categories load. */
  useEffect(() => {
    if (!hasCategories) return;
    const ids = categories.map((c) => c.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync UI state when categories load
    setActiveCategoryId((prev) => (prev && ids.includes(prev) ? prev : ids[0] ?? null));
    setExpandedCategories((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        if (next[id] === undefined) next[id] = true;
      });
      return next;
    });
  }, [hasCategories, categories]);

  const scrollToCategory = useCallback((catId: string) => {
    setActiveCategoryId(catId);
    const el = sectionRefs.current[catId] ?? document.getElementById(`cat-${catId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const toggleCategoryExpanded = useCallback((catId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  }, []);

  const isExpanded = useCallback(
    (catId: string) => expandedCategories[catId] !== false,
    [expandedCategories]
  );

  // Sync active tab when user scrolls (IntersectionObserver)
  useEffect(() => {
    if (!hasCategories || categories.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = e.target.getAttribute('id')?.replace(/^cat-/, '');
          if (id) setActiveCategoryId(id);
        }
      },
      { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    categories.forEach((cat) => {
      const el = document.getElementById(`cat-${cat.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [hasCategories, categories]);

  function addToCart(cartItem: CartItem) {
    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
    addNotification(t('cart.addedToCart'));
  }

  function openAddToCart(item: MenuItemSummary) {
    setModalItem(item);
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
            <div className="menu-error-actions">
              {outletId && !hasScanMenu && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => activeMenuQuery.refetch()}
                  disabled={activeMenuQuery.isFetching}
                >
                  {activeMenuQuery.isFetching ? t('common.loading') : t('common.retry')}
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/order')}>
                {t('cart.scanTableCode')}
              </button>
            </div>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <AppBar />
      <main className="main-content">
        <div className="container menu-page">
          <div className="menu-hero">
            <div className="menu-context">
              <span className="menu-context-outlet">{state.outlet?.name}</span>
              {state.tableNumber && (
                <span className="menu-context-table">{t('menu.table')} {state.tableNumber}</span>
              )}
            </div>
          </div>
          {hasCategories && (
            <nav className="menu-categories" aria-label={t('menu.categories')}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`menu-cat-link ${activeCategoryId === cat.id ? 'menu-cat-link-active' : ''}`}
                  onClick={() => scrollToCategory(cat.id)}
                  aria-pressed={activeCategoryId === cat.id}
                >
                  {cat.name}
                </button>
              ))}
            </nav>
          )}
          <div className="menu-list">
            {hasCategories
              ? categories.map((cat) => (
                  <section
                    key={cat.id}
                    id={`cat-${cat.id}`}
                    className={`menu-section ${isExpanded(cat.id) ? 'menu-section-expanded' : 'menu-section-collapsed'}`}
                    ref={(el) => { sectionRefs.current[cat.id] = el; }}
                  >
                    <button
                      type="button"
                      className="menu-section-header"
                      onClick={() => toggleCategoryExpanded(cat.id)}
                      aria-expanded={isExpanded(cat.id)}
                      aria-controls={`cat-${cat.id}-items`}
                    >
                      <h2 className="menu-section-title">{cat.name}</h2>
                      <span className="menu-section-chevron" aria-hidden>
                        <ChevronDown size={24} strokeWidth={2.5} />
                      </span>
                    </button>
                    <div
                      id={`cat-${cat.id}-items`}
                      className={`menu-section-items ${isExpanded(cat.id) ? '' : 'menu-section-items-collapsed'}`}
                      role="region"
                      aria-hidden={!isExpanded(cat.id)}
                    >
                    {(cat.items ?? []).map((item) => (
                      <article key={item.id} className="menu-item-card">
                        {item.imageUrl && (
                          <div className="menu-item-image-wrap">
                            <img src={item.imageUrl} alt="" className="menu-item-image" loading="lazy" />
                            {item.isVeg && <span className="menu-item-veg" aria-hidden>Veg</span>}
                          </div>
                        )}
                        {!item.imageUrl && item.isVeg && <span className="menu-item-veg menu-item-veg-inline">Veg</span>}
                        <div className="menu-item-body">
                          <h4 className="menu-item-name">{item.name}</h4>
                          {item.description && (
                            <p className="menu-item-desc">{item.description}</p>
                          )}
                          <div className="menu-item-footer">
                            <span className="menu-item-price">{currency} {item.price ?? 0}</span>
                            <button
                              type="button"
                              className="menu-item-add-btn"
                              onClick={() => openAddToCart(item)}
                              aria-label={t('menu.addToCart')}
                            >
                              <Plus size={18} strokeWidth={2.5} />
                              {t('menu.addToCart')}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                    </div>
                  </section>
                ))
              : list.map((item) => (
                  <article key={item.id} className="menu-item-card">
                    {item.imageUrl && (
                      <div className="menu-item-image-wrap">
                        <img src={item.imageUrl} alt="" className="menu-item-image" loading="lazy" />
                        {item.isVeg && <span className="menu-item-veg" aria-hidden>Veg</span>}
                      </div>
                    )}
                    {!item.imageUrl && item.isVeg && <span className="menu-item-veg menu-item-veg-inline">Veg</span>}
                    <div className="menu-item-body">
                      <h4 className="menu-item-name">{item.name}</h4>
                      {item.description && (
                        <p className="menu-item-desc">{item.description}</p>
                      )}
                      <div className="menu-item-footer">
                        <span className="menu-item-price">{currency} {item.price ?? 0}</span>
                        <button
                          type="button"
                          className="menu-item-add-btn"
                          onClick={() => openAddToCart(item)}
                          aria-label={t('menu.addToCart')}
                        >
                          <Plus size={18} strokeWidth={2.5} />
                          {t('menu.addToCart')}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
          </div>
        </div>
      </main>
      {modalItem && (
        <AddToCartModal
          item={modalItem}
          currency={currency}
          onAdd={addToCart}
          onClose={() => setModalItem(null)}
        />
      )}
      <BottomNav />
    </>
  );
}
