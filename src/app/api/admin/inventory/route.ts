import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth) return auth

  const { searchParams } = new URL(request.url)
  const low_stock_only = searchParams.get('low_stock_only') === 'true'
  const product_id = searchParams.get('product_id')

  const supabase = createAdminClient()
  let query = supabase
    .from('product_variants')
    .select('id, product_id, size_ml, sku, stock_quantity, low_stock_threshold, is_active, products(name, slug)')

  if (product_id) query = query.eq('product_id', product_id)

  const { data: variants, error } = await query.order('product_id').order('size_ml')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let list = variants ?? []
  if (low_stock_only) {
    list = list.filter((v) => v.stock_quantity <= v.low_stock_threshold)
  }
  return NextResponse.json(list)
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth) return auth

  const body = await request.json()
  const { variant_id, type, quantity_change, note } = body

  if (!variant_id || !type || quantity_change === undefined) {
    return NextResponse.json(
      { error: 'variant_id, type (restock|adjustment), and quantity_change required' },
      { status: 400 }
    )
  }

  const t = type === 'restock' || type === 'adjustment' ? type : 'adjustment'
  const delta = Number(quantity_change) || 0
  if (delta === 0) return NextResponse.json({ error: 'quantity_change must not be 0' }, { status: 400 })

  const supabase = createAdminClient()
  const authSupabase = await createClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  const { data: variant, error: fetchErr } = await supabase
    .from('product_variants')
    .select('id, stock_quantity')
    .eq('id', variant_id)
    .single()

  if (fetchErr || !variant) return NextResponse.json({ error: 'Variant not found' }, { status: 404 })

  const current = Number(variant.stock_quantity) || 0
  const quantity_after = Math.max(0, current + delta)

  const { error: updateErr } = await supabase
    .from('product_variants')
    .update({ stock_quantity: quantity_after, updated_at: new Date().toISOString() })
    .eq('id', variant_id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  await supabase.from('inventory_transactions').insert({
    variant_id,
    type: t,
    quantity_change: delta,
    quantity_after,
    order_id: null,
    note: note ?? null,
    created_by: user?.id ?? null,
  })

  return NextResponse.json({ variant_id, quantity_after, previous: current })
}
