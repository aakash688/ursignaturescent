# URsignature API (Cloudflare Worker)

API for URsignature — products, orders, admin, payments, and R2 uploads. Built with Hono on Cloudflare Workers.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy the vars in `wrangler.toml` and set real values (or use `wrangler.toml` with placeholders and override via secrets).
   - Set **secrets** (never commit these):
     ```bash
     npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
     npx wrangler secret put RAZORPAY_KEY_SECRET   # if using payments
     npx wrangler secret put TELEGRAM_BOT_TOKEN   # if using Telegram
     ```
   - Ensure `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL` (and anon key) are set in `wrangler.toml` `[vars]` or via secrets.

3. **R2 bucket**
   - Create an R2 bucket (e.g. `ursignaturescent-media`) in the Cloudflare dashboard.
   - Set `NEXT_PUBLIC_R2_PUBLIC_URL` to the bucket’s public URL (e.g. custom domain or R2 dev URL).

## Commands

Run from **`Separate/workers`** (or use `--config=wrangler.toml` from repo root).

- **Local dev:** `npm run dev` — runs `wrangler dev` (Worker at http://localhost:8787).
- **Deploy:** `npm run deploy` — runs `wrangler deploy`.
- **Dry-run build:** `npm run build` — validates build without deploying.

## Routes (base path `/api`)

- **Public:** `/settings/public`, `/products`, `/orders`, `/auth/callback`, `/coupons/validate`, `/contact`, `/newsletter`, `/payment/create-order`, `/payment/verify`.
- **Admin (require admin role):** `/admin/settings`, `/admin/products`, `/admin/products/:id`, `/admin/products/:id/images`, `/admin/product-images/:id/primary`, `/admin/upload`, `/admin/categories`, `/admin/orders`, `/admin/inventory`, `/admin/coupons`, `/admin/customers`, `/admin/contacts`, `/admin/reviews`, `/admin/newsletter`, `/admin/pos/complete`.

Admin routes expect the Supabase session cookie (`sb-*-auth-token`) so the Worker can resolve the user and check `profiles.role === 'admin'`.

## Health

- `GET /api/health` — returns `{ ok: true, service: 'ursignature-api' }`.
