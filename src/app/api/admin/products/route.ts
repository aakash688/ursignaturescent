import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { createAdminClient } from '@/lib/supabase/server'
import { mapProductImagesList } from '@/lib/product-images'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth) return auth

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category')
  const status = searchParams.get('status')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const from = (page - 1) * limit

  const supabase = createAdminClient()
  let query = supabase
    .from('products')
    .select('*, product_variants(*), product_images(url, sort_order, is_primary)', { count: 'exact' })

  if (q) {
    query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%,tagline.ilike.%${q}%`)
  }
  if (status === 'active') query = query.eq('is_active', true)
  if (status === 'inactive') query = query.eq('is_active', false)
  if (category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).single()
    if (cat) {
      const { data: pc } = await supabase.from('product_categories').select('product_id').eq('category_id', cat.id)
      const ids = pc?.map((p) => p.product_id) ?? []
      if (ids.length) query = query.in('id', ids)
    }
  }

  const { data: raw, error, count } = await query.order('sort_order').range(from, from + limit - 1)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const data = mapProductImagesList((raw ?? []) as Array<{ product_images?: { url: string; sort_order: number; is_primary: boolean }[]; images?: string[] }>)
  const totalPages = count ? Math.ceil(count / limit) : 0
  return NextResponse.json({ data, count: count ?? 0, page, total_pages: totalPages })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth) return auth

  const body = await request.json()
  const {
    name,
    slug,
    tagline,
    description,
    short_description,
    inspired_by,
    category_type,
    fragrance_profile,
    top_notes,
    heart_notes,
    base_notes,
    rating,
    is_featured,
    is_active,
    meta_title,
    meta_description,
    sort_order,
    variants = [],
    category_ids = [],
    image_urls = [],
  } = body

  if (!name || !slug) {
    return NextResponse.json({ error: 'name and slug required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      name,
      slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
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

  if (productError || !product) {
    return NextResponse.json({ error: productError?.message ?? 'Failed to create product' }, { status: 500 })
  }

  const productId = product.id
  const slugVal = product.slug

  for (let i = 0; i < (variants as Array<Record<string, unknown>>).length; i++) {
    const v = variants[i] as Record<string, unknown>
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
    await supabase.from('product_images').insert({
      product_id: productId,
      url: image_urls[i],
      sort_order: i,
      is_primary: i === 0,
    })
  }

  const { data: full } = await supabase
    .from('products')
    .select('*, product_variants(*), product_images(url, sort_order, is_primary)')
    .eq('id', productId)
    .single()
  const mapped = full ? mapProductImagesList([full as { product_images?: { url: string; sort_order: number; is_primary: boolean }[] }])[0] : null
  return NextResponse.json(mapped ?? product)
}
