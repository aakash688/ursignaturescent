import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth) return auth

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const payment_status = searchParams.get('payment_status')
  const fromDate = searchParams.get('from')
  const toDate = searchParams.get('to')
  const q = searchParams.get('q')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const from = (page - 1) * limit

  const supabase = createAdminClient()
  let query = supabase
    .from('orders')
    .select('id, order_number, user_id, guest_email, guest_phone, status, payment_status, subtotal, discount, shipping_charge, total, created_at', { count: 'exact' })

  if (status) query = query.eq('status', status)
  if (payment_status) query = query.eq('payment_status', payment_status)
  if (fromDate) query = query.gte('created_at', `${fromDate}T00:00:00.000Z`)
  if (toDate) query = query.lte('created_at', `${toDate}T23:59:59.999Z`)
  if (q) {
    const qq = q.trim()
    query = query.or(`order_number.ilike.%${qq}%,guest_email.ilike.%${qq}%,guest_phone.ilike.%${qq}%`)
  }

  const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, from + limit - 1)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const totalPages = count ? Math.ceil(count / limit) : 0
  return NextResponse.json({ data: data ?? [], count: count ?? 0, page, limit, total_pages: totalPages })
}
