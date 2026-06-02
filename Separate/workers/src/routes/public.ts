import { Hono } from 'hono'
import type { Env } from '../types'
import { getAdminClient } from '../lib/supabase'
import { getAuthFromRequest } from '../lib/auth'
import { mapProductImages, mapProductImagesList } from '../lib/product-images'

const PUBLIC_KEYS = [
  'instagram_url',
  'whatsapp_number',
  'announcement_bar',
  'store_name',
  'store_email',
  'hero_eyebrow',
  'hero_title_line1',
  'hero_title_line2',
  'hero_subtitle',
  'hero_image_url',
  'hero_image_alt',
  'hero_cta_men_label',
  'hero_cta_men_url',
  'hero_cta_women_label',
  'hero_cta_women_url',
  'hero_cta_finder_label',
  'hero_cta_finder_url',
]

const app = new Hono<{ Bindings: Env }>()

// GET /api/settings/public
app.get('/settings/public', async (c) => {
  const supabase = getAdminClient(c.env)
  const { data, error } = await supabase.from('settings').select('key, value').in('key', PUBLIC_KEYS)
  if (error) return c.json({ error: error.message }, 500)
  const obj: Record<string, string> = {}
  ;(data ?? []).forEach((r: { key: string; value: string | null }) => (obj[r.key] = r.value ?? ''))
  return c.json(obj)
})

// GET /api/products
app.get('/products', async (c) => {
  const url = new URL(c.req.url)
  const slug = url.searchParams.get('slug')
  const category = url.searchParams.get('category')
  const supabase = getAdminClient(c.env)

  if (slug) {
    const { data: raw, error } = await supabase
      .from('products')
      .select('*, product_variants(*), product_images(url, sort_order, is_primary)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    if (error || !raw) return c.json({ error: 'Not found' }, 404)
    return c.json(mapProductImages(raw as { product_images?: { url: string; sort_order: number; is_primary: boolean }[] }))
  }

  const featured = url.searchParams.get('featured') === 'true'
  let query = supabase
    .from('products')
    .select('*, product_variants(*), product_images(url, sort_order, is_primary)', { count: 'exact' })
    .eq('is_active', true)
  if (featured) query = query.eq('is_featured', true).limit(8)
  if (category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).single()
    if (cat) {
      const { data: pc } = await supabase.from('product_categories').select('product_id').eq('category_id', cat.id)
      const ids = (pc ?? []).map((p: { product_id: string }) => p.product_id)
      if (ids.length) query = query.in('id', ids)
    }
  }
  const { data, error, count } = await query.order('sort_order')
  if (error) return c.json({ error: error.message }, 500)
  const list = mapProductImagesList((data ?? []) as { product_images?: { url: string; sort_order: number; is_primary: boolean }[] }[])
  return c.json({ data: list, count: count ?? 0 })
})

// GET /api/orders (track order)
app.get('/orders', async (c) => {
  const url = new URL(c.req.url)
  const orderNumber = url.searchParams.get('orderNumber')
  const email = url.searchParams.get('email')
  if (!orderNumber?.trim() || !email?.trim()) {
    return c.json({ error: 'orderNumber and email required' }, 400)
  }
  const auth = await getAuthFromRequest(c.req.raw, c.env)
  const supabase = getAdminClient(c.env)

  const { data: orderByGuest } = await supabase
    .from('orders')
    .select('id, order_number, status, total, tracking_number, tracking_url, courier_name, order_items(product_name, size_ml, quantity, total_price)')
    .eq('order_number', orderNumber.trim())
    .eq('guest_email', email.trim())
    .single()

  if (orderByGuest) return c.json({ order: orderByGuest })

  if (auth?.id) {
    const { data: orderByUser } = await supabase
      .from('orders')
      .select('id, order_number, status, total, tracking_number, tracking_url, courier_name, order_items(product_name, size_ml, quantity, total_price)')
      .eq('order_number', orderNumber.trim())
      .eq('user_id', auth.id)
      .single()
    if (orderByUser) return c.json({ order: orderByUser })
  }

  return c.json({ error: 'Order not found' }, 404)
})

// GET /api/auth/callback
app.get('/auth/callback', async (c) => {
  const url = new URL(c.req.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/account'
  const origin = url.origin
  if (code) {
    const supabase = getAdminClient(c.env)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return c.redirect(`${origin}${next}`)
    }
  }
  return c.redirect(`${origin}/login?error=auth_callback_error`)
})

// POST /api/coupons/validate
app.post('/coupons/validate', async (c) => {
  try {
    const body = await c.req.json<{ code?: string; subtotal?: number; amount?: number }>()
    const code = body?.code
    const subtotal = body?.subtotal ?? body?.amount ?? 0
    if (!code || typeof subtotal !== 'number') {
      return c.json({ error: 'Code and subtotal required' }, 400)
    }
    const supabase = getAdminClient(c.env)
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', String(code).toUpperCase().trim())
      .eq('is_active', true)
      .single()
    if (error || !coupon) {
      return c.json({ valid: false, error: 'Invalid or expired coupon' })
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return c.json({ valid: false, error: 'Coupon has expired' })
    }
    if (coupon.min_order_value && subtotal < coupon.min_order_value) {
      return c.json({ valid: false, error: `Minimum order value is ₹${coupon.min_order_value}` })
    }
    if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit) {
      return c.json({ valid: false, error: 'Coupon usage limit reached' })
    }
    const discount =
      coupon.type === 'percentage'
        ? Math.min((subtotal * coupon.value) / 100, coupon.max_discount ?? Infinity)
        : coupon.value
    return c.json({
      valid: true,
      discount,
      couponCode: coupon.code,
      message: coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`,
    })
  } catch {
    return c.json({ error: 'Server error' }, 500)
  }
})

// POST /api/contact
app.post('/contact', async (c) => {
  try {
    const body = await c.req.json<{ name?: string; email?: string; message?: string; subject?: string }>()
    const { name, email, message, subject } = body ?? {}
    if (!name || !email || !message) {
      return c.json({ error: 'All fields required' }, 400)
    }
    const supabase = getAdminClient(c.env)
    await supabase.from('contact_messages').insert({
      name: String(name).trim(),
      email: String(email).trim(),
      subject: subject ? String(subject).trim() : null,
      message: String(message).trim(),
    })
    return c.json({ success: true })
  } catch {
    return c.json({ error: 'Invalid request' }, 400)
  }
})

// POST /api/newsletter
app.post('/newsletter', async (c) => {
  try {
    const body = await c.req.json<{ email?: string }>()
    const email = body?.email
    if (!email || typeof email !== 'string') return c.json({ error: 'Email required' }, 400)
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return c.json({ error: 'Email required' }, 400)
    const supabase = getAdminClient(c.env)
    const { error } = await supabase.from('newsletter_subscribers').upsert(
      { email: trimmed, subscribed_at: new Date().toISOString() },
      { onConflict: 'email' }
    )
    if (error) return c.json({ error: error.message }, 500)
    return c.json({ success: true })
  } catch {
    return c.json({ error: 'Invalid request' }, 400)
  }
})

// POST /api/payment/create-order — stub; full impl would use Razorpay
app.post('/payment/create-order', async (c) => {
  try {
    const body = await c.req.json<{ items?: unknown[]; shippingAddress?: unknown; couponCode?: string; guestEmail?: string; guestPhone?: string }>()
    if (!body?.items?.length || !body?.shippingAddress) {
      return c.json({ error: 'Items and shipping address required' }, 400)
    }
    // TODO: integrate Razorpay when RAZORPAY_KEY_ID/SECRET are set
    return c.json({ error: 'Payment integration not configured' }, 501)
  } catch {
    return c.json({ error: 'Invalid request' }, 400)
  }
})

// POST /api/payment/verify — stub
app.post('/payment/verify', async (c) => {
  try {
    await c.req.json()
    return c.json({ error: 'Payment verification not configured' }, 501)
  } catch {
    return c.json({ error: 'Invalid request' }, 400)
  }
})

export default app
