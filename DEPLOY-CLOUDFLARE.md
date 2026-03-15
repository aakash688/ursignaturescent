# Deploy to Cloudflare (correct setup)

OpenNext fails on **Windows** with esbuild errors (`Invalid alias name: "next/dist/compiled/..."`). Use one of the options below.

---

## Option 1: GitHub Actions (recommended)

Build and deploy on Linux in CI; no need to build on your PC.

### One-time setup

1. **Cloudflare API token**  
   - [Cloudflare Dashboard](https://dash.cloudflare.com/) → **My Profile** → **API Tokens** → **Create Token**  
   - Use template **Edit Cloudflare Workers** (or create custom with Account: Workers Scripts Edit, Workers KV Storage Edit if you use KV).  
   - Copy the token.

2. **GitHub repo secrets**  
   - Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**  
   - Add:

   | Secret name | Value |
   |-------------|--------|
   | `CLOUDFLARE_API_TOKEN` | The token from step 1 (required for deploy) |
   | `NEXT_PUBLIC_SUPABASE_URL` | Same as in `.env` (for build) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as in `.env` (for build) |
   | `NEXT_PUBLIC_R2_PUBLIC_URL` | Same as in `.env` (for build) |
   | `NEXT_PUBLIC_APP_URL` | Same as in `.env` (for build) |
   | `NEXT_PUBLIC_APP_NAME` | Same as in `.env` (for build) |

3. **Worker secrets (runtime)**  
   You already set these with `npm run wrangler:secrets` (e.g. `SUPABASE_SERVICE_ROLE_KEY`, etc.). They live on Cloudflare; CI does not need them.

### Deploy

- **Push to `main`** → workflow runs and deploys.  
- Or: **Actions** → **Deploy to Cloudflare** → **Run workflow**.

After a successful run, the site is at **https://ursignature.<your-subdomain>.workers.dev** (or your custom domain if you added one).

---

## Option 2: Build and deploy from WSL (Linux on Windows)

If you want to build and deploy from your machine:

1. Install [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install) and open a Ubuntu (or other) terminal.
2. In WSL:
   ```bash
   cd /mnt/c/Users/USER/Desktop/website/ursignature
   npm ci
   npm run deploy:cloudflare
   ```
3. When prompted, log in with `npx wrangler login` (once).

Build and deploy run on Linux, so the Windows esbuild alias error does not occur.

---

## What gets deployed

- **Product:** Cloudflare **Workers** (not Pages).  
- **URL:** `https://ursignature.<account>.workers.dev` unless you add a custom domain in the Cloudflare dashboard.  
- **Config:** `wrangler.jsonc` (vars) + secrets you set with `npm run wrangler:secrets`.  
- **Build:** OpenNext turns your Next.js app into a Worker + static assets; `wrangler deploy` uploads that.

---

## Troubleshooting

- **Build fails in CI with “invalid alias”**  
  The workflow runs on `ubuntu-latest`; that error is Windows-only. If you see it in CI, check that the job is using `runs-on: ubuntu-latest`.

- **Deploy fails: “No account id”**  
  In **wrangler.jsonc** you can add `"account_id": "<YOUR_CF_ACCOUNT_ID>"` (find it in Cloudflare Dashboard → Workers & Pages → overview).

- **Site 500 or missing data**  
  Ensure all runtime secrets are set: `npm run wrangler:secrets` (or set them manually). See `scripts/WRANGLER-SECRETS-GUIDE.md`.
