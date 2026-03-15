# Set Cloudflare Worker secrets (step-by-step)

**Option A – One-shot (recommended)**  
1. Put all secret values in `.env` or `.env.local` (same variable names as below).  
2. Run: `npm run wrangler:secrets`  
3. Every non-empty secret will be set on the Worker.

**Option B – Manual (one by one)**  
Run the commands below from the project root. When you see `Enter a secret value`, paste the value and press Enter.

---

## 1. Open terminal in project folder

```powershell
cd C:\Users\USER\Desktop\website\ursignature
```

---

## 2. Set each secret

**Supabase (required)**  
```powershell
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```
→ Paste your `SUPABASE_SERVICE_ROLE_KEY` value, press Enter.

---

**Razorpay** (skip if you don’t use yet)  
```powershell
npx wrangler secret put RAZORPAY_KEY_ID
```
```powershell
npx wrangler secret put RAZORPAY_KEY_SECRET
```
```powershell
npx wrangler secret put NEXT_PUBLIC_RAZORPAY_KEY_ID
```

---

**Cloudflare R2** (skip if you don’t use yet)  
```powershell
npx wrangler secret put R2_ACCOUNT_ID
```
```powershell
npx wrangler secret put R2_ACCESS_KEY_ID
```
```powershell
npx wrangler secret put R2_SECRET_ACCESS_KEY
```

---

**Telegram**  
```powershell
npx wrangler secret put TELEGRAM_BOT_TOKEN
```

---

**Shiprocket**  
```powershell
npx wrangler secret put SHIPROCKET_PASSWORD
```

---

**App**  
```powershell
npx wrangler secret put CRON_SECRET
```
→ Use a long random string (e.g. 32+ characters). You already have one in `.env`.

---

## 3. Check what’s set

```powershell
npx wrangler secret list
```

You should see all the names you added (values are never shown).

---

## 4. Non-secret vars

These are already in `wrangler.jsonc` under `vars` (no need to set as secrets):

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

---

## 5. Deploy

After secrets are set:

```powershell
npm run deploy:cloudflare
```
