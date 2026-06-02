import { Link } from 'react-router-dom'
import { mergeHeroSettings } from '../../lib/hero-settings'

type Props = {
  settings: Record<string, string>
  /** Fallback when hero_image_url is empty (e.g. first featured product image). */
  fallbackImageUrl?: string
}

export default function HeroSection({ settings: raw, fallbackImageUrl }: Props) {
  const s = mergeHeroSettings(raw)
  const imageUrl = (s.hero_image_url || fallbackImageUrl || '').trim()
  const alt = s.hero_image_alt || 'URsignature Fragrance'

  return (
    <section className="relative min-h-[min(100vh,900px)] flex items-center overflow-hidden bg-noir">
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 60% 80% at 70% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16 grid lg:grid-cols-2 items-center gap-10 lg:gap-12 pt-28 pb-16 lg:pt-24 lg:pb-20">
        <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
          <p className="text-[10px] sm:text-xs tracking-[0.45em] text-gold uppercase">
            {s.hero_eyebrow}
          </p>

          <div className="space-y-1">
            <h1
              className="font-display text-ivory italic font-light leading-[0.95]"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)' }}
            >
              {s.hero_title_line1}
            </h1>
            <h1
              className="font-display text-gold font-medium leading-[0.95]"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)' }}
            >
              {s.hero_title_line2}
            </h1>
          </div>

          <p className="text-smoke text-base sm:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
            {s.hero_subtitle}
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
            <Link
              to={s.hero_cta_men_url || '/products'}
              className="inline-flex h-12 px-6 sm:px-8 border border-gold text-gold text-[11px] tracking-[0.25em] uppercase items-center justify-center hover:bg-gold hover:text-noir transition-colors no-underline hover:no-underline"
            >
              {s.hero_cta_men_label}
            </Link>
            <Link
              to={s.hero_cta_women_url || '/products'}
              className="inline-flex h-12 px-6 sm:px-8 border border-gold/40 text-ivory/90 text-[11px] tracking-[0.25em] uppercase items-center justify-center hover:border-gold hover:bg-gold hover:text-noir transition-colors no-underline hover:no-underline"
            >
              {s.hero_cta_women_label}
            </Link>
            <Link
              to={s.hero_cta_finder_url || '/fragrance-finder'}
              className="inline-flex h-12 px-4 text-gold/80 text-[11px] tracking-[0.25em] uppercase items-center gap-2 hover:text-gold transition-colors no-underline hover:no-underline"
            >
              <span>{s.hero_cta_finder_label}</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="relative hidden lg:flex items-center justify-center min-h-[520px]">
          <div className="absolute w-64 h-64 rounded-full bg-gold/10 blur-[80px]" />
          <div
            className="absolute w-[400px] h-[400px] rounded-full border border-gold/10"
            style={{ animation: 'spin 30s linear infinite' }}
          />
          <div
            className="absolute w-[300px] h-[300px] rounded-full border border-gold/5"
            style={{ animation: 'spin 20s linear infinite reverse' }}
          />

          {imageUrl ? (
            <div className="animate-float hero-image-frame relative z-10">
              <img src={imageUrl} alt={alt} loading="eager" />
            </div>
          ) : (
            <div className="hero-image-frame relative z-10 flex items-center justify-center border border-dashed border-white/20 rounded-lg bg-white/5">
              <p className="text-smoke text-sm text-center px-4">
                Set hero image in Admin → Settings
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <span className="text-[9px] tracking-[0.4em] text-smoke uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-gold to-transparent" />
      </div>
    </section>
  )
}
