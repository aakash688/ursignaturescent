import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth) return auth

  const { searchParams } = new URL(request.url)
  const approved = searchParams.get('approved')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const from = (page - 1) * limit

  const supabase = createAdminClient()
  let query = supabase
    .from('reviews')
    .select('*, products(id, name, slug)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (approved === 'true') query = query.eq('is_approved', true)
  if (approved === 'false') query = query.eq('is_approved', false)

  const { data, error, count } = await query.range(from, from + limit - 1)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const totalPages = count ? Math.ceil(count / limit) : 0
  return NextResponse.json({ data: data ?? [], count: count ?? 0, page, limit, total_pages: totalPages })
}
