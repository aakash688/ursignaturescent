import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { uploadToR2 } from '@/lib/r2'

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth) return auth

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const slug = (formData.get('slug') as string)?.trim() || ''
    const slugVal = slugify(slug)

    if (!file || !file.size) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/jpeg/, 'jpg')
    const safeName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase()
      .slice(0, 40)
    // Product images go in products/{product-slug}/; use slug from form (set by admin from product name/slug)
    const key =
      slugVal === 'hero'
        ? `hero/${Date.now()}-${safeName}.${ext}`
        : slugVal === 'logo' || slugVal === 'logo-horizontal'
          ? `logo/${Date.now()}-${safeName}.${ext}`
          : slugVal && slugVal !== 'misc'
            ? `products/${slugVal}/${Date.now()}-${safeName}.${ext}`
            : `misc/${Date.now()}-${safeName}.${ext}`

    const contentType = file.type || (ext === 'png' ? 'image/png' : ext === 'jpg' ? 'image/jpeg' : 'image/webp')
    const url = await uploadToR2(key, buffer, contentType)
    return NextResponse.json({ url })
  } catch (err) {
    console.error('Upload error:', err)
    const message = err instanceof Error ? err.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
