import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mapProductImages, mapProductImagesList } from '@/lib/product-images'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const category = searchParams.get('category')

  const supabase = await createClient()

  if (slug) {
    const { data: raw, error } = await supabase
      .from('products')
      .select('*, product_variants(*), product_images(url, sort_order, is_primary)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !raw) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(mapProductImages(raw))
  }

  let query = supabase
    .from('products')
    .select('*, product_variants(*), product_images(url, sort_order, is_primary)', { count: 'exact' })
    .eq('is_active', true)

  if (category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).single()
    if (cat) {
      const { data: pc } = await supabase.from('product_categories').select('product_id').eq('category_id', cat.id)
      const ids = pc?.map((p) => p.product_id) || []
      if (ids.length) query = query.in('id', ids)
    }
  }

  const { data, error, count } = await query.order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: mapProductImagesList(data || []), count: count || 0 })
}
