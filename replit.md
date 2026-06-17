# BTbiz Pharmacy WhatsApp Communication Platform

Multi-tenant pharmacy ↔ patient communication platform powered by the Meta WhatsApp Cloud API.

## Architecture

- **Frontend** (`Frontend/`): React 19 + Vite + TypeScript + Tailwind CSS. Landing page + pharmacy dashboard (inbox, patients, settings).
- **Backend** (`Backend/`): Express + TypeScript + Mongoose (MongoDB). REST API under `/api/v1`, plus WhatsApp webhook handling.
- **Database**: MongoDB (Mongoose). Connection via `MONGODB_URI`.

## Replit Setup

- **Frontend workflow**: `cd Frontend && npm run dev` — Vite on `0.0.0.0:5000` (the public preview port). `strictPort` + `allowedHosts: true` so the proxied iframe preview works. Proxies `/api` and `/uploads` to the backend.
- **Backend workflow**: `cd Backend && npm run dev` — Express on `localhost:3001` (set via the `PORT` env var, development scope only).

## Environment Variables / Secrets

- `MONGODB_URI` (secret) — MongoDB Atlas connection string.
- `META_ACCESS_TOKEN`, `META_VERIFY_TOKEN` (secrets) — Meta WhatsApp Cloud API credentials.
- `JWT_SECRET` (shared env) — auto-generated.
- `PORT=3001` (development scope) — backend dev port. In production the backend defaults to port 5000.
- `NODE_ENV=production` (production scope) — enables the backend serving the built frontend.
- Optional: `APP_PUBLIC_URL` — set to the deployed `.replit.app` URL in production so outbound WhatsApp media links resolve externally.

## Deployment

Configured as a **VM** deployment (always-on, so the WhatsApp webhook stays reachable):
- **Build**: installs deps and builds both `Frontend` (Vite → `Frontend/dist`) and `Backend` (tsc → `Backend/dist`).
- **Run**: `cd Backend && npm start` (`node dist/server.js`). In production (`NODE_ENV=production`) the backend serves the built frontend from `Frontend/dist` with SPA fallback, and the API, on a single port (5000).

## User Preferences

(None recorded yet.)
