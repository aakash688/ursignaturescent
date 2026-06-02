# URsignature UI (Cloudflare Pages)

Frontend for URsignature — storefront and admin. Calls the Workers API via `VITE_WORKERS_API_URL`. Built with Vite + React; deploy to Cloudflare Pages.

## Setup

1. **Install**
   ```bash
   npm install
   ```

2. **Environment**
   - Create `.env` or `.env.local` (or set in Cloudflare Pages dashboard):
   - `VITE_WORKERS_API_URL` — Base URL of the deployed Workers API (no trailing slash), e.g. `https://ursignature-api.<account>.workers.dev`
   - Optional for client-side Supabase auth: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

3. **Run locally**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173. Ensure the Workers API is running (e.g. `cd ../workers && npm run dev`) and set `VITE_WORKERS_API_URL=http://localhost:8787` so the UI can call it.

## Build

```bash
npm run build
```

Output is in `dist/` (static assets). No server required for production.

## Deploy to Cloudflare Pages

**Option A — Git integration**
- Connect the repo to Cloudflare Pages.
- Build command: `npm run build`
- Output directory: `dist`
- Add env var `VITE_WORKERS_API_URL` = your Worker URL (e.g. `https://ursignature-api.<account>.workers.dev`).

**Option B — Wrangler**
```bash
npm run build
npx wrangler pages deploy dist --project-name=ursignature-ui
```
Then in the Cloudflare Pages dashboard, set `VITE_WORKERS_API_URL` for production and trigger a new build (or re-run build with the env set).

## Auth (admin)

Admin routes require an authenticated user with `role === 'admin'`. The app sends cookies with every request (`credentials: 'include'`). Log in via your Supabase auth flow (e.g. redirect to your auth page or Worker `/api/auth/callback`); the session cookie is then sent to the Worker, which validates the user and profile role.

## Routes

- **Storefront:** `/`, `/products`, `/product/:slug`, `/collections`, `/checkout`, `/track-order`, `/contact`, `/about`, `/faq`, `/login`, `/signup`, `/account`, etc.
- **Admin:** `/admin`, `/admin/products`, `/admin/products/new`, `/admin/products/:id`, `/admin/categories`, `/admin/orders`, `/admin/orders/:id`, `/admin/inventory`, `/admin/coupons`, `/admin/settings`, `/admin/contacts`, `/admin/reviews`, `/admin/newsletter`, `/admin/pos`, `/admin/analytics`, `/admin/customers`.
