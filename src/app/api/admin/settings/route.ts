import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const auth = await requireAdmin()
  if (auth) return auth

  const supabase = createAdminClient()
  const { data, error } = await supabase.from('settings').select('key, value')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const obj: Record<string, string> = {}
  ;(data ?? []).forEach((r) => (obj[r.key] = r.value ?? ''))
  return NextResponse.json(obj)
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth) return auth

  const body = await request.json()
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Body must be key-value object' }, { status: 400 })
  }

  const supabase = createAdminClient()
  for (const [key, value] of Object.entries(body)) {
    const v = value == null ? '' : String(value)
    const { data: existing } = await supabase.from('settings').select('key').eq('key', key).single()
    if (existing) {
      await supabase.from('settings').update({ value: v }).eq('key', key)
    } else {
      await supabase.from('settings').insert({ key, value: v })
    }
  }

  const { data } = await supabase.from('settings').select('key, value')
  const obj: Record<string, string> = {}
  ;(data ?? []).forEach((r) => (obj[r.key] = r.value ?? ''))
  return NextResponse.json(obj)
}
