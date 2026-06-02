import { Hono } from 'hono'
import type { Env } from '../types'
import { requireAdmin } from '../lib/auth'
import { getAdminClient } from '../lib/supabase'
import { mapProductImages, mapProductImagesList } from '../lib/product-images'
import { uploadToR2 } from '../lib/r2'

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const admin = new Hono<{ Bindings: Env }>()

admin.use('*', async (c, next) => {
  const res = await requireAdmin(c)
  if (res) return res
  await next()
})

// GET/PUT /api/admin/settings
admin.get('/settings', async (c) => {
  const supabase = getAdminClient(c.env)
  const { data, error } = await supabase.from('settings').select('key, value')
  if (error) return c.json({ error: error.message }, 500)
  const obj: Record<string, string> = {}
  ;(data ?? []).forEach((r: { key: string; value: string | null }) => (obj[r.key] = r.value ?? ''))
  return c.json(obj)
})

admin.put('/settings', async (c) => {
  const body = await c.req.json<Record<string, unknown>>()
  if (typeof body !== 'object' || body === null) return c.json({ error: 'Body must be key-value object' }, 400)
  const supabase = getAdminClient(c.env)
  for (const [key, value] of Object.entries(body)) {
    const v = value == null ? '' : String(value)
    const { data: existing } = await supabase.from('settings').select('key').eq('key', key).single()
    if (existing) await supabase.from('settings').update({ value: v }).eq('key', key)
    else await supabase.from('settings').insert({ key, value: v })
  }
  const { data } = await supabase.from('settings').select('key, value')
  const obj: Record<string, string> = {}
  ;(data ?? []).forEach((r: { key: string; value: string | null }) => (obj[r.key] = r.value ?? ''))
  return c.json(obj)
})

// GET/POST /api/admin/products
admin.get('/products', async (c) => {
  const url = new URL(c.req.url)
  const q = url.searchParams.get('q') ?? ''
  const category = url.searchParams.get('category')
  const status = url.searchParams.get('status')
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10)))
  const from = (page - 1) * limit
  const supabase = getAdminClient(c.env)
  let query = supabase
    .from('products')
    .select('*, product_variants(*), product_images(url, sort_order, is_primary)', { count: 'exact' })
  if (q) query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%,tagline.ilike.%${q}%`)
  if (status === 'active') query = query.eq('is_active', true)
  if (status === 'inactive') query = query.eq('is_active', false)
  if (category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).single()
    if (cat) {
      const { data: pc } = await supabase.from('product_categories').select('product_id').eq('category_id', cat.id)
      const ids = (pc ?? []).map((p: { product_id: string }) => p.product_id)
      if (ids.length) query = query.in('id', ids)
    }
  }
  const { data: raw, error, count } = await query.order('sort_order').range(from, from + limit - 1)
  if (error) return c.json({ error: error.message }, 500)
  const data = mapProductImagesList((raw ?? []) as { product_images?: { url: string; sort_order: number; is_primary: boolean }[] }[])
  return c.json({ data, count: count ?? 0, page, total_pages: count ? Math.ceil(count / limit) : 0 })
})

admin.post('/products', async (c) => {
  const body = await c.req.json<Record<string, unknown>>()
  const { name, slug, tagline, description, short_description, inspired_by, category_type, fragrance_profile, top_notes, heart_notes, base_notes, rating, is_featured, is_active, meta_title, meta_description, sort_order, variants = [], category_ids = [], image_urls = [] } = body as Record<string, unknown>
  if (!name || !slug) return c.json({ error: 'name and slug required' }, 400)
  const supabase = getAdminClient(c.env)
  const slugVal = String(slug).trim().toLowerCase().replace(/\s+/g, '-')
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      name: String(name),
      slug: slugVal,
      tagline: tagline ?? null,
      description: description ?? null,
      short_description: short_description ?? null,
      inspired_by: inspired_by ?? null,
      category_type: category_type ?? 'unisex',
      fragrance_profile: fragrance_profile ?? null,
      top_notes: Array.isArray(top_notes) ? top_notes : [],
      heart_notes: Array.isArray(heart_notes) ? heart_notes : [],
      base_notes: Array.isArray(base_notes) ? base_notes : [],
      rating: typeof rating === 'number' ? rating : 0,
      is_featured: Boolean(is_featured),
      is_active: is_active !== false,
      meta_title: meta_title ?? null,
      meta_description: meta_description ?? null,
      sort_order: typeof sort_order === 'number' ? sort_order : 0,
      images: [],
    })
    .select()
    .single()
  if (productError || !product) return c.json({ error: productError?.message ?? 'Failed to create product' }, 500)
  const productId = product.id
  for (const v of variants as Record<string, unknown>[]) {
    const size_ml = Number(v.size_ml) || 50
    const sku = (v.sku as string) || `URS-${slugVal.replace(/-/g, '').slice(0, 8)}-${size_ml}`
    await supabase.from('product_variants').insert({
      product_id: productId,
      size_ml,
      price: Number(v.price) ?? 0,
      compare_at_price: v.compare_at_price != null ? Number(v.compare_at_price) : null,
      sku,
      stock_quantity: Math.max(0, Number(v.stock_quantity) ?? 0),
      low_stock_threshold: Math.max(0, Number(v.low_stock_threshold) ?? 10),
      is_active: v.is_active !== false,
    })
  }
  for (const cid of category_ids as string[]) {
    if (cid) await supabase.from('product_categories').upsert({ product_id: productId, category_id: cid }, { onConflict: 'product_id,category_id' })
  }
  for (let i = 0; i < (image_urls as string[]).length; i++) {
    await supabase.from('product_images').insert({ product_id: productId, url: (image_urls as string[])[i], sort_order: i, is_primary: i === 0 })
  }
  const { data: full } = await supabase.from('products').select('*, product_variants(*), product_images(url, sort_order, is_primary)').eq('id', productId).single()
  const mapped = full ? mapProductImagesList([full as { product_images?: { url: string; sort_order: number; is_primary: boolean }[] }])[0] : null
  return c.json(mapped ?? product, 201)
})

// GET/PUT/DELETE /api/admin/products/:id
admin.get('/products/:id', async (c) => {
  const id = c.req.param('id')
  const supabase = getAdminClient(c.env)
  const { data, error } = await supabase.from('products').select('*, product_variants(*), product_images(url, sort_order, is_primary)').eq('id', id).single()
  if (error || !data) return c.json({ error: 'Not found' }, 404)
  return c.json(mapProductImages(data as { product_images?: { url: string; sort_order: number; is_primary: boolean }[] }))
})

admin.put('/products/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<Record<string, unknown>>()
  const supabase = getAdminClient(c.env)
  const { name, slug, tagline, description, short_description, inspired_by, category_type, fragrance_profile, top_notes, heart_notes, base_notes, rating, is_featured, is_active, meta_title, meta_description, sort_order, variants = [], category_ids = [] } = body as Record<string, unknown>
  const slugVal = slug != null ? String(slug).trim().toLowerCase().replace(/\s+/g, '-') : undefined
  const { error: updateErr } = await supabase
    .from('products')
    .update({
      ...(name != null && { name: String(name) }),
      ...(slugVal != null && { slug: slugVal }),
      ...(tagline !== undefined && { tagline: tagline ?? null }),
      ...(description !== undefined && { description: description ?? null }),
      ...(short_description !== undefined && { short_description: short_description ?? null }),
      ...(inspired_by !== undefined && { inspired_by: inspired_by ?? null }),
      ...(category_type !== undefined && { category_type: category_type ?? 'unisex' }),
      ...(fragrance_profile !== undefined && { fragrance_profile: fragrance_profile ?? null }),
      ...(Array.isArray(top_notes) && { top_notes }),
      ...(Array.isArray(heart_notes) && { heart_notes }),
      ...(Array.isArray(base_notes) && { base_notes }),
      ...(typeof rating === 'number' && { rating }),
      ...(is_featured !== undefined && { is_featured: Boolean(is_featured) }),
      ...(is_active !== undefined && { is_active: is_active !== false }),
      ...(meta_title !== undefined && { meta_title: meta_title ?? null }),
      ...(meta_description !== undefined && { meta_description: meta_description ?? null }),
      ...(typeof sort_order === 'number' && { sort_order }),
    })
    .eq('id', id)
  if (updateErr) return c.json({ error: updateErr.message }, 500)
  if (Array.isArray(variants)) {
    const { data: existing } = await supabase.from('product_variants').select('id').eq('product_id', id)
    const existingIds = new Set((existing ?? []).map((r: { id: string }) => r.id))
    for (const v of variants as Record<string, unknown>[]) {
      const vid = v.id as string | undefined
      if (vid && existingIds.has(vid)) {
        await supabase.from('product_variants').update({
          size_ml: Number(v.size_ml) || 50,
          price: Number(v.price) ?? 0,
          compare_at_price: v.compare_at_price != null ? Number(v.compare_at_price) : null,
          sku: (v.sku as string) || undefined,
          stock_quantity: Math.max(0, Number(v.stock_quantity) ?? 0),
          low_stock_threshold: Math.max(0, Number(v.low_stock_threshold) ?? 10),
          is_active: v.is_active !== false,
        }).eq('id', vid)
      } else {
        await supabase.from('product_variants').insert({
          product_id: id,
          size_ml: Number(v.size_ml) || 50,
          price: Number(v.price) ?? 0,
          compare_at_price: v.compare_at_price != null ? Number(v.compare_at_price) : null,
          sku: (v.sku as string) || undefined,
          stock_quantity: Math.max(0, Number(v.stock_quantity) ?? 0),
          low_stock_threshold: Math.max(0, Number(v.low_stock_threshold) ?? 10),
          is_active: v.is_active !== false,
        })
      }
    }
  }
  if (Array.isArray(category_ids)) {
    await supabase.from('product_categories').delete().eq('product_id', id)
    for (const cid of category_ids as string[]) {
      if (cid) await supabase.from('product_categories').insert({ product_id: id, category_id: cid })
    }
  }
  const { data: full } = await supabase.from('products').select('*, product_variants(*), product_images(url, sort_order, is_primary)').eq('id', id).single()
  const mapped = full ? mapProductImagesList([full as { product_images?: { url: string; sort_order: number; is_primary: boolean }[] }])[0] : null
  return c.json(mapped ?? { id })
})

admin.delete('/products/:id', async (c) => {
  const id = c.req.param('id')
  const supabase = getAdminClient(c.env)
  await supabase.from('product_images').delete().eq('product_id', id)
  await supabase.from('product_variants').delete().eq('product_id', id)
  await supabase.from('product_categories').delete().eq('product_id', id)
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return c.json({ error: error.message }, 500)
  return c.body(null, 204)
})

// GET/POST /api/admin/products/:id/images
admin.get('/products/:id/images', async (c) => {
  const id = c.req.param('id')
  const supabase = getAdminClient(c.env)
  const { data, error } = await supabase.from('product_images').select('*').eq('product_id', id).order('sort_order')
  if (error) return c.json({ error: error.message }, 500)
  const sorted = (data ?? []).sort((a: { is_primary: boolean }, b: { is_primary: boolean }) => (a.is_primary === b.is_primary ? 0 : a.is_primary ? -1 : 1))
  return c.json(sorted)
})

admin.post('/products/:id/images', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ url: string; sort_order?: number; is_primary?: boolean }>()
  if (!body?.url) return c.json({ error: 'url required' }, 400)
  const supabase = getAdminClient(c.env)
  if (body.is_primary) {
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', id)
  }
  const { data, error } = await supabase.from('product_images').insert({
    product_id: id,
    url: body.url,
    sort_order: typeof body.sort_order === 'number' ? body.sort_order : 0,
    is_primary: Boolean(body.is_primary),
  }).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

admin.patch('/products/:id/images', async (c) => {
  const body = await c.req.json<{ id: string; sort_order?: number; is_primary?: boolean }>()
  if (!body?.id) return c.json({ error: 'id required' }, 400)
  const supabase = getAdminClient(c.env)
  if (body.is_primary) {
    const { data: img } = await supabase.from('product_images').select('product_id').eq('id', body.id).single()
    if (img) await supabase.from('product_images').update({ is_primary: false }).eq('product_id', img.product_id)
  }
  const updates: Record<string, unknown> = {}
  if (typeof body.sort_order === 'number') updates.sort_order = body.sort_order
  if (body.is_primary !== undefined) updates.is_primary = body.is_primary
  const { data, error } = await supabase.from('product_images').update(updates).eq('id', body.id).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

admin.delete('/products/:id/images', async (c) => {
  const url = new URL(c.req.url)
  const id = url.searchParams.get('id')
  if (!id) return c.json({ error: 'id required' }, 400)
  const supabase = getAdminClient(c.env)
  const { error } = await supabase.from('product_images').delete().eq('id', id)
  if (error) return c.json({ error: error.message }, 500)
  return c.body(null, 204)
})

// PATCH /api/admin/product-images/:id/primary
admin.patch('/product-images/:id/primary', async (c) => {
  const id = c.req.param('id')
  const supabase = getAdminClient(c.env)
  const { data: img, error: fetchErr } = await supabase.from('product_images').select('product_id').eq('id', id).single()
  if (fetchErr || !img) return c.json({ error: 'Not found' }, 404)
  await supabase.from('product_images').update({ is_primary: false }).eq('product_id', img.product_id)
  await supabase.from('product_images').update({ is_primary: true }).eq('id', id)
  return c.json({ ok: true })
})

// POST /api/admin/upload
admin.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File | null
    const slug = (formData.get('slug') as string)?.trim() || ''
    const slugVal = slugify(slug)
    if (!file || !file.size) return c.json({ error: 'No file provided' }, 400)
    const bytes = await file.arrayBuffer()
    const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/jpeg/, 'jpg')
    const safeName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().slice(0, 40)
    const key = slugVal && slugVal !== 'misc' ? `products/${slugVal}/${Date.now()}-${safeName}.${ext}` : `misc/${Date.now()}-${safeName}.${ext}`
    const contentType = file.type || (ext === 'png' ? 'image/png' : ext === 'jpg' ? 'image/jpeg' : 'image/webp')
    const url = await uploadToR2(c.env, key, bytes, contentType)
    return c.json({ url })
  } catch (err) {
    console.error('Upload error:', err)
    return c.json({ error: 'Upload failed' }, 500)
  }
})

// GET/POST /api/admin/categories
admin.get('/categories', async (c) => {
  const supabase = getAdminClient(c.env)
  const { data: categories, error } = await supabase.from('categories').select('*').order('sort_order').order('name')
  if (error) return c.json({ error: error.message }, 500)
  const withCount = await Promise.all(
    (categories ?? []).map(async (cat: { id: string }) => {
      const { count } = await supabase.from('product_categories').select('*', { count: 'exact', head: true }).eq('category_id', cat.id)
      return { ...cat, product_count: count ?? 0 }
    })
  )
  return c.json(withCount)
})

admin.post('/categories', async (c) => {
  const body = await c.req.json<Record<string, unknown>>()
  const { name, slug, description, parent_id, sort_order, is_active, banner_image } = body ?? {}
  if (!name) return c.json({ error: 'name required' }, 400)
  const slugVal = (slug || name).toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const supabase = getAdminClient(c.env)
  const { data, error } = await supabase.from('categories').insert({
    name: String(name).trim(),
    slug: slugVal || undefined,
    description: description ?? null,
    parent_id: parent_id ?? null,
    sort_order: typeof sort_order === 'number' ? sort_order : 0,
    is_active: is_active !== false,
    banner_image: banner_image ?? null,
  }).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

admin.put('/categories/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<Record<string, unknown>>()
  const supabase = getAdminClient(c.env)
  const { name, slug, description, parent_id, sort_order, is_active, banner_image } = body ?? {}
  const slugVal = slug != null ? String(slug).toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : undefined
  const { data, error } = await supabase.from('categories').update({
    ...(name != null && { name: String(name).trim() }),
    ...(slugVal != null && { slug: slugVal }),
    ...(description !== undefined && { description: description ?? null }),
    ...(parent_id !== undefined && { parent_id: parent_id ?? null }),
    ...(typeof sort_order === 'number' && { sort_order }),
    ...(is_active !== undefined && { is_active: is_active !== false }),
    ...(banner_image !== undefined && { banner_image: banner_image ?? null }),
  }).eq('id', id).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

admin.delete('/categories/:id', async (c) => {
  const id = c.req.param('id')
  const supabase = getAdminClient(c.env)
  const { data: refs } = await supabase.from('product_categories').select('id').eq('category_id', id).limit(1)
  if (refs?.length) return c.json({ error: 'Category has products' }, 400)
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return c.json({ error: error.message }, 500)
  return c.body(null, 204)
})

// GET /api/admin/orders, GET/PATCH /api/admin/orders/:id
admin.get('/orders', async (c) => {
  const url = new URL(c.req.url)
  const status = url.searchParams.get('status')
  const payment_status = url.searchParams.get('payment_status')
  const fromDate = url.searchParams.get('from')
  const toDate = url.searchParams.get('to')
  const q = url.searchParams.get('q')
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10)))
  const from = (page - 1) * limit
  const supabase = getAdminClient(c.env)
  let query = supabase.from('orders').select('id, order_number, user_id, guest_email, guest_phone, status, payment_status, subtotal, discount, shipping_charge, total, created_at', { count: 'exact' })
  if (status) query = query.eq('status', status)
  if (payment_status) query = query.eq('payment_status', payment_status)
  if (fromDate) query = query.gte('created_at', `${fromDate}T00:00:00.000Z`)
  if (toDate) query = query.lte('created_at', `${toDate}T23:59:59.999Z`)
  if (q) query = query.or(`order_number.ilike.%${q.trim()}%,guest_email.ilike.%${q.trim()}%,guest_phone.ilike.%${q.trim()}%`)
  const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, from + limit - 1)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ data: data ?? [], count: count ?? 0, page, limit, total_pages: count ? Math.ceil(count / limit) : 0 })
})

admin.get('/orders/:id', async (c) => {
  const id = c.req.param('id')
  const supabase = getAdminClient(c.env)
  const { data, error } = await supabase.from('orders').select('*, order_items(*), shipping_address').eq('id', id).single()
  if (error || !data) return c.json({ error: 'Not found' }, 404)
  return c.json(data)
})

admin.patch('/orders/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ status?: string; admin_notes?: string }>()
  const supabase = getAdminClient(c.env)
  const updates: Record<string, unknown> = {}
  if (body?.status != null) updates.status = body.status
  if (body?.admin_notes !== undefined) updates.admin_notes = body.admin_notes
  const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// GET/POST /api/admin/inventory
admin.get('/inventory', async (c) => {
  const url = new URL(c.req.url)
  const low_stock_only = url.searchParams.get('low_stock_only') === 'true'
  const product_id = url.searchParams.get('product_id')
  const supabase = getAdminClient(c.env)
  let query = supabase.from('product_variants').select('id, product_id, size_ml, sku, stock_quantity, low_stock_threshold, is_active, products(name, slug)')
  if (product_id) query = query.eq('product_id', product_id)
  const { data: variants, error } = await query.order('product_id').order('size_ml')
  if (error) return c.json({ error: error.message }, 500)
  let list = variants ?? []
  if (low_stock_only) list = list.filter((v: { stock_quantity: number; low_stock_threshold: number }) => v.stock_quantity <= v.low_stock_threshold)
  return c.json(list)
})

admin.post('/inventory', async (c) => {
  const body = await c.req.json<{ variant_id?: string; type?: string; quantity_change?: number; note?: string }>()
  const { variant_id, type, quantity_change, note } = body ?? {}
  if (!variant_id || !type || quantity_change === undefined) return c.json({ error: 'variant_id, type (restock|adjustment), and quantity_change required' }, 400)
  const t = type === 'restock' || type === 'adjustment' ? type : 'adjustment'
  const delta = Number(quantity_change) || 0
  if (delta === 0) return c.json({ error: 'quantity_change must not be 0' }, 400)
  const supabase = getAdminClient(c.env)
  const { data: variant, error: fetchErr } = await supabase.from('product_variants').select('id, stock_quantity').eq('id', variant_id).single()
  if (fetchErr || !variant) return c.json({ error: 'Variant not found' }, 404)
  const current = Number(variant.stock_quantity) || 0
  const quantity_after = Math.max(0, current + delta)
  const { error: updateErr } = await supabase.from('product_variants').update({ stock_quantity: quantity_after, updated_at: new Date().toISOString() }).eq('id', variant_id)
  if (updateErr) return c.json({ error: updateErr.message }, 500)
  await supabase.from('inventory_transactions').insert({ variant_id, type: t, quantity_change: delta, quantity_after, order_id: null, note: note ?? null, created_by: null })
  return c.json({ variant_id, quantity_after, previous: current })
})

// GET/POST /api/admin/coupons, GET/PUT/DELETE /api/admin/coupons/:id
admin.get('/coupons', async (c) => {
  const supabase = getAdminClient(c.env)
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data ?? [])
})

admin.post('/coupons', async (c) => {
  const body = await c.req.json<Record<string, unknown>>()
  const { code, type, value, min_order_value, max_discount, usage_limit, per_user_limit, expires_at, is_active } = body ?? {}
  if (!code) return c.json({ error: 'code required' }, 400)
  const supabase = getAdminClient(c.env)
  const codeVal = String(code).toUpperCase().trim()
  const { data, error } = await supabase.from('coupons').insert({
    code: codeVal,
    type: type ?? 'percentage',
    value: Number(value) ?? 0,
    min_order_value: min_order_value != null ? Number(min_order_value) : null,
    max_discount: max_discount != null ? Number(max_discount) : null,
    usage_limit: usage_limit != null ? Number(usage_limit) : null,
    per_user_limit: per_user_limit != null ? Number(per_user_limit) : null,
    expires_at: expires_at ?? null,
    is_active: is_active !== false,
  }).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

admin.get('/coupons/:id', async (c) => {
  const id = c.req.param('id')
  const supabase = getAdminClient(c.env)
  const { data, error } = await supabase.from('coupons').select('*').eq('id', id).single()
  if (error || !data) return c.json({ error: 'Not found' }, 404)
  return c.json(data)
})

admin.put('/coupons/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<Record<string, unknown>>()
  const supabase = getAdminClient(c.env)
  const { data, error } = await supabase.from('coupons').update(body).eq('id', id).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

admin.delete('/coupons/:id', async (c) => {
  const id = c.req.param('id')
  const supabase = getAdminClient(c.env)
  const { error } = await supabase.from('coupons').delete().eq('id', id)
  if (error) return c.json({ error: error.message }, 500)
  return c.body(null, 204)
})

// GET /api/admin/customers
admin.get('/customers', async (c) => {
  const url = new URL(c.req.url)
  const q = url.searchParams.get('q') ?? ''
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10)))
  const from = (page - 1) * limit
  const supabase = getAdminClient(c.env)
  let query = supabase.from('profiles').select('*', { count: 'exact' })
  if (q.trim()) query = query.or(`full_name.ilike.%${q.trim()}%,email.ilike.%${q.trim()}%`)
  const { data, error, count } = await query.range(from, from + limit - 1)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ data: data ?? [], count: count ?? 0, page, total_pages: count ? Math.ceil(count / limit) : 0 })
})

// GET/PATCH /api/admin/contacts
admin.get('/contacts', async (c) => {
  const supabase = getAdminClient(c.env)
  const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data ?? [])
})

admin.patch('/contacts', async (c) => {
  const body = await c.req.json<{ id?: string; read?: boolean }>()
  if (!body?.id) return c.json({ error: 'id required' }, 400)
  const supabase = getAdminClient(c.env)
  const { data, error } = await supabase.from('contact_messages').update({ read: body.read }).eq('id', body.id).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// GET /api/admin/reviews, PATCH /api/admin/reviews/:id
admin.get('/reviews', async (c) => {
  const url = new URL(c.req.url)
  const page = parseInt(url.searchParams.get('page') ?? '1', 10)
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10)))
  const from = (page - 1) * limit
  const supabase = getAdminClient(c.env)
  const { data, error, count } = await supabase.from('reviews').select('*, products(name, slug)', { count: 'exact' }).order('created_at', { ascending: false }).range(from, from + limit - 1)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ data: data ?? [], count: count ?? 0, page, total_pages: count ? Math.ceil(count / limit) : 0 })
})

admin.patch('/reviews/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ is_approved?: boolean }>()
  const supabase = getAdminClient(c.env)
  const { data, error } = await supabase.from('reviews').update({ is_approved: body?.is_approved }).eq('id', id).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// GET /api/admin/newsletter
admin.get('/newsletter', async (c) => {
  const url = new URL(c.req.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '50', 10)))
  const from = (page - 1) * limit
  const supabase = getAdminClient(c.env)
  const { data, error, count } = await supabase.from('newsletter_subscribers').select('*', { count: 'exact' }).order('subscribed_at', { ascending: false }).range(from, from + limit - 1)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ data: data ?? [], count: count ?? 0, page, total_pages: count ? Math.ceil(count / limit) : 0 })
})

// POST /api/admin/pos/complete — minimal: create order and decrement stock
admin.post('/pos/complete', async (c) => {
  const body = await c.req.json<{ items?: { variant_id: string; quantity: number }[]; customer?: { name?: string; phone?: string }; payment?: { method?: string; reference?: string } }>()
  if (!body?.items?.length) return c.json({ error: 'items required' }, 400)
  const supabase = getAdminClient(c.env)
  const { data: order, error: orderErr } = await supabase.from('orders').insert({
    order_number: `POS-${Date.now()}`,
    user_id: null,
    guest_email: null,
    guest_phone: body.customer?.phone ?? null,
    status: 'completed',
    payment_status: 'paid',
    payment_method: body.payment?.method ?? 'cash',
    payment_reference: body.payment?.reference ?? null,
    subtotal: 0,
    discount: 0,
    shipping_charge: 0,
    total: 0,
    is_pos: true,
  }).select().single()
  if (orderErr || !order) return c.json({ error: orderErr?.message ?? 'Failed to create order' }, 500)
  let total = 0
  for (const item of body.items) {
    const { data: v } = await supabase.from('product_variants').select('id, price, product_id, products(name)').eq('id', item.variant_id).single()
    if (v) {
      const lineTotal = (v.price ?? 0) * item.quantity
      total += lineTotal
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: v.product_id,
        variant_id: item.variant_id,
        product_name: (v as { products?: { name?: string } }).products?.name ?? '',
        size_ml: (v as { size_ml?: number }).size_ml ?? 0,
        quantity: item.quantity,
        unit_price: v.price ?? 0,
        total_price: lineTotal,
      })
      await supabase.from('product_variants').update({
        stock_quantity: Math.max(0, ((v as { stock_quantity?: number }).stock_quantity ?? 0) - item.quantity),
      }).eq('id', item.variant_id)
    }
  }
  await supabase.from('orders').update({ subtotal: total, total }).eq('id', order.id)
  const { data: full } = await supabase.from('orders').select('*, order_items(*)').eq('id', order.id).single()
  return c.json(full ?? order)
})

export default admin
