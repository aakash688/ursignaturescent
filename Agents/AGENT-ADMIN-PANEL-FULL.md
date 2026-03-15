# 🔐 CURSOR AGENT — Complete Admin Panel (End-to-End)

**Purpose:** Build the full URsignature admin panel from scratch. Run this agent in Cursor Composer (Agent mode) after the storefront and auth are in place.

**Scope:** Admin login, dashboard, products (add/edit with R2 images), categories, orders, inventory, coupons, customers, POS, analytics, settings, contacts, reviews — and **full R2 bucket integration** for product images (upload, multiple per product, set primary).

**Prerequisites:**
- Middleware protects `/admin/*` (admin role only); redirects to `/login?redirect=/admin` if not logged in, `/?unauthorized=true` if not admin.
- R2 bucket is set up; env: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `NEXT_PUBLIC_R2_PUBLIC_URL`.
- Use `createAdminClient()` from `@/lib/supabase/server` for admin data. Types in `@/types`. Reuse `@/components/ui` (Button, Input, Card, Badge, Skeleton). Use `formatPrice` from `@/lib/utils`.

**Mandate:** Execute every phase. Fix build/type errors automatically. Run `npm run build` after each major phase. Do not stop unless a credential is missing.

---

## IDENTITY

You are a senior full-stack engineer. You will:
1. Create all admin routes under `src/app/(admin)/`
2. Create admin-only components in `src/components/admin/`
3. Create/admin API routes under `src/app/api/admin/` (each admin API must verify `profile.role === 'admin'`; middleware does not run on `/api/*`)
4. Use the existing design system: noir background, gold accents, DM Sans/Cormorant, denser UI than storefront

---

## PHASE A0: ADMIN LOGIN & SCAFFOLD

### A0.1 — Admin login flow

- **Existing:** `src/middleware.ts` already checks `/admin` and `/admin/*`: no user → redirect to `/login?redirect=/admin`; user exists but `profile.role !== 'admin'` → redirect to `/?unauthorized=true`.
- **Login page:** Use existing `/login`; after sign-in, redirect to `redirect` query param or `/admin`. No new login page needed.
- **Promoting a user to admin:** In Supabase SQL Editor run: `UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';` (document this in README or settings page).
- **Sign out:** In admin sidebar use `signOut()` from `@/app/auth/actions` and `redirect('/')`.

### A0.2 — Directory structure

Create (PowerShell on Windows):

```powershell
$dirs = @(
  "src/app/(admin)/admin", "src/app/(admin)/admin/products/new", "src/app/(admin)/admin/products/[id]",
  "src/app/(admin)/admin/categories", "src/app/(admin)/admin/orders", "src/app/(admin)/admin/orders/[id]",
  "src/app/(admin)/admin/inventory", "src/app/(admin)/admin/coupons", "src/app/(admin)/admin/customers",
  "src/app/(admin)/admin/analytics", "src/app/(admin)/admin/pos", "src/app/(admin)/admin/settings",
  "src/app/(admin)/admin/contacts", "src/app/(admin)/admin/reviews", "src/components/admin",
  "src/app/api/admin/products", "src/app/api/admin/products/[id]", "src/app/api/admin/orders",
  "src/app/api/admin/orders/[id]", "src/app/api/admin/inventory", "src/app/api/admin/coupons",
  "src/app/api/admin/coupons/[id]", "src/app/api/admin/categories", "src/app/api/admin/categories/[id]",
  "src/app/api/admin/settings", "src/app/api/admin/contacts", "src/app/api/admin/reviews",
  "src/app/api/admin/pos/complete", "src/app/api/admin/upload", "src/app/api/admin/product-images/[id]/primary"
)
$dirs | ForEach-Object { New-Item -ItemType Directory -Force -Path $_ }
```

### A0.3 — Admin layout and sidebar

- **`src/app/(admin)/layout.tsx`**: Full-height dark layout (`bg-noir`, `min-h-screen`). Left sidebar (fixed ~240px): logo "URsignature Admin", nav links (Dashboard, Products, Add Product, Categories, Orders, Inventory, Coupons, Customers, POS, Analytics, Settings, Contacts, Reviews). Main area: `flex-1 overflow-auto` with padding. Footer: current user email, Sign out (server action from `@/app/auth/actions`).
- **`src/components/admin/AdminSidebar.tsx`** (client): Receives `currentPath`; renders `Link` for each nav item; active path: gold left border + gold text; others: smoke text. Sign out: button that calls `signOut()` then `router.push('/')` or use form with server action.

Print: `✅ PHASE A0 COMPLETE — Admin login flow and scaffold`

---

## PHASE A1: R2 BUCKET INTEGRATION (IMAGES)

### A1.1 — Product images model

- **Table:** `product_images` (id, product_id, url, sort_order, is_primary). One primary per product. URLs point to R2; folder per product: `products/{slug}/1.png`, `2.png`, …
- **Helper:** `@/lib/product-images` exports `mapProductImages`, `mapProductImagesList` to build `product.images` array (primary first) from `product_images`. Use when returning products to storefront.
- **Set primary API (existing):** `PATCH /api/admin/product-images/[id]/primary` — verify admin, then set that row `is_primary = true` and others for same product `false`.

### A1.2 — Upload API for admin

**`src/app/api/admin/upload/route.ts`** (POST, admin-only):
- Verify user is admin (get user from `createClient()`, then `profiles.role === 'admin'`).
- Body: `FormData` with `file` (File) and optional `productId`, `slug` (for naming). Or use JSON with base64 (less ideal). Prefer multipart form.
- Use `uploadToR2` from `@/lib/r2`. Key format: `products/{slug}/{timestamp}-{sanitized-name}.{ext}` for product images, or `misc/{timestamp}-{name}` for other.
- Return `{ url }` (full public URL).

**Optional presigned URL flow:** Alternatively expose `POST /api/admin/upload/presigned` that returns `{ url, key }` using `getPresignedUploadUrl` from `@/lib/r2`; client uploads to that URL, then client or server saves the final URL to `product_images`. For simplicity, server-side upload (read file from FormData, call `uploadToR2`) is fine.

### A1.3 — Product images API (CRUD for product_images)

**`src/app/api/admin/products/[id]/images/route.ts`**:
- **GET**: List `product_images` for product `[id]` (admin only). Return array ordered by sort_order, is_primary first.
- **POST**: Body `{ url, sort_order?, is_primary? }`. Insert into `product_images`. If `is_primary` true, set others to false. Admin only.
- **PATCH**: Body `{ id (product_image id), sort_order?, is_primary? }`. Update row; if is_primary true, unset others. Admin only.
- **DELETE**: Body `{ id }` or query `?id=`. Delete that product_image row. Admin only.

Print: `✅ PHASE A1 COMPLETE — R2 integration and product images API`

---

## PHASE A2: DASHBOARD

- **`src/components/admin/StatCard.tsx`**: Props `title`, `value`, `subtitle?`, `icon?`. Dark card, value in gold/ivory.
- **`src/app/(admin)/admin/page.tsx`**: Fetch with createAdminClient(): today’s revenue (sum orders.total where payment_status='paid' and date=today), orders today count, pending orders count, low stock count. Render 4 StatCards. Section "Recent Orders" (last 10, table with order_number, customer, total, status, date, link to detail). Section "Low Stock Alerts" (variants where stock_quantity <= low_stock_threshold, product name, size, stock).
- **`src/app/(admin)/admin/loading.tsx`**: Skeleton matching dashboard.

Print: `✅ PHASE A2 COMPLETE — Dashboard`

---

## PHASE A3: PRODUCTS LIST AND CRUD APIs

**`src/app/api/admin/products/route.ts`** (admin-only):
- **GET**: Query `q`, `category`, `status`, `page`, `limit`. List products with `product_variants`, `product_images` (or join to build images array). Return `{ data, count, page, total_pages }`.
- **POST**: Body: product fields (name, slug, tagline, description, short_description, inspired_by, category_type, fragrance_profile, top_notes, heart_notes, base_notes, rating, is_featured, is_active, meta_title, meta_description, sort_order) + `variants[]` + `category_ids[]`. Insert product, then variants, then product_categories. Optionally accept `image_urls[]` and insert into `product_images` (first = primary). Return created product.

**`src/app/api/admin/products/[id]/route.ts`** (admin-only):
- **GET**: Single product with variants, product_categories, product_images. Return 404 if not found.
- **PUT**: Same body as POST. Update product; sync variants (upsert by id, delete removed); sync product_categories; optionally sync product_images (replace set or add/remove). Return updated product.
- **DELETE**: Delete product (cascades to variants, product_categories, product_images). Return 204.

**`src/app/(admin)/admin/products/page.tsx`**: Table: thumbnail (first product image or placeholder), name, category_type, variants count, is_featured, is_active, created_at, actions (Edit, Delete with confirm). Search, filter by category/status. "Add Product" → `/admin/products/new`.

Print: `✅ PHASE A3 COMPLETE — Products API and list`

---

## PHASE A4: PRODUCT NEW / EDIT (WITH R2 IMAGES)

### A4.1 — Product form

**`src/components/admin/ProductForm.tsx`** (client):
- **Tabs:** Basic Info | Images | Variants & Pricing | Categories | SEO.
- **Basic Info:** name, slug (auto from name via slugify), tagline, short_description, description, inspired_by, category_type (select), fragrance_profile, top_notes / heart_notes / base_notes (tag inputs), rating (1–5), is_featured, is_active.
- **Images (R2):**
  - Show list of current images (from `product_images`: url, sort_order, is_primary). Display thumbnails.
  - "Upload" button: file input → POST to `/api/admin/upload` with productId/slug → get back `url` → add to list (or POST to `/api/admin/products/[id]/images` with url).
  - Drag to reorder (update sort_order via PATCH).
  - "Set as primary" button per image → `PATCH /api/admin/product-images/[id]/primary`.
  - Remove image: DELETE from product_images API. Optionally delete from R2 via `deleteFromR2(url)` in API if you expose a delete-image route.
  - New product: uploads go to `/api/admin/upload`; store URLs in state and submit with product create (then in POST products API insert into product_images).
- **Variants:** Array of { size_ml, price, compare_at_price, sku, stock_quantity, low_stock_threshold, is_active }. Add/remove rows. SKU auto `URS-{slug}-{size}` if empty.
- **Categories:** Fetch categories, multi-select checkboxes; submit as category_ids.
- **SEO:** meta_title, meta_description.
- Submit: POST (new) or PUT (edit). On success: toast, redirect to `/admin/products` or to edit page.

### A4.2 — Pages

- **`src/app/(admin)/admin/products/new/page.tsx`**: ProductForm mode="create".
- **`src/app/(admin)/admin/products/[id]/page.tsx`**: Fetch product (with product_images), render ProductForm mode="edit" with initialData.

Print: `✅ PHASE A4 COMPLETE — Product add/edit with R2 images`

---

## PHASE A5: CATEGORIES

**`src/app/api/admin/categories/route.ts`** (admin-only):
- **GET**: List all categories with product count (subquery or join).
- **POST**: Create (name, slug, description, parent_id, sort_order, is_active, banner_image).

**`src/app/api/admin/categories/[id]/route.ts`** (admin-only):
- **PUT**: Update same fields.
- **DELETE**: Delete only if no product_categories reference it; else 400.

**`src/app/(admin)/admin/categories/page.tsx`**: Table/tree: name, slug, product count, is_active, sort_order, actions (Edit, Delete). Add category (modal/inline). Edit modal/slide-over. Banner image: optional upload via R2 (reuse upload API, store URL in category).

Print: `✅ PHASE A5 COMPLETE — Categories`

---

## PHASE A6: ORDERS

**`src/app/api/admin/orders/route.ts`** (admin-only): GET with filters (status, payment_status, from, to, q). Paginate. Return orders with order_items.

**`src/app/api/admin/orders/[id]/route.ts`** (admin-only): GET single order with items. PATCH body `{ status?, admin_notes? }`; if status changed, insert order_status_history.

**`src/app/(admin)/admin/orders/page.tsx`**: Table: order_number, customer, items count, total, payment_status, status, date, link to detail. Filters, export CSV.

**`src/app/(admin)/admin/orders/[id]/page.tsx`**: Full order: customer, shipping address, items (image, name, size, qty, price), subtotal, discount, shipping, total. Status dropdown (PATCH). Admin notes. Optional: Resend Telegram, Print invoice.

Print: `✅ PHASE A6 COMPLETE — Orders`

---

## PHASE A7: INVENTORY

**`src/app/api/admin/inventory/route.ts`** (admin-only):
- **GET**: List variants with product name, size_ml, sku, stock_quantity, low_stock_threshold. Filter low_stock_only, product_id.
- **POST** or **PATCH** body `{ variant_id, type: 'restock'|'adjustment', quantity_change, note }`: Update variant stock, insert inventory_transaction.

**`src/app/(admin)/admin/inventory/page.tsx`**: Table: product name, variant (size), SKU, current stock, low_stock_threshold. Inline edit stock → call adjust API. Toggle "Low stock only". Optional: transaction history per variant (fetch from inventory_transactions).

Print: `✅ PHASE A7 COMPLETE — Inventory`

---

## PHASE A8: COUPONS

**`src/app/api/admin/coupons/route.ts`** (admin-only):
- **GET**: List coupons (code, type, value, min_order_value, max_discount, used_count, usage_limit, per_user_limit, expires_at, is_active).
- **POST**: Create (code, type, value, min_order_value, max_discount, usage_limit, per_user_limit, expires_at, is_active). Code uppercase; validate.

**`src/app/api/admin/coupons/[id]/route.ts`** (admin-only): GET one, PUT update, DELETE or deactivate.

**`src/app/(admin)/admin/coupons/page.tsx`**: Table: code, type, value, min order, max discount, used/limit, expires, is_active, actions. "Create Coupon" modal: all fields, "Generate code" button (random 8-char alphanumeric). Edit/Deactivate.

Print: `✅ PHASE A8 COMPLETE — Coupons`

---

## PHASE A9: CUSTOMERS

**`src/app/api/admin/customers/route.ts`** (admin-only): GET list profiles with optional search; join orders for order_count, total_spent, last_order_at.

**`src/app/(admin)/admin/customers/page.tsx`**: Table: name, email, phone, order count, total spent, last order. Row click or "View" → detail (user’s orders list or link to orders filtered by user_id).

Print: `✅ PHASE A9 COMPLETE — Customers`

---

## PHASE A10: POS

**`src/app/(admin)/admin/pos/page.tsx`** (client):
- Left: Product search (from API), product cards with variants; click variant to add to current sale (qty).
- Right: Sale list (product, variant, qty, price, remove). Subtotal. Discount input. Coupon input (validate via `/api/coupons/validate`). Total. Customer name/phone (optional). Payment: Cash / UPI / Card. Reference for UPI/Card. "Complete Sale" button.
- On Complete: POST **`/api/admin/pos/complete`** with items, customer, payment. API creates order (is_pos=true, payment_status=paid), decrements stock (reuse existing order/trigger or explicit update), sends Telegram with [POS] tag. Return order. Show success + receipt (printable div). Clear sale state.

**`src/app/api/admin/pos/complete/route.ts`** (admin-only): Accept items (variant_id, quantity), customer name/phone, payment method/reference. Create order + order_items, set payment_status=paid, decrement variant stock (or rely on DB trigger), optional Telegram. Return order.

Print: `✅ PHASE A10 COMPLETE — POS`

---

## PHASE A11: ANALYTICS

**`src/app/(admin)/admin/analytics/page.tsx`**: Date range (Today, 7d, 30d). KPI cards: Revenue, Orders, AOV. Recharts: revenue over time, orders by status (pie). Data from orders table via createAdminClient().

Print: `✅ PHASE A11 COMPLETE — Analytics`

---

## PHASE A12: SETTINGS

**`src/app/api/admin/settings/route.ts`** (admin-only): GET all settings as key-value; PUT body `{ key: value, ... }` upsert.

**`src/app/(admin)/admin/settings/page.tsx`**: Sections: Store (store_name, store_email, announcement_bar), Shipping (free_shipping_threshold, default_shipping_charge), Inventory (low_stock_threshold), Social (instagram_url, whatsapp_number), SEO (meta_title, meta_description). Load GET, save PUT. "Test Telegram" button (call backend that sends test message).

Print: `✅ PHASE A12 COMPLETE — Settings`

---

## PHASE A13: CONTACTS & REVIEWS

- **Contacts:** If table `contact_messages` exists: GET API, admin page table (name, email, subject, message, date). Mark read optional.
- **Reviews:** GET reviews with product name; PATCH is_approved. Admin page table with Approve/Reject.

Print: `✅ PHASE A13 COMPLETE — Contacts & Reviews`

---

## PHASE A14: BUILD AND FIX

Run `npm run build`. Fix errors (use client, types, imports). Re-run until pass (max 15 iterations).

Print:
```
✅ ADMIN PANEL BUILD COMPLETE
   Routes: /admin, /admin/products, /admin/products/new, /admin/products/[id],
           /admin/categories, /admin/orders, /admin/orders/[id], /admin/inventory,
           /admin/coupons, /admin/customers, /admin/pos, /admin/analytics,
           /admin/settings, /admin/contacts, /admin/reviews
   APIs: products, products/[id]/images, upload, product-images/[id]/primary,
         orders, inventory, coupons, categories, settings, customers, pos/complete, contacts, reviews
   R2: Product images in products/{slug}/; multiple per product; set primary via API.
   Admin: Promote user in Supabase: UPDATE profiles SET role = 'admin' WHERE email = '...';
```

---

## ERROR RECOVERY

- Module not found → fix path or add file.
- Type error → use `@/types` or assertion.
- 'use client' → add for hooks/browser APIs.
- API 401/403 → verify admin in each `/api/admin/*` route (get user + profile.role).

---

## REFERENCE

- **Auth:** `/login`; middleware protects `/admin` (redirect to login or unauthorized). Sign out: `signOut()` from `@/app/auth/actions`.
- **Supabase:** `createAdminClient()` in `@/lib/supabase/server`. Tables: products, product_variants, product_images, categories, product_categories, orders, order_items, order_status_history, coupons, coupon_usages, profiles, addresses, inventory_transactions, settings, reviews, analytics_events, newsletter_subscribers, contact_messages.
- **R2:** `@/lib/r2`: `uploadToR2(key, buffer, contentType)`, `deleteFromR2(url)`, `getPresignedUploadUrl`, `buildR2Key`. Env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, NEXT_PUBLIC_R2_PUBLIC_URL. Product images: folder per product `products/{slug}/...`.
- **Types:** `Product`, `ProductVariant`, `ProductImage`, `Category`, `Order`, `OrderItem`, `Coupon`, `ShippingAddress`, `InventoryTransaction`, `Profile` in `@/types`.
- **UI:** Button, Input, Card, Badge, Skeleton, formatPrice from `@/lib/utils`.

Do not duplicate auth or layout; only add admin-specific layout and pages.
