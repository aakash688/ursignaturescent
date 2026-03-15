import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { name, email, message, subject } = await request.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }
    const supabase = createAdminClient()
    await supabase.from('contact_messages').insert({
      name: String(name).trim(),
      email: String(email).trim(),
      subject: subject ? String(subject).trim() : null,
      message: String(message).trim(),
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
