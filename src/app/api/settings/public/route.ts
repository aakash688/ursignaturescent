import { NextResponse } from 'next/server'
import { getPublicSettings } from '@/lib/settings-public'

export async function GET() {
  const settings = await getPublicSettings()
  return NextResponse.json(settings)
}
