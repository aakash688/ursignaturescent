import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth) return auth

  const { searchParams } = new URL(request.url)
  const unread_only = searchParams.get('unread_only') === 'true'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const from = (page - 1) * limit

  const supabase = createAdminClient()
  let query = supabase
    .from('contact_messages')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (unread_only) query = query.eq('is_read', false)

  const { data, error, count } = await query.range(from, from + limit - 1)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const totalPages = count ? Math.ceil(count / limit) : 0
  return NextResponse.json({ data: data ?? [], count: count ?? 0, page, limit, total_pages: totalPages })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth) return auth

  const body = await request.json()
  const { id, is_read } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('contact_messages')
    .update({ is_read: Boolean(is_read) })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
