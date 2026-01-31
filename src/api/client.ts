const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getHeaders(includeJson = true): HeadersInit {
  const headers: HeadersInit = {};
  if (includeJson) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('staff_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function scanBarcode(barcode: string): Promise<import('./types').QRContextResponse> {
  const encoded = encodeURIComponent(barcode);
  const res = await fetch(`${API_BASE}/api/customer/scan/${encoded}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Scan failed');
  return data;
}

export async function createOrder(
  body: import('./types').CreateOrderRequest
): Promise<import('./types').CreateOrderResponse> {
  const res = await fetch(`${API_BASE}/api/customer/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.errors?.[0]?.msg || 'Order failed');
  return data;
}

export async function getOrder(orderId: string): Promise<import('./types').GetOrderResponse> {
  const res = await fetch(`${API_BASE}/api/customer/orders/${orderId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Order not found');
  return data;
}

export async function getOutlets(
  businessReferenceId: string
): Promise<import('./types').OutletsResponse> {
  const res = await fetch(`${API_BASE}/api/customer/outlets/${businessReferenceId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Outlets not found');
  return data;
}

export async function getActiveMenu(outletId: string): Promise<{
  success: boolean;
  data: import('./types').MenuInfo & { categories?: import('./types').MenuCategory[] };
}> {
  const res = await fetch(`${API_BASE}/api/customer/outlets/${outletId}/active-menu`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Menu not found');
  return data;
}

export async function getMenuItem(itemId: string): Promise<{
  success: boolean;
  data: import('./types').MenuItemWithDetails;
}> {
  const res = await fetch(`${API_BASE}/api/customer/menu-items/${itemId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Item not found');
  return data;
}

export async function getOutletEvents(outletId: string): Promise<{
  success: boolean;
  data: Array<{ eventId: string; title: string; date: string; time: string; description?: string; imageUrl?: string }>;
}> {
  const res = await fetch(`${API_BASE}/api/customer/outlets/${outletId}/events`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Events not found');
  return data;
}

export { API_BASE };
