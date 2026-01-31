import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Plus, Minus } from 'lucide-react';
import type { MenuItemSummary } from '../api/types';
import type { CartItem } from '../api/types';
import './AddToCartModal.css';

const SWIPE_CLOSE_THRESHOLD = 80;

interface AddToCartModalProps {
  item: MenuItemSummary;
  currency: string;
  onAdd: (cartItem: CartItem) => void;
  onClose: () => void;
}

export default function AddToCartModal({ item, currency, onAdd, onClose }: AddToCartModalProps) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [variantId, setVariantId] = useState<string | undefined>(undefined);
  const [variantName, setVariantName] = useState<string | undefined>(undefined);
  const [variantPrice, setVariantPrice] = useState<number | undefined>(undefined);
  const [addonQtys, setAddonQtys] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    item.addons?.forEach((a) => { init[a.id] = 0; });
    return init;
  });
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    const vs = item.variants ?? [];
    if (vs.length > 0) {
      const first = vs[0];
      setVariantId(first.id);
      setVariantName(first.name);
      setVariantPrice(first.price ?? item.price ?? 0);
    } else {
      setVariantId(undefined);
      setVariantName(undefined);
      setVariantPrice(undefined);
    }
  }, [item.id]);

  const variants = item.variants ?? [];
  const addons = item.addons ?? [];
  const basePrice = variantPrice ?? item.price ?? 0;
  const addonList = useMemo(() => {
    return addons
      .map((a) => ({
        addon_id: a.id,
        name: a.name,
        price: a.price ?? 0,
        quantity: addonQtys[a.id] ?? 0,
      }))
      .filter((a) => a.quantity > 0);
  }, [addons, addonQtys]);

  const lineTotal = basePrice * quantity + addonList.reduce((sum, a) => sum + a.price * a.quantity, 0);

  function handleAdd() {
    const cartItem: CartItem = {
      menu_item_id: item.id,
      menu_item_name: item.name,
      quantity,
      unit_price: basePrice,
      variant_id: variantId,
      variant_name: variantName,
      special_instructions: specialInstructions.trim() || undefined,
      addons: addonList.length > 0 ? addonList : undefined,
    };
    onAdd(cartItem);
    onClose();
  }

  function setAddonQty(addonId: string, delta: number) {
    setAddonQtys((prev) => {
      const next = { ...prev };
      const current = next[addonId] ?? 0;
      next[addonId] = Math.max(0, current + delta);
      return next;
    });
  }

  const hasAddons = addons.length > 0;
  const hasVariants = variants.length > 0;

  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const currentDragY = useRef(0);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onHandlePointerDown = useCallback((e: React.PointerEvent) => {
    startY.current = e.clientY;
    currentDragY.current = 0;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onHandlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!e.buttons && e.pointerType !== 'touch') return;
    const dy = Math.max(0, e.clientY - startY.current);
    currentDragY.current = dy;
    setDragY(dy);
  }, []);

  const onHandlePointerUp = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    const didSwipe = currentDragY.current >= SWIPE_CLOSE_THRESHOLD;
    currentDragY.current = 0;
    if (didSwipe) onClose();
    else setDragY(0);
  }, [onClose]);

  // Portal to document.body so fixed positioning is relative to viewport (avoids DeviceFrame transform/overflow clipping on real devices)
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const modalContent = (
    <div
      className="add-to-cart-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-cart-title"
      onClick={onClose}
    >
      <div
        className="add-to-cart-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ transform: dragY ? `translateY(${dragY}px)` : undefined }}
      >
        <div
          className="add-to-cart-handle-wrap"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={() => setDragY(0)}
          role="presentation"
          aria-hidden
        >
          <div className="add-to-cart-handle" />
        </div>
        <div className="add-to-cart-header">
          <h2 id="add-to-cart-title" className="add-to-cart-title">{item.name}</h2>
          <button type="button" className="add-to-cart-close" onClick={onClose} aria-label={t('common.cancel')}>
            <X size={22} />
          </button>
        </div>
        <div className="add-to-cart-body">
          {item.description && (
            <p className="add-to-cart-desc">{item.description}</p>
          )}
          {hasVariants && (
            <fieldset className="add-to-cart-fieldset">
              <legend>{t('menu.variants')}</legend>
              <div className="add-to-cart-variants">
                {variants.map((v) => (
                  <label key={v.id} className="add-to-cart-variant-option">
                    <input
                      type="radio"
                      name="variant"
                      value={v.id}
                      checked={variantId === v.id}
                      onChange={() => {
                        setVariantId(v.id);
                        setVariantName(v.name);
                        setVariantPrice(v.price ?? item.price ?? 0);
                      }}
                    />
                    <span>{v.name}</span>
                    {v.price != null && <span className="add-to-cart-variant-price">{currency} {v.price}</span>}
                  </label>
                ))}
              </div>
              {!variantId && variants.length > 0 && (
                <p className="add-to-cart-hint">{t('menu.selectVariant')}</p>
              )}
            </fieldset>
          )}
          {hasAddons && (
            <fieldset className="add-to-cart-fieldset">
              <legend>{t('menu.addons')}</legend>
              <p className="add-to-cart-addons-hint">{t('menu.addonsHint')}</p>
              <ul className="add-to-cart-addons">
                {addons.map((a) => (
                  <li key={a.id} className="add-to-cart-addon-row">
                    <span className="add-to-cart-addon-name">{a.name}</span>
                    {a.price != null && a.price > 0 && (
                      <span className="add-to-cart-addon-price">{currency} {a.price}</span>
                    )}
                    <div className="add-to-cart-addon-qty">
                      <button
                        type="button"
                        className="add-to-cart-qty-btn"
                        onClick={() => setAddonQty(a.id, -1)}
                        disabled={(addonQtys[a.id] ?? 0) <= 0}
                        aria-label="-"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="add-to-cart-qty-num">{addonQtys[a.id] ?? 0}</span>
                      <button
                        type="button"
                        className="add-to-cart-qty-btn"
                        onClick={() => setAddonQty(a.id, 1)}
                        aria-label="+"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </fieldset>
          )}
          <label className="add-to-cart-notes-label">
            <span>{t('menu.notesForItem')}</span>
            <input
              type="text"
              className="input add-to-cart-notes-input"
              placeholder={t('menu.notesForItemPlaceholder')}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            />
          </label>
          <div className="add-to-cart-qty-row">
            <span>{t('menu.quantity')}</span>
            <div className="add-to-cart-qty-controls">
              <button
                type="button"
                className="add-to-cart-qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="-"
              >
                <Minus size={16} />
              </button>
              <span className="add-to-cart-qty-num">{quantity}</span>
              <button
                type="button"
                className="add-to-cart-qty-btn"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="+"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div className="add-to-cart-total">
            <span>{t('cart.subtotal')}</span>
            <strong>{currency} {lineTotal.toFixed(2)}</strong>
          </div>
        </div>
        <div className="add-to-cart-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary add-to-cart-submit"
            onClick={handleAdd}
            disabled={hasVariants && !variantId}
          >
            {t('menu.addToCart')}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
