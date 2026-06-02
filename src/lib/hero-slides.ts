import { HERO_DEFAULTS } from '@/lib/hero-settings'
import { resolveMediaUrl } from '@/lib/media-url'

export const HERO_SLIDES_KEY = 'hero_slides' as const

/** Designer deliverable spec — full-width campaign billboard (landscape) */
export const HERO_SLIDE_SPEC = {
  width: 1920,
  height: 800,
  aspectRatio: '12:5',
  format: 'WebP',
  maxSizeKb: 400,
  alternateWidth: 1920,
  alternateHeight: 1080,
  backgroundColors: ['#0A0A0A', '#1A1A1A'],
  accentColor: '#C9A84C',
  safeZoneLeft: '42% width — keep darker/less busy for text overlay',
  safeZoneTop: 'Top 15% — keep subtle for gradient scrim blend',
  notes:
    'Full-width campaign billboard (1920×800). Visual only — no headlines, bullets, or CTAs in the image. Copy is overlaid from admin on desktop. Mobile uses stacked layout — keep bottle in upper-right 40% of image; left 50% can be atmosphere only.',
} as const

export type HeroFocalPoint = 'left' | 'center' | 'right'

export type HeroSlide = {
  image_url: string
  alt?: string
  eyebrow?: string
  title_line1?: string
  title_line2?: string
  subtitle?: string
  cta_label?: string
  cta_url?: string
  focal_point?: HeroFocalPoint
}

export function emptyHeroSlide(): HeroSlide {
  return { image_url: '' }
}

export function parseHeroSlides(raw: string | undefined | null): HeroSlide[] {
  if (!raw?.trim()) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((s): s is Record<string, unknown> => typeof s === 'object' && s !== null)
      .map((s) => ({
        image_url: String(s.image_url ?? ''),
        alt: s.alt != null ? String(s.alt) : undefined,
        eyebrow: s.eyebrow != null ? String(s.eyebrow) : undefined,
        title_line1: s.title_line1 != null ? String(s.title_line1) : undefined,
        title_line2: s.title_line2 != null ? String(s.title_line2) : undefined,
        subtitle: s.subtitle != null ? String(s.subtitle) : undefined,
        cta_label: s.cta_label != null ? String(s.cta_label) : undefined,
        cta_url: s.cta_url != null ? String(s.cta_url) : undefined,
        focal_point:
          s.focal_point === 'left' || s.focal_point === 'center' || s.focal_point === 'right'
            ? (s.focal_point as HeroFocalPoint)
            : undefined,
      }))
      .filter((s) => s.image_url.trim())
  } catch {
    return []
  }
}

export function serializeHeroSlides(slides: HeroSlide[]): string {
  return JSON.stringify(slides)
}

/** Merge slide copy with global hero defaults from settings. */
export function resolveSlideCopy(
  slide: HeroSlide,
  globals: Record<string, string>
): {
  eyebrow: string
  line1: string
  line2: string
  subtitle: string
  ctaLabel: string | null
  ctaUrl: string | null
  imageSrc: string
  imageAlt: string
} {
  const g = { ...HERO_DEFAULTS, ...globals }
  return {
    eyebrow: slide.eyebrow?.trim() || g.hero_eyebrow,
    line1: slide.title_line1?.trim() || g.hero_title_line1,
    line2: slide.title_line2?.trim() || g.hero_title_line2,
    subtitle: slide.subtitle?.trim() || g.hero_subtitle,
    ctaLabel: slide.cta_label?.trim() || null,
    ctaUrl: slide.cta_url?.trim() || null,
    imageSrc: resolveMediaUrl(slide.image_url),
    imageAlt: slide.alt?.trim() || g.hero_image_alt,
  }
}

/** Build slides from hero_slides JSON or legacy single hero_image_url. */
export function buildHeroSlides(
  settings: Record<string, string>,
  featuredImage?: string
): HeroSlide[] {
  const fromJson = parseHeroSlides(settings[HERO_SLIDES_KEY])
  if (fromJson.length) return fromJson

  const legacyUrl =
    resolveMediaUrl(settings.hero_image_url) ||
    resolveMediaUrl(featuredImage) ||
    featuredImage ||
    ''
  if (!legacyUrl) return []

  return [
    {
      image_url: legacyUrl,
      alt: settings.hero_image_alt || HERO_DEFAULTS.hero_image_alt,
      eyebrow: settings.hero_eyebrow,
      title_line1: settings.hero_title_line1,
      title_line2: settings.hero_title_line2,
      subtitle: settings.hero_subtitle,
    },
  ]
}

/** CSS class for hero image focal crop (brand vs product slides). */
export function resolveSlideFocalClass(slide: HeroSlide, slideIndex = 0): string {
  if (slide.focal_point === 'left') return 'hero-billboard-img--brand'
  if (slide.focal_point === 'right') return 'hero-billboard-img--product'
  if (slide.focal_point === 'center') return 'hero-billboard-img--brand'

  const url = slide.image_url.toLowerCase()
  if (url.includes('all-fragrances') || url.includes('all-combined') || slideIndex === 0) {
    return 'hero-billboard-img--brand'
  }
  return 'hero-billboard-img--product'
}
