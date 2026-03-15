# R2 storage and image mapping

## 1. Create R2 bucket (Wrangler)

Ensure you're logged in and have a Cloudflare account:

```bash
npx wrangler login
npm run r2:bucket
```

Or manually:

```bash
npx wrangler r2 bucket create ursignature-media
```

## 2. Get R2 credentials

In [Cloudflare Dashboard](https://dash.cloudflare.com) → R2 → Manage R2 API Tokens, create an API token with **Object Read & Write** for the bucket. Set in `.env.local`:

- `R2_ACCOUNT_ID` — from dashboard URL or Overview
- `R2_ACCESS_KEY_ID` — from the API token
- `R2_SECRET_ACCESS_KEY` — from the API token
- `R2_BUCKET_NAME=ursignature-media`
- `NEXT_PUBLIC_R2_PUBLIC_URL` — public URL for the bucket (e.g. custom domain or R2 dev URL)

## 3. Run migration

Apply `supabase/migrations/006_product_images.sql` in the Supabase SQL Editor (or via CLI). This creates the `product_images` table and backfills from existing `products.images`.

## 4. Upload images to R2 and map in DB

From project root:

```bash
npm run r2:upload
```

Or with Node 20+ env file:

```bash
node --env-file=.env.local scripts/upload-images-to-r2.mjs
```

This script:

- Uploads **logo**: `public/logo.png` → R2 `logo/logo.png`, saves URL in `settings.site_logo_url`
- Uploads **product images**: all files like `public/images/products/{slug}-1.png`, `{slug}-2.png`, … (any number) → R2 **folder per perfume** `products/{slug}/1.png`, `products/{slug}/2.png`, …; inserts/updates `product_images`; the **first image is primary** (`is_primary = true`)
- Syncs `products.images` array from `product_images` (primary first) for backward compatibility

## 5. Multiple images per product and primary image

- **DB**: `product_images` has `url`, `sort_order`, `is_primary`. Only one row per product should have `is_primary = true`.
- **App**: Product fetches include `product_images`; `@/lib/product-images` builds the `images` array with the primary image first, then others by `sort_order`. The storefront uses `product.images[0]` as the main image.
- **Adding more images**: Add files like `bloom-kiss-2.png`, `bloom-kiss-3.png` in `public/images/products/`, then run `npm run r2:upload` again; all images are uploaded and the first is set primary.
- **Set primary from admin**: Call `PATCH /api/admin/product-images/[id]/primary` (admin auth required) to set that image as primary. Use in the admin panel to choose which image is primary without re-uploading.
- **Admin (legacy)**: When you build the admin panel, you can reorder images and set any image as primary by updating `product_images` (set the chosen row’s `is_primary = true` and others to `false` for that product).
