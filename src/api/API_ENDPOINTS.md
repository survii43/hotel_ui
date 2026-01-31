# Customer API – Endpoint Integration Audit

| Method | Endpoint | Integrated | Usage |
|--------|----------|------------|--------|
| GET | `/api/customer/scan/:barcode` | ✅ | `scanBarcode()` – Scan page |
| POST | `/api/customer/orders` | ✅ | `createOrder()` – Cart place order |
| GET | `/api/customer/orders/:orderId` | ✅ | `getOrder()` – History, OrderTracking |
| GET | `/api/customer/web/:barcode` | ✅ | `getWebAppRedirectUrl()` – optional redirect |
| GET | `/api/customer/outlets/:businessReferenceId` | ✅ | `getOutlets()` – list outlets by business ref |
| GET | `/api/customer/outlets/:outletId/active-menu` | ✅ | `getActiveMenu()` – Menu page |
| GET | `/api/customer/menu-items/:itemId` | ✅ | `getMenuItem()` – item detail / addons |
| GET | `/api/customer/outlets/:outletId/events` | ✅ | `getOutletEvents()` – outlet events |

Staff APIs (`/api/customers/*`) are not used in this customer app.
