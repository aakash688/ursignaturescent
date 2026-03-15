# CURSOR AGENT 08 — Admin Panel (Full)

## Your Role
Build the complete admin panel for URsignature. This is where everything is managed: products, orders, inventory, coupons, analytics, POS, and settings.

## Design: Dark admin theme matching storefront (noir bg, gold accents)

---

## Page 1: Admin Dashboard `src/app/(admin)/admin/page.tsx`

### Stats Row (Top)
Use `StatCard` component. Fetch from Supabase:
- **Today's Revenue**: Sum of orders.total where payment_status='paid' and date=today
- **Total Orders Today**: Count of confirmed+ orders today
- **Pending Orders**: Count of orders where status='pending' or 'confirmed' or 'processing'
- **Low Stock Items**: Count of variants where stock_quantity <= low_stock_threshold

### Charts Section
Use Recharts library:
- **Revenue Chart**: Line chart — last 30 days revenue
- **Orders Chart**: Bar chart — last 7 days order count by status

### Recent Orders Table
Latest 10 orders: order_number, customer, items, total, status badge, created_at, actions

### Low Stock Alerts Panel
Products with stock ≤ threshold: name, size, current stock, reorder CTA

---

## Page 2: Products Management

### `src/app/(admin)/admin/products/page.tsx`
```
Table: product image thumbnail, name, category, variants count, status toggle, created_at, actions (Edit, Delete)
Search bar (by name)
Filter: category, status, featured
"Add New Product" button → /admin/products/new
Bulk actions: activate, deactivate, delete
```

### `src/app/(admin)/admin/products/new/page.tsx` and `[id]/page.tsx`
Full product form:
```
Tab 1: Basic Info
- Product Name
- Slug (auto-generated, editable)
- Tagline
- Short Description (150 chars)
- Full Description (rich textarea)
- Inspired By (brand name)
- Category Type: Men / Women / Unisex
- Fragrance Profile
- Top Notes (tag input — add/remove)
- Heart Notes (tag input)
- Base Notes (tag input)
- Rating (1-5 stars clickable)
- Is Featured toggle
- Is Active toggle

Tab 2: Images
- ImageUploader component (from Agent 03)
- Up to 6 images
- First image = main image
- Drag to reorder

Tab 3: Variants & Pricing
- Dynamic list of variants
- Each variant: Size (ml input), Price (₹), Compare Price (₹), SKU (auto-gen if empty), Stock, Low Stock Threshold, Active toggle
- "Add Variant" button
- Delete variant button

Tab 4: Categories
- Multi-select checklist of all categories
- A product can be in multiple categories
- Show category hierarchy (parent > child)

Tab 5: SEO
- Meta Title
- Meta Description
- Preview of how it looks in Google search

Save button: validates, saves to Supabase, shows toast
```

---

## Page 3: Categories `src/app/(admin)/admin/categories/page.tsx`

```
Tree view showing parent/child categories
Each category:
- Name, slug, product count, status toggle
- Edit modal: name, slug, description, parent, banner image upload, sort order, active
- Delete (only if no products assigned)
Create new category button
```

---

## Page 4: Orders `src/app/(admin)/admin/orders/page.tsx`

```
Advanced orders table:
- Filters: status, payment status, date range, search by order number/email
- Columns: order number, customer name/email, items, total, payment status, order status, date, actions
- Status badges with colors
- Quick status update dropdown in each row
- Export to CSV button

Order Detail Page `/admin/orders/[id]`
- Full order info: customer, items with images, pricing breakdown
- Shipping address
- Status timeline
- Update status dropdown with note field
- Shiprocket tracking info + link
- Admin notes field
- "Resend Telegram notification" button
- Print invoice button
```

---

## Page 5: Inventory `src/app/(admin)/admin/inventory/page.tsx`

```
Table: product name, variant (size), current stock, low stock threshold, last updated
Inline editing: click stock number to edit
Bulk stock update
Stock adjustment form: variant, adjustment type (add/remove/set), quantity, note
Transaction history per variant: all stock movements with type, quantity, date, order ref
Low stock filter toggle
Export inventory to CSV
```

---

## Page 6: Coupons `src/app/(admin)/admin/coupons/page.tsx`

```
Table: code, type, value, min order, max discount, usage (used/limit), expires, status, actions

Create Coupon Form:
- Code (uppercase auto-format, generate random button)
- Type: Percentage (%) or Fixed (₹)
- Value
- Min Order Value
- Max Discount (for % type)
- Total Usage Limit
- Per User Limit
- Expiry Date picker
- Is Active toggle

Edit and deactivate existing coupons
Usage analytics: which orders used this coupon
```

---

## Page 7: POS System `src/app/(admin)/admin/pos/page.tsx`

Build a clean Point of Sale interface for offline sales:

```
Left Panel: Product Search & Selection
- Search products by name
- Show product cards with variants
- Click variant → add to sale
- Quantity controls

Right Panel: Current Sale
- List of items with qty and price
- Subtotal
- Discount input (manual ₹ or %)
- Coupon code input
- Total
- Customer info (optional): name, phone
- Payment method: Cash / UPI / Card
- Reference number (for UPI/Card)
- [Complete Sale] button

On Complete:
- Creates order in DB with is_pos=true
- Decrements inventory (via same trigger)
- Sends Telegram notification with [POS] tag
- Shows receipt modal
- Print receipt option (uses browser print or html2canvas/jsPDF)

Sales History:
- Tab showing today's POS sales
- Running total
```

---

## Page 8: Analytics Dashboard `src/app/(admin)/admin/analytics/page.tsx`

```
Date range picker: Today, Yesterday, Last 7 days, Last 30 days, Custom

KPI Cards:
- Revenue, Orders, Avg Order Value, Conversion Rate (orders/sessions)
- Returning customers vs new

Charts (Recharts):
- Revenue over time (line chart)
- Orders by status (pie chart)
- Top products by revenue (horizontal bar)
- Sales by hour of day (bar chart)

Tables:
- Top selling products
- Orders by category

Note: GA4 data via GA4 Data API (or show data from own analytics_events table as fallback)
```

---

## Page 9: Customers `src/app/(admin)/admin/customers/page.tsx`

```
Table: name, email, phone, total orders, total spent, last order date, joined date
Search by name/email
Click to see customer detail: all their orders, addresses
```

---

## Page 10: Settings `src/app/(admin)/admin/settings/page.tsx`

```
Sections:
1. Store Settings: name, email, announcement bar text
2. Shipping: free shipping threshold, default shipping charge
3. Inventory: global low stock threshold
4. Social Links: Instagram, WhatsApp
5. SEO Defaults: meta title, meta description
6. Telegram: test notification button
7. Admin Account: change password

All saved to Supabase `settings` table
```

---

## COMPLETION CRITERIA
- [ ] Dashboard with real-time stats and charts
- [ ] Full product CRUD with multi-category assignment
- [ ] Image upload in product form
- [ ] Category management with hierarchy
- [ ] Orders table with filters and status updates
- [ ] Order detail page with status timeline
- [ ] Inventory management with transaction history
- [ ] Full coupon management
- [ ] POS system with receipt generation
- [ ] Analytics with charts
- [ ] Settings page saving to DB
- [ ] All admin pages protected by middleware (admin role only)
