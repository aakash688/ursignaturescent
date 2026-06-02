import { createAdminClient } from '@/lib/supabase/server'
import { SITE_LOGO_KEY } from '@/lib/brand-settings'
import { HERO_SLIDES_KEY } from '@/lib/hero-slides'
import { HERO_PUBLIC_KEYS } from '@/lib/hero-settings'

const PUBLIC_KEYS = [
  'instagram_url',
  'whatsapp_number',
  'announcement_bar',
  'store_name',
  'store_email',
  SITE_LOGO_KEY,
  HERO_SLIDES_KEY,
  ...HERO_PUBLIC_KEYS,
] as const

export type PublicSettings = Partial<Record<(typeof PUBLIC_KEYS)[number], string>>

export async function getPublicSettings(): Promise<PublicSettings> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('settings').select('key, value').in('key', [...PUBLIC_KEYS])
  if (error) return {}
  const obj: PublicSettings = {}
  ;(data ?? []).forEach((r) => (obj[r.key as (typeof PUBLIC_KEYS)[number]] = r.value ?? ''))
  return obj
}
