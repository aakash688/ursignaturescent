  # 🧩 URsignature — SOURCE CODE AGENT
# This is called automatically by the Master Agent in Phase 5.
# Can also be run standalone if only code generation is needed.

---

## OPERATING INSTRUCTIONS
You are writing production-quality code for a luxury perfume e-commerce store. Write COMPLETE files — no placeholders, no "TODO: implement this", no "// add logic here". Every function must be fully implemented.

If a file would be too large, split it into smaller focused files. But every file you create must be 100% functional.

---

## FILE: src/types/index.ts

```typescript
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'customer' | 'admin'
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  is_default: boolean
  name: string
  phone: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  pincode: string
  country: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  banner_image: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  product_count?: number
}

export interface Product {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  short_description: string | null
  inspired_by: string | null
  category_type: 'men' | 'women' | 'unisex'
  fragrance_profile: string | null
  top_notes: string[]
  heart_notes: string[]
  base_notes: string[]
  rating: number
  images: string[]
  is_featured: boolean
  is_active: boolean
  meta_title: string | null
  meta_description: string | null
  sort_order: number
  created_at: string
  updated_at: string
  variants?: ProductVariant[]
  categories?: Category[]
}

export interface ProductVariant {
  id: string
  product_id: string
  size_ml: number
  price: number
  compare_at_price: number | null
  sku: string
  stock_quantity: number
  low_stock_threshold: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CartItem {
  product_id: string
  variant_id: string
  name: string
  slug: string
  image: string
  size_ml: number
  price: number
  compare_at_price: number | null
  quantity: number
  max_quantity: number
}

export interface ShippingAddress {
  name: string
  phone: string
  email: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  product_name: string
  product_image: string | null
  size_ml: number
  quantity: number
  unit_price: number
  total_price: number
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  guest_email: string | null
  guest_phone: string | null
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: string
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  subtotal: number
  discount: number
  shipping_charge: number
  total: number
  coupon_code: string | null
  coupon_id: string | null
  shipping_address: ShippingAddress
  shiprocket_order_id: string | null
  tracking_number: string | null
  tracking_url: string | null
  courier_name: string | null
  notes: string | null
  is_pos: boolean
  admin_notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order_value: number | null
  max_discount: number | null
  usage_limit: number | null
  used_count: number
  per_user_limit: number | null
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export interface Settings {
  [key: string]: string
}

export interface InventoryTransaction {
  id: string
  variant_id: string
  type: 'sale' | 'restock' | 'adjustment' | 'pos_sale' | 'return'
  quantity_change: number
  quantity_after: number
  order_id: string | null
  note: string | null
  created_by: string | null
  created_at: string
}

export interface AnalyticsEvent {
  event_type: string
  session_id?: string
  user_id?: string
  product_id?: string
  order_id?: string
  metadata?: Record<string, unknown>
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

// Checkout
export interface CheckoutState {
  step: 1 | 2 | 3
  address: Partial<ShippingAddress>
  couponCode: string
  appliedCoupon: { id: string; code: string; type: string; value: number } | null
  discount: number
  shippingCharge: number
}
```

---

## FILE: src/lib/supabase/client.ts

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## FILE: src/lib/supabase/server.ts

```typescript
import { createServerClient } from '@supabase/ssr'
import { createClient as createSBClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component — can't set cookies
          }
        },
      },
    }
  )
}

// Admin client with service role — bypasses RLS
export function createAdminClient() {
  return createSBClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

---

## FILE: src/middleware.ts

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${request.nextUrl.pathname}`, request.url)
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/?unauthorized=true', request.url))
    }
  }

  // Protect account routes
  if (request.nextUrl.pathname.startsWith('/account')) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${request.nextUrl.pathname}`, request.url)
      )
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
}
```

---

## FILE: src/lib/r2.ts

```typescript
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import sharp from 'sharp'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export const BUCKET = process.env.R2_BUCKET_NAME || 'ursignature-media'
export const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://media.ursignature.com'

export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await R2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )
  return `${PUBLIC_URL}/${key}`
}

export async function deleteFromR2(url: string): Promise<void> {
  const key = url.replace(`${PUBLIC_URL}/`, '')
  await R2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  return getSignedUrl(
    R2,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn }
  )
}

export function buildR2Key(folder: string, filename: string): string {
  const timestamp = Date.now()
  const base = filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .slice(0, 40)
  return `${folder}/${timestamp}-${base}.webp`
}

export async function optimizeAndUpload(
  buffer: Buffer,
  folder: string,
  originalName: string
): Promise<string> {
  const optimized = await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()

  const key = buildR2Key(folder, originalName)
  return uploadToR2(key, optimized, 'image/webp')
}
```

---

## FILE: src/lib/razorpay.ts

```typescript
import Razorpay from 'razorpay'
import crypto from 'crypto'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function createRazorpayOrder(amount: number, receipt: string) {
  return razorpay.orders.create({
    amount: Math.round(amount * 100), // Convert to paise
    currency: 'INR',
    receipt,
    notes: { store: 'URsignature', website: 'ursignature.com' },
  })
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = `${orderId}|${paymentId}`
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}
```

---

## FILE: src/lib/shiprocket.ts

```typescript
let cachedToken: string | null = null
let tokenExpiry: number = 0

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  })

  if (!res.ok) throw new Error('Shiprocket auth failed')
  const data = await res.json()
  cachedToken = data.token
  tokenExpiry = Date.now() + 8 * 24 * 60 * 60 * 1000
  return cachedToken!
}

export async function createShiprocketOrder(order: {
  order_number: string
  created_at: string
  shipping_address: Record<string, string>
  order_items: Array<{ product_name: string; variant_id: string; size_ml: number; quantity: number; unit_price: number }>
  subtotal: number
  guest_email?: string | null
}) {
  const token = await getToken()
  const addr = order.shipping_address

  const payload = {
    order_id: order.order_number,
    order_date: new Date(order.created_at).toISOString().split('T')[0],
    pickup_location: 'Primary',
    billing_customer_name: addr.name,
    billing_address: addr.address_line1,
    billing_address_2: addr.address_line2 || '',
    billing_city: addr.city,
    billing_pincode: addr.pincode,
    billing_state: addr.state,
    billing_country: 'India',
    billing_email: addr.email || order.guest_email || 'customer@ursignature.com',
    billing_phone: addr.phone,
    shipping_is_billing: true,
    order_items: order.order_items.map(item => ({
      name: `${item.product_name} ${item.size_ml}ml`,
      sku: item.variant_id,
      units: item.quantity,
      selling_price: item.unit_price,
    })),
    payment_method: 'Prepaid',
    sub_total: order.subtotal,
    length: 10,
    breadth: 10,
    height: 15,
    weight: 0.3,
  }

  const res = await fetch(
    'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  )

  return res.json()
}

export async function trackOrder(shipmentId: string) {
  const token = await getToken()
  const res = await fetch(
    `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return res.json()
}
```

---

## FILE: src/lib/telegram.ts

```typescript
const API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function sendTelegramMessage(
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<void> {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return

  try {
    await fetch(`${API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: parseMode,
      }),
    })
  } catch (err) {
    console.error('Telegram send failed:', err)
  }
}

export async function sendOrderAlert(order: {
  order_number: string
  is_pos?: boolean
  shipping_address: Record<string, string>
  guest_email?: string | null
  subtotal: number
  discount: number
  shipping_charge: number
  total: number
  created_at: string
  order_items?: Array<{ product_name: string; size_ml: number; quantity: number; total_price: number }>
}) {
  const addr = order.shipping_address
  const tag = order.is_pos ? '🏪 <b>POS SALE</b>' : '🛒 <b>NEW ORDER</b>'

  const items = order.order_items
    ?.map(i => `  • ${i.product_name} ${i.size_ml}ml × ${i.quantity} = ₹${i.total_price}`)
    .join('\n') ?? ''

  const text = `${tag}

🔖 <b>Order:</b> ${order.order_number}
👤 <b>Customer:</b> ${addr.name}
📞 ${addr.phone}
📧 ${addr.email || order.guest_email || 'Guest'}

📦 <b>Items:</b>
${items}

💰 Subtotal: ₹${order.subtotal}${order.discount > 0 ? `\n🏷️ Discount: -₹${order.discount}` : ''}
🚚 Shipping: ₹${order.shipping_charge}
✅ <b>Total: ₹${order.total}</b>

📍 ${addr.city}, ${addr.state} ${addr.pincode}
⏰ ${new Date(order.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`

  await sendTelegramMessage(text)
}

export async function sendLowStockAlert(
  productName: string,
  sizeMl: number,
  currentStock: number
) {
  await sendTelegramMessage(`⚠️ <b>LOW STOCK ALERT</b>

🧴 <b>${productName}</b> (${sizeMl}ml)
📉 Only <b>${currentStock} units</b> remaining

Please restock soon!`)
}

export async function sendDailyReport(stats: {
  revenue: number
  orders: number
  newCustomers: number
  sessions: number
  pendingOrders: number
  lowStockCount: number
  topProduct: string
  conversionRate: string
}) {
  const date = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })

  await sendTelegramMessage(`📊 <b>URsignature Daily Report</b>
📅 ${date}

💰 Revenue: <b>₹${stats.revenue.toLocaleString('en-IN')}</b>
📦 Orders: <b>${stats.orders}</b>
🆕 New Customers: <b>${stats.newCustomers}</b>
👁️ Sessions: <b>${stats.sessions}</b>
📈 Conversion: <b>${stats.conversionRate}%</b>

🏆 Top Product: ${stats.topProduct}
⏳ Pending Orders: ${stats.pendingOrders}
⚠️ Low Stock Items: ${stats.lowStockCount}

<i>Auto-report | URsignature</i>`)
}
```

---

## FILE: src/lib/analytics.ts

```typescript
'use client'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    fbq: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  // GA4
  if (window.gtag) {
    window.gtag('event', event, params)
  }

  // Meta Pixel
  if (window.fbq) {
    const metaEvent = META_EVENT_MAP[event]
    if (metaEvent) {
      window.fbq('track', metaEvent, params)
    }
  }
}

const META_EVENT_MAP: Record<string, string> = {
  purchase: 'Purchase',
  add_to_cart: 'AddToCart',
  begin_checkout: 'InitiateCheckout',
  view_item: 'ViewContent',
  sign_up: 'CompleteRegistration',
  search: 'Search',
  add_to_wishlist: 'AddToWishlist',
}

export function trackPageView(url?: string) {
  if (typeof window === 'undefined') return
  const path = url || window.location.pathname

  if (window.gtag && process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID, {
      page_path: path,
    })
  }

  if (window.fbq) {
    window.fbq('track', 'PageView')
  }
}

export function trackProductView(product: {
  id: string
  name: string
  category_type: string
  price?: number
}) {
  trackEvent('view_item', {
    currency: 'INR',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category_type,
        price: product.price,
      },
    ],
  })
}

export function trackAddToCart(item: {
  product_id: string
  name: string
  price: number
  quantity: number
  size_ml: number
}) {
  trackEvent('add_to_cart', {
    currency: 'INR',
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.product_id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
        item_variant: `${item.size_ml}ml`,
      },
    ],
  })
}

export function trackPurchase(order: {
  orderNumber: string
  total: number
  subtotal: number
  couponCode?: string | null
  items: Array<{ product_id: string; name: string; price: number; quantity: number }>
}) {
  trackEvent('purchase', {
    transaction_id: order.orderNumber,
    value: order.total,
    currency: 'INR',
    coupon: order.couponCode || undefined,
    items: order.items.map(i => ({
      item_id: i.product_id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  })
}

export function trackBeginCheckout(value: number, itemCount: number) {
  trackEvent('begin_checkout', { currency: 'INR', value, num_items: itemCount })
}
```

---

## FILE: src/stores/cart.ts

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  readonly subtotal: number
  readonly itemCount: number
  readonly isEmpty: boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.variant_id === item.variant_id)
          if (existing) {
            const newQty = Math.min(
              existing.quantity + item.quantity,
              item.max_quantity
            )
            return {
              items: state.items.map((i) =>
                i.variant_id === item.variant_id ? { ...i, quantity: newQty } : i
              ),
              isOpen: true,
            }
          }
          return { items: [...state.items, item], isOpen: true }
        })
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variant_id !== variantId),
        }))
      },

      updateQuantity: (variantId, qty) => {
        if (qty <= 0) {
          get().removeItem(variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variant_id === variantId
              ? { ...i, quantity: Math.min(qty, i.max_quantity) }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      },
      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },
      get isEmpty() {
        return get().items.length === 0
      },
    }),
    {
      name: 'ursignature-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
)
```

---

## FILE: src/styles/globals.css

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --noir: #0A0A0A;
  --noir-50: #1A1A1A;
  --noir-100: #111111;
  --gold: #C9A84C;
  --gold-light: #E2C87A;
  --gold-dark: #9A7A30;
  --gold-muted: rgba(201, 168, 76, 0.15);
  --ivory: #F5F0E8;
  --ivory-muted: #D4CEC5;
  --smoke: #6B6B6B;
  --smoke-light: #9B9B9B;
  --border: rgba(201, 168, 76, 0.12);
  --border-subtle: rgba(255, 255, 255, 0.06);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

body {
  background-color: var(--noir);
  color: var(--ivory);
  font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
  overflow-x: hidden;
}

/* ── Scrollbar ────────────────────────────── */
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: var(--noir); }
::-webkit-scrollbar-thumb { background: var(--gold-dark); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: var(--gold); }

/* ── Selection ────────────────────────────── */
::selection {
  background: var(--gold);
  color: var(--noir);
}

/* ── Typography ───────────────────────────── */
.font-display {
  font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
}

h1, h2, h3 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

/* ── Gold Shimmer ─────────────────────────── */
.text-gold-shimmer {
  background: linear-gradient(
    105deg,
    var(--gold-dark) 0%,
    var(--gold) 25%,
    var(--gold-light) 50%,
    var(--gold) 75%,
    var(--gold-dark) 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
}

/* ── Dividers ─────────────────────────────── */
.divider-gold {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--gold) 50%, transparent 100%);
  opacity: 0.4;
}

.divider-subtle {
  height: 1px;
  background: var(--border-subtle);
}

/* ── Animations ───────────────────────────── */
@keyframes shimmer {
  to { background-position: 200% center; }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(-2deg); }
  50% { transform: translateY(-16px) rotate(2deg); }
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulse-gold {
  0%, 100% { box-shadow: 0 0 0 0 rgba(201, 168, 76, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(201, 168, 76, 0); }
}

/* ── Utility Classes ──────────────────────── */
.animate-fade-up { animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
.animate-float { animation: float 6s ease-in-out infinite; }
.animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }

/* ── Hero Grain Texture ───────────────────── */
.grain-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1;
}

/* ── Product Card Hover ───────────────────── */
.product-card-img {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.product-card:hover .product-card-img {
  transform: scale(1.05);
}
.product-card-overlay {
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.product-card:hover .product-card-overlay {
  transform: translateY(0);
}

/* ── Admin Sidebar ────────────────────────── */
.admin-nav-item {
  transition: all 0.2s ease;
  border-left: 2px solid transparent;
}
.admin-nav-item:hover {
  background: rgba(201, 168, 76, 0.06);
  border-left-color: rgba(201, 168, 76, 0.4);
  color: var(--ivory);
}
.admin-nav-item.active {
  background: rgba(201, 168, 76, 0.1);
  border-left-color: var(--gold);
  color: var(--gold);
}

/* ── Forms ────────────────────────────────── */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0px 1000px #111111 inset;
  -webkit-text-fill-color: var(--ivory);
  transition: background-color 5000s ease-in-out 0s;
}

/* ── WhatsApp Float Button ────────────────── */
.whatsapp-float {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 999;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #25D366;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  text-decoration: none;
}
.whatsapp-float:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 28px rgba(37, 211, 102, 0.5);
}
```

---

## REMAINING FILES — Write these completely:

For each file listed below, write the COMPLETE, PRODUCTION-READY implementation:

### API Routes

**`src/app/api/upload/route.ts`** — POST: admin-only, receives file, compresses with sharp, uploads to R2, returns URL

**`src/app/api/payment/create-order/route.ts`** — full validation + order creation (see master agent spec)

**`src/app/api/payment/verify/route.ts`** — signature verification + order confirmation + Shiprocket + Telegram

**`src/app/api/coupons/validate/route.ts`** — full coupon validation

**`src/app/api/telegram/webhook/route.ts`** — all 6 commands: /orders, /order, /stock, /revenue, /pending, /help

**`src/app/api/cron/daily-report/route.ts`** — compile daily stats + send Telegram report

**`src/app/api/cron/stock-check/route.ts`** — check low stock + send alerts

**`src/app/api/auth/callback/route.ts`** — Supabase auth callback handler

**`src/app/api/admin/products/route.ts`** — GET (paginated), POST, PUT, DELETE for products

**`src/app/api/admin/orders/route.ts`** — GET (with filters), PUT status update

**`src/app/api/admin/inventory/route.ts`** — POST inventory adjustment, GET transaction history

**`src/app/api/admin/settings/route.ts`** — GET all settings, PUT update

### Storefront Pages

**`src/app/(storefront)/layout.tsx`** — includes Header, Footer, CartDrawer, AnnouncementBar, script tags for GA4 and Meta Pixel, TanStack Query provider

**`src/app/(storefront)/page.tsx`** — complete homepage (see agent-05 for sections)

**`src/app/(storefront)/collections/page.tsx`** — all collections grid

**`src/app/(storefront)/collections/[slug]/page.tsx`** — collection with products + filter

**`src/app/(storefront)/product/[slug]/page.tsx`** — complete product detail + JSON-LD schema

**`src/app/(storefront)/checkout/page.tsx`** — 3-step checkout with Razorpay SDK

**`src/app/(storefront)/order-success/page.tsx`** — confirmation + fire purchase events

**`src/app/(storefront)/login/page.tsx`** + **`signup/page.tsx`**

**`src/app/(storefront)/account/page.tsx`** + **`orders/page.tsx`** + **`profile/page.tsx`**

**`src/app/(storefront)/track-order/page.tsx`**

### Admin Pages

**`src/app/(admin)/layout.tsx`** — sidebar, admin-only

**All 10 admin pages** — see agent-08 for full specs. Write them all completely.

### SEO Files

**`src/app/sitemap.ts`** — dynamic sitemap with all products and categories

**`src/app/robots.ts`** — robots.txt config

**`src/app/layout.tsx`** (root) — metadata, fonts, viewport

---

## BUILD VERIFICATION

After writing all files, run:
```bash
npm run build 2>&1
```

If errors → fix all of them → re-run → repeat until it passes.
```
