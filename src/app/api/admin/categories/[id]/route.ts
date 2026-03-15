import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { createAdminClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth) return auth

  const { id } = await params
  const body = await request.json()
  const { name, slug, description, parent_id, sort_order, is_active, banner_image, meta_title, meta_description } = body

  const supabase = createAdminClient()
  const payload: Record<string, unknown> = {}
  if (name !== undefined) payload.name = String(name).trim()
  if (slug !== undefined) payload.slug = String(slug).toLowerCase().trim().replace(/\s+/g, '-')
  if (description !== undefined) payload.description = description ?? null
  if (parent_id !== undefined) payload.parent_id = parent_id ?? null
  if (typeof sort_order === 'number') payload.sort_order = sort_order
  if (typeof is_active === 'boolean') payload.is_active = is_active
  if (banner_image !== undefined) payload.banner_image = banner_image ?? null
  if (meta_title !== undefined) payload.meta_title = meta_title ?? null
  if (meta_description !== undefined) payload.meta_description = meta_description ?? null
  payload.updated_at = new Date().toISOString()

  const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth) return auth

  const { id } = await params
  const supabase = createAdminClient()

  const { count } = await supabase
    .from('product_categories')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)

  if (count && count > 0) {
    return NextResponse.json(
      { error: 'Cannot delete category that has products. Remove products from category first.' },
      { status: 400 }
    )
  }

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
