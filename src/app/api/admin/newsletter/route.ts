import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth) return auth

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)))
  const offset = (page - 1) * limit

  const supabase = createAdminClient()
  const { count } = await supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true })
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, subscribed_at')
    .order('subscribed_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const total = count ?? 0
  return NextResponse.json({
    data: data ?? [],
    total,
    total_pages: Math.ceil(total / limit),
    page,
  })
}
