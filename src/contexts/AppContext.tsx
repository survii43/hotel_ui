import { createContext, useReducer, useCallback, useMemo, type ReactNode } from 'react';
import type {
  QRContextResponse,
  OutletInfo,
  CartItem,
  OrderStatus,
  GetOrderResponse,
} from '../api/types';
import { isUuid } from '../utils/validation';

interface AppState {
  qrContext: QRContextResponse | null;
  outlet: OutletInfo | null;
  tableId: string | null;
  tableNumber: string | null;
  sessionId: string | null;
  orderType: 'dine_in' | 'takeaway';
  cart: CartItem[];
  currentOrderId: string | null;
  currentOrder: GetOrderResponse['order'] | null;
  orderStatusPopup: OrderStatus | null;
  notifications: Array<{ id: string; message: string; orderId?: string; read: boolean }>;
}

type Action =
  | { type: 'SET_QR'; payload: QRContextResponse }
  | { type: 'SET_OUTLET'; payload: OutletInfo | null }
  | { type: 'SET_ORDER'; payload: GetOrderResponse['order'] | null }
  | { type: 'SET_CURRENT_ORDER_ID'; payload: string | null }
  | { type: 'ORDER_STATUS_POPUP'; payload: OrderStatus | null }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'UPDATE_CART_ITEM'; payload: { index: number; item: Partial<CartItem> } }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_NOTIFICATION'; payload: { id: string; message: string; orderId?: string } }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'RESET_SESSION' };

const initialState: AppState = {
  qrContext: null,
  outlet: null,
  tableId: null,
  tableNumber: null,
  sessionId: null,
  orderType: 'dine_in',
  cart: [],
  currentOrderId: null,
  currentOrder: null,
  orderStatusPopup: null,
  notifications: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_QR': {
        const qr = action.payload.qrContext;
        const rawOutlet = action.payload.outlet as OutletInfo & { uuid?: string } | undefined;
        // Orders API requires full UUID in outlet_id. Use only result.outlet.id or result.outlet.uuid (full UUID).
        // Do not use qrContext.outletId (e.g. 92DB0532) – it is not a valid UUID.
        const outletId =
          (rawOutlet?.id && isUuid(rawOutlet.id) ? rawOutlet.id : null) ??
          (rawOutlet?.uuid && isUuid(rawOutlet.uuid) ? rawOutlet.uuid : null) ??
          null;
        const outlet = outletId
          ? {
              id: outletId,
              name: rawOutlet?.name ?? 'Outlet',
              phone: rawOutlet?.phone ?? (rawOutlet as { contact?: { phone?: string } })?.contact?.phone,
              address: rawOutlet?.address ?? (rawOutlet as { address?: { line1?: string; city?: string } })?.address?.line1 ?? (rawOutlet as { address?: { line1?: string; city?: string } })?.address?.city,
            }
          : null;
        return {
          ...state,
          qrContext: action.payload,
          outlet: outlet ?? state.outlet,
          tableId: qr?.tableId ?? action.payload.table?.id ?? null,
          tableNumber: qr?.tableNumber ?? action.payload.table?.table_number ?? null,
          sessionId: qr?.sessionId ?? null,
          orderType:
            qr?.scanMode === 'takeaway' ? 'takeaway' : 'dine_in',
        };
      }
    case 'SET_OUTLET':
      return { ...state, outlet: action.payload };
    case 'SET_ORDER':
      return { ...state, currentOrder: action.payload };
    case 'SET_CURRENT_ORDER_ID':
      return { ...state, currentOrderId: action.payload };
    case 'ORDER_STATUS_POPUP':
      return { ...state, orderStatusPopup: action.payload };
    case 'ADD_TO_CART': {
      const existing = state.cart.findIndex(
        (c) =>
          c.menu_item_id === action.payload.menu_item_id &&
          c.variant_id === action.payload.variant_id &&
          JSON.stringify(c.addons?.map((a) => a.addon_id)) ===
            JSON.stringify(action.payload.addons?.map((a) => a.addon_id))
      );
      if (existing >= 0) {
        const next = [...state.cart];
        next[existing] = {
          ...next[existing],
          quantity: next[existing].quantity + action.payload.quantity,
        };
        return { ...state, cart: next };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    }
    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        cart: state.cart.map((item, i) =>
          i === action.payload.index ? { ...item, ...action.payload.item } : item
        ),
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter((_, i) => i !== action.payload),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          { ...action.payload, read: false },
          ...state.notifications,
        ].slice(0, 50),
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'RESET_SESSION':
      return initialState;
    default:
      return state;
  }
}

/* Context must be exported here for useApp hook; Fast Refresh warning accepted. */
// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addNotification: (message: string, orderId?: string) => void;
  markAllNotificationsRead: () => void;
  showOrderStatusPopup: (status: OrderStatus) => void;
  closeOrderStatusPopup: () => void;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addNotification = useCallback((message: string, orderId?: string) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { id: crypto.randomUUID(), message, orderId },
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  }, []);

  const showOrderStatusPopup = useCallback((status: OrderStatus) => {
    dispatch({ type: 'ORDER_STATUS_POPUP', payload: status });
  }, []);

  const closeOrderStatusPopup = useCallback(() => {
    dispatch({ type: 'ORDER_STATUS_POPUP', payload: null });
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      addNotification,
      markAllNotificationsRead,
      showOrderStatusPopup,
      closeOrderStatusPopup,
    }),
    [state, addNotification, markAllNotificationsRead, showOrderStatusPopup, closeOrderStatusPopup]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
