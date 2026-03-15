import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/** PATCH: Set this product_image as the primary image (and unset others for the same product). Admin only. */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data: row, error: fetchErr } = await admin
    .from('product_images')
    .select('id, product_id')
    .eq('id', id)
    .single()

  if (fetchErr || !row) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  await admin
    .from('product_images')
    .update({ is_primary: false })
    .eq('product_id', row.product_id)

  const { error: updateErr } = await admin
    .from('product_images')
    .update({ is_primary: true })
    .eq('id', id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
