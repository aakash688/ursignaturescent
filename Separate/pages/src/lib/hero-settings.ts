/** Default homepage hero copy (used when settings keys are empty). */
export const HERO_DEFAULTS: Record<string, string> = {
  hero_eyebrow: 'Premium Inspired Fragrances',
  hero_title_line1: 'Your Scent.',
  hero_title_line2: 'Your Identity.',
  hero_subtitle:
    "The world's finest fragrances, reimagined for you. Inspired by luxury. Priced for real life.",
  hero_image_url: '',
  hero_image_alt: 'URsignature Fragrance',
  hero_cta_men_label: 'Shop Men',
  hero_cta_men_url: '/collections/men',
  hero_cta_women_label: 'Shop Women',
  hero_cta_women_url: '/collections/women',
  hero_cta_finder_label: 'Find My Scent',
  hero_cta_finder_url: '/fragrance-finder',
}

export const HERO_KEYS = Object.keys(HERO_DEFAULTS)

export function mergeHeroSettings(api: Record<string, string>): Record<string, string> {
  return { ...HERO_DEFAULTS, ...api }
}

/** Recommended upload size for hero product image (documented in admin UI). */
export const HERO_IMAGE_SPEC = {
  width: 800,
  height: 1100,
  aspectRatio: '380:520',
  note: 'Portrait PNG/WebP with transparent background. Product centered; slight rotation crops edges.',
}
