# Hotel UI – Customer / User Web App

React.js customer-facing web app for restaurant/hotel ordering: scan QR → browse menu → cart → place order → track order. Theming and **multi-language support** (including **all 22 scheduled languages of India**).

## Features

- **Public Customer API** (no auth): scan barcode, menu, create order, track order
- **Theming**: light / dark / system, applied across the whole app via CSS variables
- **i18n**: 13+ Indian languages (English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Urdu, Odia, Assamese) + easy to add more
- **Mobile-first**: bottom app bar (Menu, Cart, History), responsive for phone and web
- **App bar**: notifications icon, order status popup, language and theme switchers
- **Fast**: Vite + React 19, minimal dependencies

## Setup

```bash
npm install
cp .env.example .env
# Edit .env: set VITE_API_URL to your API root (e.g. http://localhost:3000)
npm run dev
```

Open `http://localhost:5173`. Scan page → enter or paste barcode/URL → continue to menu → add to cart → place order → track in History.

## Scripts

- `npm run dev` – development server
- `npm run build` – production build
- `npm run preview` – preview production build

## Environment

| Variable        | Description                    |
|----------------|--------------------------------|
| `VITE_API_URL` | API base URL (e.g. `http://localhost:3000`) |

## Project structure

- `src/api/` – API client and types (from Customer API doc)
- `src/components/` – AppBar, BottomNav, OrderStatusPopup
- `src/contexts/` – ThemeContext, AppContext (cart, order, notifications)
- `src/i18n/` – i18next config and locale JSON (en + Indian languages)
- `src/pages/` – Scan, Menu, Cart, History, OrderTracking

## API

Uses the Customer API:

- **Public**: `GET /api/customer/scan/:barcode`, `POST /api/customer/orders`, `GET /api/customer/orders/:orderId`, `GET /api/customer/outlets/:outletId/active-menu`, etc.
- **Staff** (Bearer): not used in this customer app; add token in `src/api/client.ts` if needed.

## Languages (India)

Included locales: English, हिन्दी, தமிழ், తెలుగు, বাংলা, मराठी, ગુજરાતી, ಕನ್ನಡ, മലയാളം, ਪੰਜਾਬੀ, اردو, ଓଡ଼ିଆ, অসমীয়া. Stored in `src/i18n/locales/`. User can switch via app bar (globe icon).

## Theming

Theme (light/dark/system) is stored in `localStorage` and applied as `data-theme` on `<html>`. All colors use CSS variables in `src/index.css` so the entire app respects the selected theme.
