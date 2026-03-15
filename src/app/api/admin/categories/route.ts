import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const auth = await requireAdmin()
  if (auth) return auth

  const supabase = createAdminClient()
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const withCount = await Promise.all(
    (categories ?? []).map(async (cat) => {
      const { count } = await supabase
        .from('product_categories')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)
      return { ...cat, product_count: count ?? 0 }
    })
  )
  return NextResponse.json(withCount)
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth) return auth

  const body = await request.json()
  const { name, slug, description, parent_id, sort_order, is_active, banner_image, meta_title, meta_description } = body

  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const supabase = createAdminClient()
  const slugVal = (slug || name).toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: String(name).trim(),
      slug: slugVal || undefined,
      description: description ?? null,
      parent_id: parent_id ?? null,
      sort_order: typeof sort_order === 'number' ? sort_order : 0,
      is_active: is_active !== false,
      banner_image: banner_image ?? null,
      meta_title: meta_title ?? null,
      meta_description: meta_description ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
