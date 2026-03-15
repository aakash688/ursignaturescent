import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const auth = await requireAdmin()
  if (auth) return auth

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth) return auth

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

  if (!code || !type || value === undefined) {
    return NextResponse.json({ error: 'code, type (percentage|fixed), and value required' }, { status: 400 })
  }

  const codeStr = String(code).toUpperCase().trim().replace(/\s+/g, '')
  if (!codeStr) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: existing } = await supabase.from('coupons').select('id').eq('code', codeStr).single()
  if (existing) return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })

  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code: codeStr,
      type: type === 'percentage' ? 'percentage' : 'fixed',
      value: Math.max(0, Number(value)),
      min_order_value: min_order_value != null ? Number(min_order_value) : null,
      max_discount: max_discount != null ? Number(max_discount) : null,
      usage_limit: usage_limit != null ? Number(usage_limit) : null,
      per_user_limit: per_user_limit != null ? Number(per_user_limit) : null,
      expires_at: expires_at || null,
      is_active: is_active !== false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
