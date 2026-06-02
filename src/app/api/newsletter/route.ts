import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { error } = await supabase.from('newsletter_subscribers').upsert(
      { email: trimmed, subscribed_at: new Date().toISOString() },
      { onConflict: 'email' }
    )
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
