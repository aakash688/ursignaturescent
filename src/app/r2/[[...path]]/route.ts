import { NextRequest, NextResponse } from 'next/server'
import { getObjectFromR2, isAllowedR2Key } from '@/lib/r2'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params
  const key = path?.join('/') ?? ''
  if (!key || !isAllowedR2Key(key)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const obj = await getObjectFromR2(key)
  if (!obj) {
    return new NextResponse('Not found', { status: 404 })
  }

  const headers = new Headers()
  if (obj.contentType) headers.set('Content-Type', obj.contentType)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  return new NextResponse(obj.body as BodyInit, { headers })
}
