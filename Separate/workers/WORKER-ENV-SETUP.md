# Worker env setup (ursignature-api)

The Worker **does not** read the repo `.env` file. It uses:

1. **`wrangler.toml` [vars]** — non-secret config (URLs, names).
2. **`wrangler secret put`** — secrets (API keys, passwords). Run from **Separate/workers/** with **`--config wrangler.toml`** so the right Worker is updated.

---

## 1. Non-secret config (wrangler.toml [vars])

Edit `Separate/workers/wrangler.toml` and set the `[vars]` values (no quotes in TOML):

```toml
[vars]
SUPABASE_URL = "https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_URL = "https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJ..."
TELEGRAM_CHAT_ID = "-1002671616450"
# R2_BUCKET_NAME, NEXT_PUBLIC_R2_PUBLIC_URL, etc. — set if you use them
```

Use the same values as in your main `.env` (Supabase URL, anon key, Telegram chat ID). Do **not** put `SUPABASE_SERVICE_ROLE_KEY` or other secrets here.

---

## 2. Secrets (one-time, from Separate/workers)

Open PowerShell and run from **Separate/workers**:

```powershell
cd c:\Users\USER\Desktop\website\ursignature\Separate\workers
```

Then run for each secret (paste value when prompted, press Enter):

**Required for DB/admin routes:**

```powershell
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --config wrangler.toml
```

**Optional (payment, notifications, shipping):**

```powershell
npx wrangler secret put RAZORPAY_KEY_ID --config wrangler.toml
npx wrangler secret put RAZORPAY_KEY_SECRET --config wrangler.toml
npx wrangler secret put TELEGRAM_BOT_TOKEN --config wrangler.toml
npx wrangler secret put SHIPROCKET_EMAIL --config wrangler.toml
npx wrangler secret put SHIPROCKET_PASSWORD --config wrangler.toml
```

---

## 3. Redeploy after changing env

```powershell
npx wrangler deploy --config wrangler.toml
```

---

## 4. Check that env is set

- **Dashboard:** Cloudflare → Workers & Pages → ursignature-api → Settings → Variables and Secrets.
- **Local dev:** Put the same vars in `Separate/workers/.dev.vars` (one per line, no export) and run `npx wrangler dev --config wrangler.toml` so local Worker has env.

---

## Summary

| Type        | Where                         | Example                          |
|------------|--------------------------------|----------------------------------|
| Non-secret | wrangler.toml `[vars]`        | SUPABASE_URL, TELEGRAM_CHAT_ID   |
| Secret     | `wrangler secret put` / dashboard | SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_KEY_SECRET |

Always use **`--config wrangler.toml`** when running wrangler from the repo root so the **ursignature-api** Worker is targeted, not the monolith.
