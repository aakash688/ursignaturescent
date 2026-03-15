import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth) return auth

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const from = (page - 1) * limit

  const supabase = createAdminClient()
  let query = supabase.from('profiles').select('id, email, full_name, phone, created_at', { count: 'exact' })

  if (q.trim()) {
    query = query.or(`email.ilike.%${q.trim()}%,full_name.ilike.%${q.trim()}%,phone.ilike.%${q.trim()}%`)
  }

  const { data: profiles, error, count } = await query.order('created_at', { ascending: false }).range(from, from + limit - 1)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const withStats = await Promise.all(
    (profiles ?? []).map(async (p) => {
      const { data: orders } = await supabase
        .from('orders')
        .select('id, total, created_at')
        .eq('user_id', p.id)
        .order('created_at', { ascending: false })
      const order_count = orders?.length ?? 0
      const total_spent = orders?.reduce((s, o) => s + (Number(o.total) || 0), 0) ?? 0
      const last_order_at = orders?.[0]?.created_at ?? null
      return { ...p, order_count, total_spent, last_order_at }
    })
  )

  const totalPages = count ? Math.ceil(count / limit) : 0
  return NextResponse.json({ data: withStats, count: count ?? 0, page, limit, total_pages: totalPages })
}
