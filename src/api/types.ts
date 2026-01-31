// Public Customer API types

export interface QRContext {
  outletId: string;
  outletType: string;
  tableNumber: string | null;
  tableId: string | null;
  scanMode: 'dine-in' | 'takeaway';
  sessionId: string;
  currency: string;
  country: string;
  language: string;
}

export interface TableInfo {
  id: string;
  table_number: string;
  table_name?: string;
}

export interface OutletInfo {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface MenuInfo {
  id?: string;
  name?: string;
  categories?: MenuCategory[];
  items?: MenuItemSummary[];
}

export interface MenuCategory {
  id: string;
  name: string;
  items?: MenuItemSummary[];
}

export interface MenuItemSummary {
  id: string;
  name: string;
  description?: string | null;
  price?: number;
  imageUrl?: string | null;
  isVeg?: boolean;
  variants?: { id: string; name: string; price?: number }[];
  addons?: { id: string; name: string; price?: number }[];
}

export interface QRContextResponse {
  status: string;
  version?: string;
  generatedAt?: string;
  qrContext?: QRContext;
  table?: TableInfo | null;
  outlet?: OutletInfo;
  features?: object;
  offers?: unknown[];
  events?: unknown[];
  menu?: MenuInfo;
  policies?: object;
  uiHints?: object;
}

export interface OrderItemRequest {
  menu_item_id: string;
  quantity: number;
  variant_id?: string;
  special_instructions?: string;
  addons?: { addon_id: string; quantity: number }[];
}

export interface CreateOrderRequest {
  outlet_id: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  items: OrderItemRequest[];
  table_id?: string;
  table_number?: string;
  session_id?: string;
  qr_context?: { tableId?: string; tableNumber?: string };
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  special_instructions?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message?: string;
  order: {
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
    order_type: string;
    table_number: string | null;
    table_id: string | null;
    created_at: string;
    estimated_time?: number;
  };
  customer?: object | null;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled';

export interface OrderItemDetail {
  id: string;
  menu_item: { name: string; description: string | null } | null;
  variant: { name: string } | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions: string | null;
  addons: Array<{ addon: { name: string } | null; quantity: number; price: number }>;
}

export interface GetOrderResponse {
  success: boolean;
  order: {
    id: string;
    order_number: string;
    status: OrderStatus;
    total_amount: number;
    order_type: string;
    customer_name: string | null;
    customer_phone: string | null;
    special_instructions: string | null;
    items: OrderItemDetail[];
    outlet: { name: string; address: string } | null;
    table: { table_number: string; table_name: string } | null;
    created_at: string;
    updated_at: string;
  };
}

export interface OutletListItem {
  id: string;
  business_id: string;
  name: string;
  address?: string;
  phone?: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OutletsResponse {
  success: boolean;
  data: OutletListItem[];
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ msg: string; path: string }>;
}

// Cart (local state)
export interface CartItem {
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  variant_id?: string;
  variant_name?: string;
  special_instructions?: string;
  addons?: { addon_id: string; name: string; quantity: number; price: number }[];
}

export interface MenuItemWithDetails extends MenuItemSummary {
  description?: string | null;
  variants?: { id: string; name: string; price?: number }[];
  addons?: { id: string; name: string; price?: number }[];
}
