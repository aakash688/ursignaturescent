import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth) return auth
  const { id } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('product_images')
    .select('id, url, sort_order, is_primary')
    .eq('product_id', id)
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth) return auth
  const { id } = await params
  const body = await request.json()
  const { url, sort_order = 0, is_primary = false } = body as { url?: string; sort_order?: number; is_primary?: boolean }
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url required' }, { status: 400 })
  }
  const supabase = createAdminClient()
  if (is_primary) {
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', id)
  }
  const { data, error } = await supabase
    .from('product_images')
    .insert({ product_id: id, url, sort_order, is_primary })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth) return auth
  const { id: productId } = await params
  const body = await request.json() as { id: string; sort_order?: number; is_primary?: boolean }
  const { id: imageId, sort_order, is_primary } = body
  if (!imageId) return NextResponse.json({ error: 'id (product_image id) required' }, { status: 400 })
  const supabase = createAdminClient()
  if (is_primary === true) {
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId)
  }
  const updates: { sort_order?: number; is_primary?: boolean } = {}
  if (typeof sort_order === 'number') updates.sort_order = sort_order
  if (typeof is_primary === 'boolean') updates.is_primary = is_primary
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates' }, { status: 400 })
  }
  const { data, error } = await supabase
    .from('product_images')
    .update(updates)
    .eq('id', imageId)
    .eq('product_id', productId)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth) return auth
  const { id: productId } = await params
  const imageId = request.nextUrl.searchParams.get('id')
  if (!imageId) return NextResponse.json({ error: 'Query id (product_image id) required' }, { status: 400 })
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId)
    .eq('product_id', productId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
