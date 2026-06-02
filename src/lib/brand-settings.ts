import { resolveMediaUrl } from '@/lib/media-url'

export const SITE_LOGO_KEY = 'site_logo_url' as const

/** Bundled horizontal logo (gold on black) — used when no custom logo in settings. */
export const DEFAULT_HORIZONTAL_LOGO = '/logo-horizontal.png'

export function resolveSiteLogoUrl(url?: string | null): string {
  const trimmed = url?.trim()
  if (!trimmed) return DEFAULT_HORIZONTAL_LOGO
  return resolveMediaUrl(trimmed) || trimmed
}
