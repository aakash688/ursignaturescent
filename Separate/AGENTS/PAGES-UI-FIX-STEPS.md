# Fix UI Not Showing Properly on Cloudflare Pages

Follow these steps in order so the URsignature UI displays correctly and API calls work.

---

## What was fixed in the repo

1. **SPA routing** — Added `public/_redirects` with `/*    /index.html   200` so routes like `/products`, `/admin`, `/contact` serve the app instead of 404.
2. **Tailwind CSS** — Added Tailwind (v3), `tailwind.config.js`, `postcss.config.js`, and `@tailwind` directives in `src/index.css` so layout and utility classes (e.g. `max-w-4xl`, `flex`, `rounded`) apply.
3. **Build output** — The build now includes `_redirects` in `dist/` and a larger CSS bundle with Tailwind.

---

## Step-by-step process

### Step 1: Rebuild the Pages app (local)

From the project root:

```powershell
cd Separate\pages
npm run build
```

You should see no Tailwind “content missing” warning and `dist/_redirects` and `dist/assets/index-*.css` (larger than before) present.

---

### Step 2: Redeploy Pages to Cloudflare

From `Separate\pages`:

```powershell
npx wrangler pages deploy dist --project-name=ursignature-ui
```

Note the deployment URL (e.g. `https://xxxx.ursignature-ui.pages.dev`). The project URL is `https://ursignature-ui.pages.dev`.

---

### Step 3: Set the API URL for production (required for data)

The UI calls the Workers API. The API base URL is baked in at **build time** via `VITE_WORKERS_API_URL`.

**Option A — Cloudflare Pages dashboard (recommended)**

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **ursignature-ui**.
2. Go to **Settings** → **Environment variables**.
3. Add a **Variable**:
   - **Name:** `VITE_WORKERS_API_URL`
   - **Value:** `https://ursignature-api.ursignature.workers.dev`
   - Apply to **Production** (and Preview if you use it).
4. Trigger a **new deployment** so the next build uses this value:
   - **Deployments** → **Create deployment** and deploy from the same branch/build output,  
   **or** push a small change and let Pages build again.

**Option B — Build locally with env then deploy**

```powershell
cd Separate\pages
$env:VITE_WORKERS_API_URL="https://ursignature-api.ursignature.workers.dev"; npm run build
npx wrangler pages deploy dist --project-name=ursignature-ui
```

After this, the UI will load data from your deployed Worker.

---

### Step 4: Confirm Workers CORS (if you see blocklisted requests)

The Worker must allow the Pages origin. In `Separate/workers/src/index.ts` the CORS middleware should allow your Pages host, e.g.:

- `https://ursignature-ui.pages.dev`
- `https://*.ursignature-ui.pages.dev` (preview deployments)

If you added a custom domain for Pages, allow that too. If anything is blocked, add the origin to the Worker CORS config, then redeploy the Worker:

```powershell
cd Separate\workers
npx wrangler deploy --config wrangler.toml
```

---

### Step 5: Verify

1. Open **https://ursignature-ui.pages.dev** (or your deployment URL).
2. Home page should show with correct layout and styles (no unstyled Tailwind).
3. Go to **/products**, **/contact**, **/admin** — no 404; same app loads.
4. If `VITE_WORKERS_API_URL` is set and CORS is correct, storefront data (products, settings) and forms (newsletter, contact) should work.

---

## Summary checklist

| Step | Action |
|------|--------|
| 1 | `cd Separate\pages` → `npm run build` |
| 2 | `npx wrangler pages deploy dist --project-name=ursignature-ui` |
| 3 | Set `VITE_WORKERS_API_URL` in Pages env (dashboard or local build) and redeploy if needed |
| 4 | Ensure Worker CORS includes your Pages origin; redeploy Worker if you changed it |
| 5 | Open Pages URL and test home, /products, /contact, /admin |

---

## Optional: Worker secrets for full API behavior

For production, set Worker secrets so the API can talk to Supabase and other services:

```powershell
cd Separate\workers
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put SUPABASE_URL
# and any others (e.g. RAZORPAY_KEY_SECRET)
```

Then redeploy the Worker. The UI will work without these, but endpoints that need the database will return 500 until secrets are set.
