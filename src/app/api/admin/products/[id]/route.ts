import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { createAdminClient } from '@/lib/supabase/server'
import { mapProductImages } from '@/lib/product-images'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth) return auth
  const { id } = await params
  const supabase = createAdminClient()
  const { data: product, error } = await supabase
    .from('products')
    .select('*, product_variants(*), product_images(id, url, sort_order, is_primary)')
    .eq('id', id)
    .single()
  if (error || !product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { data: pc } = await supabase.from('product_categories').select('category_id').eq('product_id', id)
  const category_ids = (pc ?? []).map((r) => r.category_id)
  const mapped = mapProductImages(product as { product_images?: { url: string; sort_order: number; is_primary: boolean }[]; images?: string[] })
  return NextResponse.json({ ...mapped, category_ids })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth) return auth
  const { id } = await params
  const body = await request.json()
  const supabase = createAdminClient()
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

  const updatePayload: Record<string, unknown> = {}
  if (name != null) updatePayload.name = name
  if (slug != null) updatePayload.slug = String(slug).trim().toLowerCase().replace(/\s+/g, '-')
  if (tagline !== undefined) updatePayload.tagline = tagline
  if (description !== undefined) updatePayload.description = description
  if (short_description !== undefined) updatePayload.short_description = short_description
  if (inspired_by !== undefined) updatePayload.inspired_by = inspired_by
  if (category_type != null) updatePayload.category_type = category_type
  if (fragrance_profile !== undefined) updatePayload.fragrance_profile = fragrance_profile
  if (Array.isArray(top_notes)) updatePayload.top_notes = top_notes
  if (Array.isArray(heart_notes)) updatePayload.heart_notes = heart_notes
  if (Array.isArray(base_notes)) updatePayload.base_notes = base_notes
  if (typeof rating === 'number') updatePayload.rating = rating
  if (typeof is_featured === 'boolean') updatePayload.is_featured = is_featured
  if (typeof is_active === 'boolean') updatePayload.is_active = is_active
  if (meta_title !== undefined) updatePayload.meta_title = meta_title
  if (meta_description !== undefined) updatePayload.meta_description = meta_description
  if (typeof sort_order === 'number') updatePayload.sort_order = sort_order

  if (Object.keys(updatePayload).length > 0) {
    const { error: updateErr } = await supabase.from('products').update(updatePayload).eq('id', id)
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  const variantIds = (variants as Array<{ id?: string }>).filter((v) => v.id).map((v) => v.id as string)
  const { data: existingVariants } = await supabase.from('product_variants').select('id').eq('product_id', id)
  const existingIds = new Set((existingVariants ?? []).map((v) => v.id))
  for (const vid of existingIds) {
    if (!variantIds.includes(vid)) {
      await supabase.from('product_variants').delete().eq('id', vid)
    }
  }
  const slugVal = (slug ?? (await supabase.from('products').select('slug').eq('id', id).single()).data?.slug) || 'product'
  for (const v of variants as Array<Record<string, unknown>>) {
    const size_ml = Number(v.size_ml) || 50
    const sku = (v.sku as string) || `URS-${String(slugVal).replace(/-/g, '').slice(0, 8)}-${size_ml}`
    const row = {
      product_id: id,
      size_ml,
      price: Number(v.price) ?? 0,
      compare_at_price: v.compare_at_price != null ? Number(v.compare_at_price) : null,
      sku,
      stock_quantity: Math.max(0, Number(v.stock_quantity) ?? 0),
      low_stock_threshold: Math.max(0, Number(v.low_stock_threshold) ?? 10),
      is_active: v.is_active !== false,
    }
    if (v.id && existingIds.has(v.id as string)) {
      await supabase.from('product_variants').update(row).eq('id', v.id)
    } else {
      await supabase.from('product_variants').insert(row)
    }
  }

  await supabase.from('product_categories').delete().eq('product_id', id)
  for (const cid of category_ids as string[]) {
    if (cid) await supabase.from('product_categories').upsert({ product_id: id, category_id: cid }, { onConflict: 'product_id,category_id' })
  }

  if (Array.isArray(image_urls)) {
    await supabase.from('product_images').delete().eq('product_id', id)
    for (let i = 0; i < image_urls.length; i++) {
      await supabase.from('product_images').insert({
        product_id: id,
        url: image_urls[i],
        sort_order: i,
        is_primary: i === 0,
      })
    }
  }

  const { data: product } = await supabase
    .from('products')
    .select('*, product_variants(*), product_images(id, url, sort_order, is_primary)')
    .eq('id', id)
    .single()
  const mapped = product ? mapProductImages(product as { product_images?: { url: string; sort_order: number; is_primary: boolean }[] }) : null
  return NextResponse.json(mapped ?? {})
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth) return auth
  const { id } = await params
  const supabase = createAdminClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
