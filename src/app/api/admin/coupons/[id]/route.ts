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
  const { data, error } = await supabase.from('coupons').select('*').eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth) return auth

  const { id } = await params
  const body = await request.json()
  const {
    code,
    type,
    value,
    min_order_value,
    max_discount,
    usage_limit,
    per_user_limit,
    expires_at,
    is_active,
  } = body

  const supabase = createAdminClient()
  const payload: Record<string, unknown> = {}
  if (code !== undefined) payload.code = String(code).toUpperCase().trim().replace(/\s+/g, '')
  if (type !== undefined) payload.type = type === 'percentage' ? 'percentage' : 'fixed'
  if (value !== undefined) payload.value = Math.max(0, Number(value))
  if (min_order_value !== undefined) payload.min_order_value = min_order_value == null ? null : Number(min_order_value)
  if (max_discount !== undefined) payload.max_discount = max_discount == null ? null : Number(max_discount)
  if (usage_limit !== undefined) payload.usage_limit = usage_limit == null ? null : Number(usage_limit)
  if (per_user_limit !== undefined) payload.per_user_limit = per_user_limit == null ? null : Number(per_user_limit)
  if (expires_at !== undefined) payload.expires_at = expires_at || null
  if (typeof is_active === 'boolean') payload.is_active = is_active

  const { data, error } = await supabase.from('coupons').update(payload).eq('id', id).select().single()
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
  const { error } = await supabase.from('coupons').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
