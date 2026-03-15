import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth) return auth

  const { id } = await params
  const supabase = createAdminClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id)
  return NextResponse.json({ ...order, order_items: items ?? [] })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth) return auth

  const { id } = await params
  const body = await request.json()
  const { status, admin_notes } = body

  const supabase = createAdminClient()
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (status !== undefined) payload.status = status
  if (admin_notes !== undefined) payload.admin_notes = admin_notes

  const { data: existing } = await supabase.from('orders').select('status').eq('id', id).single()
  const { data: order, error } = await supabase.from('orders').update(payload).eq('id', id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (status !== undefined && existing?.status !== status) {
    await supabase.from('order_status_history').insert({
      order_id: id,
      status,
      admin_id: user?.id ?? null,
    })
  }

  return NextResponse.json(order)
}
