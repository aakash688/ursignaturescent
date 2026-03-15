# Cloudflare Deployment Report — ursignature

**Date:** 2026-03-15  
**Analyst:** DevOps Agent

---

## Phase 1 — Project Analysis

### Project Type
- **Framework:** Next.js 15.1.0 (App Router)
- **Structure:** Full-stack e‑commerce (storefront + admin panel)
- **API routes:** 26 (auth, payment, admin CRUD, contact, newsletter, etc.)
- **Data:** Supabase (Postgres), Cloudflare R2 (images), Razorpay (payments)

### Cloudflare Compatibility

| Requirement | Status |
|-------------|--------|
| Static builds | ❌ Not applicable — app uses SSR and API routes |
| Edge runtime | ⚠️ Supported via OpenNext (Workers), not Pages |
| Pages Functions | ❌ Would require full API migration |
| Node servers | ❌ Not supported on Pages |

**Verdict:** **Not compatible with Cloudflare Pages static deployment.**

---

## Why Cloudflare Pages (static) Fails

1. **API routes** — Next.js `output: 'export'` does not support API routes. The app has 26 API routes (payment, auth, admin, contact, etc.) that would be dropped.
2. **Server-side rendering** — Product, collection, and admin pages fetch from Supabase at request time. Static export would require pre-rendering all possible slugs at build time.
3. **Dynamic routes** — Routes like `/api/admin/coupons/[id]` cause build errors with static export.

---

## Recommended Deployment: Cloudflare Workers (OpenNext)

Cloudflare’s recommended path for full Next.js apps is **Workers** via the OpenNext adapter, not Pages.

### Current Setup
- **Config:** `wrangler.jsonc` (Workers)
- **Build:** `opennextjs-cloudflare build` → `.open-next/`
- **Deploy:** `wrangler deploy`

### Windows Build Issue
OpenNext fails on Windows with:

```
Error: Invalid alias name: "next/dist/compiled/node-fetch"
```

This is a known Windows-only esbuild issue. The same build works on Linux.

---

## Deployment Options

### Option A: GitHub Actions (recommended)

Build and deploy on Linux in CI:

1. Add `CLOUDFLARE_API_TOKEN` and build-time env vars as GitHub repo secrets.
2. Push to `main` — the workflow in `.github/workflows/deploy-cloudflare.yml` runs and deploys to Workers.
3. Site URL: `https://ursignature.<subdomain>.workers.dev`

### Option B: WSL (local deploy)

1. Install WSL2 and open Ubuntu.
2. Run:
   ```bash
   cd /mnt/c/Users/USER/Desktop/website/ursignature
   npm ci
   npm run deploy:cloudflare
   ```

### Option C: Cloudflare Dashboard + Git

1. Create a Pages project in the Cloudflare dashboard.
2. Connect the GitHub repo.
3. Use build command: `npx opennextjs-cloudflare build`
4. Use output directory: `.open-next/assets` (or follow OpenNext docs for Pages).

---

## Phase 2 — Build Detection

| Item | Value |
|------|-------|
| Build command | `npm run build` (Next.js) or `opennextjs-cloudflare build` (Workers) |
| Output (static export) | `out/` |
| Output (OpenNext/Workers) | `.open-next/` (worker.js + assets) |

---

## Phase 3 — Environment Variables

### Non-secret (in `wrangler.jsonc` vars)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `R2_BUCKET_NAME`
- `NEXT_PUBLIC_R2_PUBLIC_URL`
- `TELEGRAM_CHAT_ID`
- `SHIPROCKET_EMAIL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`

### Secrets (set via `npm run wrangler:secrets` or `wrangler secret put`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
- `TELEGRAM_BOT_TOKEN`
- `SHIPROCKET_PASSWORD`
- `CRON_SECRET`

**Status:** `CRON_SECRET` set. Ensure `.env` / `.env.local` are filled and run `npm run wrangler:secrets` for the rest.

---

## Phase 4 — Cloudflare Config

| File | Purpose |
|------|---------|
| `wrangler.jsonc` | Workers (OpenNext) — main, assets, vars |
| `wrangler.toml` | Pages placeholder — `pages_build_output_dir = "./out"` (not used for current app) |

---

## Phase 5–7 — Build & Deploy Status

| Step | Status |
|------|--------|
| npm install | ⚠️ Peer dependency conflicts (use `--legacy-peer-deps` if needed) |
| next build | ✅ Succeeds |
| opennextjs-cloudflare build | ❌ Fails on Windows (esbuild alias error) |
| wrangler deploy | ⏸️ Blocked by build failure on Windows |
| wrangler pages deploy | ❌ Not applicable — app incompatible with static Pages |

---

## Phase 8 — Deployment URL

**Not deployed** — build fails on Windows. Use GitHub Actions or WSL to deploy.

---

## Phase 9 — Summary & Recommendations

### Summary
- **Project:** Next.js 15 full-stack e‑commerce
- **Cloudflare Pages (static):** Incompatible (API routes, SSR)
- **Cloudflare Workers (OpenNext):** Compatible, but build fails on Windows
- **Secrets:** Partially configured; complete with `npm run wrangler:secrets`

### Recommendations
1. Use **GitHub Actions** to build and deploy to Workers (see `.github/workflows/deploy-cloudflare.yml`).
2. Add all required secrets to GitHub and ensure Worker secrets are set.
3. For static-only deployment, you would need to remove API routes and migrate backend logic to Pages Functions or an external API — not recommended for this app.
