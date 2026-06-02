'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SITE_LOGO_KEY, DEFAULT_HORIZONTAL_LOGO, resolveSiteLogoUrl } from '@/lib/brand-settings'
import { HERO_DEFAULTS, HERO_KEYS, mergeHeroSettings } from '@/lib/hero-settings'
import {
  emptyHeroSlide,
  HERO_SLIDE_SPEC,
  HERO_SLIDES_KEY,
  parseHeroSlides,
  serializeHeroSlides,
  type HeroSlide,
} from '@/lib/hero-slides'
import { resolveMediaUrl } from '@/lib/media-url'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

const KEYS = {
  heroDefaults: HERO_KEYS.filter((k) => k !== 'hero_image_url' && k !== 'hero_image_alt'),
  store: ['store_name', 'store_email', 'announcement_bar'],
  shipping: ['free_shipping_threshold', 'default_shipping_charge'],
  inventory: ['low_stock_threshold'],
  social: ['instagram_url', 'whatsapp_number'],
  seo: ['meta_title', 'meta_description'],
} as const

const LABELS: Record<string, string> = {
  hero_eyebrow: 'Default eyebrow (small gold text)',
  hero_title_line1: 'Default headline line 1',
  hero_title_line2: 'Default headline line 2 (gold)',
  hero_subtitle: 'Default subtitle',
  hero_cta_men_label: 'Shop Men — button label',
  hero_cta_men_url: 'Shop Men — link',
  hero_cta_women_label: 'Shop Women — button label',
  hero_cta_women_url: 'Shop Women — link',
  hero_cta_finder_label: 'Find My Scent — label',
  hero_cta_finder_url: 'Find My Scent — link',
  store_name: 'Store name',
  store_email: 'Store email',
  announcement_bar: 'Announcement bar text',
  free_shipping_threshold: 'Free shipping above (₹)',
  default_shipping_charge: 'Default shipping charge (₹)',
  low_stock_threshold: 'Default low stock threshold',
  instagram_url: 'Instagram URL',
  whatsapp_number: 'WhatsApp number',
  meta_title: 'Default meta title',
  meta_description: 'Default meta description',
}

const MULTILINE_KEYS = new Set(['hero_subtitle', 'meta_description'])

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingSlideIndex, setUploadingSlideIndex] = useState<number | null>(null)
  const logoFileRef = useRef<HTMLInputElement>(null)
  const slideFileRefs = useRef<Record<number, HTMLInputElement | null>>({})

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((d) => {
        const data = typeof d === 'object' && d !== null ? (d as Record<string, string>) : {}
        setSettings({ ...HERO_DEFAULTS, ...data })
        const parsed = parseHeroSlides(data[HERO_SLIDES_KEY])
        setSlides(parsed.length ? parsed : [emptyHeroSlide()])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const setValue = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const persistSettings = async (next: Record<string, string>) => {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    })
    if (!res.ok) throw new Error('Failed to save settings')
    const saved = (await res.json()) as Record<string, string>
    setSettings({ ...HERO_DEFAULTS, ...saved })
    const parsed = parseHeroSlides(saved[HERO_SLIDES_KEY])
    if (parsed.length) setSlides(parsed)
    return saved
  }

  const persistSlides = async (nextSlides: HeroSlide[]) => {
    const json = serializeHeroSlides(nextSlides.filter((s) => s.image_url.trim() || nextSlides.length === 1))
    setSlides(nextSlides)
    const next = { ...settings, [HERO_SLIDES_KEY]: json }
    setSettings(next)
    await persistSettings(next)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const json = serializeHeroSlides(slides.filter((s) => s.image_url.trim()))
      await persistSettings({ ...settings, [HERO_SLIDES_KEY]: json })
    } catch {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('slug', 'logo')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`)
      if (!data.url) throw new Error('No URL returned from upload')
      const logoUrl = resolveMediaUrl(data.url)
      await persistSettings({ ...settings, [SITE_LOGO_KEY]: logoUrl })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Logo upload failed')
    } finally {
      setUploadingLogo(false)
      if (logoFileRef.current) logoFileRef.current.value = ''
    }
  }

  const uploadSlideImage = async (index: number, file: File) => {
    setUploadingSlideIndex(index)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('slug', 'hero')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`)
      if (!data.url) throw new Error('No URL returned from upload')
      const imageUrl = resolveMediaUrl(data.url)
      const next = slides.map((s, i) => (i === index ? { ...s, image_url: imageUrl } : s))
      await persistSlides(next)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Slide upload failed')
    } finally {
      setUploadingSlideIndex(null)
      const ref = slideFileRefs.current[index]
      if (ref) ref.value = ''
    }
  }

  const updateSlide = (index: number, patch: Partial<HeroSlide>) => {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  const moveSlide = (index: number, dir: -1 | 1) => {
    const j = index + dir
    if (j < 0 || j >= slides.length) return
    const next = [...slides]
    ;[next[index], next[j]] = [next[j], next[index]]
    void persistSlides(next)
  }

  const removeSlide = (index: number) => {
    if (slides.length <= 1) {
      void persistSlides([emptyHeroSlide()])
      return
    }
    void persistSlides(slides.filter((_, i) => i !== index))
  }

  const addSlide = () => {
    void persistSlides([...slides, emptyHeroSlide()])
  }

  if (loading) {
    return (
      <div>
        <div className="text-smoke">Loading...</div>
      </div>
    )
  }

  const logoPreviewUrl = resolveSiteLogoUrl(settings[SITE_LOGO_KEY])

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-ivory mb-2">Settings</h1>
      <p className="text-smoke text-sm mb-8">
        Store branding and homepage hero carousel. Uploads save automatically.
      </p>

      <form onSubmit={save} className="space-y-10">
        <div>
          <h2 className="font-display text-lg text-gold mb-1">Store logo</h2>
          <p className="text-smoke text-sm mb-4">
            Horizontal logo for nav and footer. Wide PNG recommended (e.g. 800×200px).
          </p>
          <div className="bg-white/5 border border-gold/30 rounded-lg p-6 space-y-4">
            <div className="rounded-lg bg-noir border border-white/10 p-6 flex items-center justify-center min-h-[80px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoPreviewUrl}
                alt="Current store logo"
                className="max-h-16 w-auto max-w-full object-contain"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                ref={logoFileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploadingLogo}
                onClick={() => logoFileRef.current?.click()}
              >
                {uploadingLogo ? 'Uploading…' : 'Upload new logo'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open(logoPreviewUrl, '_blank', 'noopener,noreferrer')}
              >
                View full size
              </Button>
            </div>
            <Input
              label="Logo URL (advanced)"
              value={settings[SITE_LOGO_KEY] ?? ''}
              onChange={(e) => setValue(SITE_LOGO_KEY, e.target.value)}
              placeholder={DEFAULT_HORIZONTAL_LOGO}
              className="bg-noir border-white/10 text-ivory"
            />
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg text-gold mb-1">Hero campaign slides</h2>
          <div className="text-smoke text-sm mb-4 space-y-3">
            <p>
              Full-width billboard carousel — one campaign per slide (brand, product launch, sale).
              Set headline, subtitle, and CTA per slide. Upload{' '}
              <strong className="text-ivory">3–4 landscape banners</strong>; drag to reorder priority.
            </p>
            <div className="bg-noir/80 border border-white/10 rounded-lg p-4 text-xs space-y-2">
              <p className="text-gold uppercase tracking-wider font-nav text-[10px]">
                Designer asset spec
              </p>
              <ul className="list-disc list-inside space-y-1 text-smoke-light">
                <li>
                  <strong className="text-ivory">Primary size:</strong> {HERO_SLIDE_SPEC.width}×
                  {HERO_SLIDE_SPEC.height}px ({HERO_SLIDE_SPEC.aspectRatio} landscape)
                </li>
                <li>
                  <strong className="text-ivory">Format:</strong> {HERO_SLIDE_SPEC.format} (max ~
                  {HERO_SLIDE_SPEC.maxSizeKb} KB per slide)
                </li>
                <li>
                  <strong className="text-ivory">Alternate:</strong> {HERO_SLIDE_SPEC.alternateWidth}×
                  {HERO_SLIDE_SPEC.alternateHeight}px for taller cinematic scenes
                </li>
                <li>
                  <strong className="text-ivory">Do not</strong> embed headlines, feature bullets, or
                  buttons in the image — text is overlaid from fields below
                </li>
                <li>Visual only: bottle + environment (mood, lighting, smoke, landscape)</li>
                <li>Background: dark ({HERO_SLIDE_SPEC.backgroundColors.join(', ')}) — no white packshots</li>
                <li>Keep left third relatively clear for text overlay readability</li>
                <li>
                  <strong className="text-ivory">Safe zones:</strong> left {HERO_SLIDE_SPEC.safeZoneLeft};{' '}
                  {HERO_SLIDE_SPEC.safeZoneTop}
                </li>
              </ul>
            </div>
            <p className="text-xs">
              Fill in slide CTA label + link for each campaign. Leave headline/subtitle empty to use
              fallback defaults below.
            </p>
          </div>
          <div className="space-y-4">
            {slides.map((slide, index) => {
              const preview = resolveMediaUrl(slide.image_url)
              const headline = slide.title_line1 || settings.hero_title_line1 || 'Slide headline'
              return (
                <div
                  key={index}
                  className="bg-white/5 border border-gold/30 rounded-lg p-5 space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-ivory font-display text-sm">
                      Slide {index + 1}: {headline}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        aria-label="Move up"
                        disabled={index === 0}
                        onClick={() => moveSlide(index, -1)}
                        className="p-1.5 text-smoke hover:text-gold disabled:opacity-30"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label="Move down"
                        disabled={index === slides.length - 1}
                        onClick={() => moveSlide(index, 1)}
                        className="p-1.5 text-smoke hover:text-gold disabled:opacity-30"
                      >
                        <ChevronDown size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label="Remove slide"
                        onClick={() => removeSlide(index)}
                        className="p-1.5 text-smoke hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 items-start">
                    <div className="w-full sm:w-40 aspect-video rounded-lg overflow-hidden bg-noir border border-white/10">
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-smoke text-xs p-2 text-center">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        ref={(el) => {
                          slideFileRefs.current[index] = el
                        }}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) void uploadSlideImage(index, f)
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingSlideIndex === index}
                        onClick={() => slideFileRefs.current[index]?.click()}
                      >
                        {uploadingSlideIndex === index ? 'Uploading…' : 'Upload slide image'}
                      </Button>
                      {preview ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => window.open(preview, '_blank', 'noopener,noreferrer')}
                        >
                          View full size
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <Input
                    label="Image alt text"
                    value={slide.alt ?? ''}
                    onChange={(e) => updateSlide(index, { alt: e.target.value })}
                    className="bg-noir border-white/10 text-ivory"
                  />
                  <Input
                    label="Eyebrow (optional override)"
                    value={slide.eyebrow ?? ''}
                    onChange={(e) => updateSlide(index, { eyebrow: e.target.value })}
                    className="bg-noir border-white/10 text-ivory"
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Headline line 1"
                      value={slide.title_line1 ?? ''}
                      onChange={(e) => updateSlide(index, { title_line1: e.target.value })}
                      className="bg-noir border-white/10 text-ivory"
                    />
                    <Input
                      label="Headline line 2"
                      value={slide.title_line2 ?? ''}
                      onChange={(e) => updateSlide(index, { title_line2: e.target.value })}
                      className="bg-noir border-white/10 text-ivory"
                    />
                  </div>
                  <div>
                    <label className="block text-smoke text-sm mb-1">Subtitle (optional)</label>
                    <textarea
                      rows={2}
                      value={slide.subtitle ?? ''}
                      onChange={(e) => updateSlide(index, { subtitle: e.target.value })}
                      className="w-full px-4 py-2 rounded bg-noir border border-white/10 text-ivory focus:border-gold outline-none resize-y"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Campaign CTA label"
                      value={slide.cta_label ?? ''}
                      onChange={(e) => updateSlide(index, { cta_label: e.target.value })}
                      placeholder="Shop Now"
                      className="bg-noir border-white/10 text-ivory"
                    />
                    <Input
                      label="Campaign CTA link"
                      value={slide.cta_url ?? ''}
                      onChange={(e) => updateSlide(index, { cta_url: e.target.value })}
                      placeholder="/collections"
                      className="bg-noir border-white/10 text-ivory"
                    />
                  </div>
                </div>
              )
            })}
            <Button type="button" variant="outline" onClick={addSlide}>
              Add slide
            </Button>
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg text-gold mb-1">Fallback defaults</h2>
          <p className="text-smoke text-sm mb-4">
            Used when a slide leaves headline, subtitle, or CTA empty. Shop Men / Women links below
            are legacy — navigation now lives in the Quick Shop strip under the hero.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
            {KEYS.heroDefaults.map((key) =>
              MULTILINE_KEYS.has(key) ? (
                <div key={key}>
                  <label className="block text-smoke text-sm mb-1">{LABELS[key] || key}</label>
                  <textarea
                    rows={3}
                    value={settings[key] ?? ''}
                    onChange={(e) => setValue(key, e.target.value)}
                    className="w-full px-4 py-2 rounded bg-noir border border-white/10 text-ivory focus:border-gold outline-none resize-y"
                  />
                </div>
              ) : (
                <Input
                  key={key}
                  label={LABELS[key] || key}
                  value={settings[key] ?? ''}
                  onChange={(e) => setValue(key, e.target.value)}
                  className="bg-noir border-white/10 text-ivory"
                />
              )
            )}
          </div>
        </div>

        {(Object.entries(KEYS) as [keyof typeof KEYS, readonly string[]][])
          .filter(([section]) => section !== 'heroDefaults')
          .map(([section, keys]) => (
            <div key={section}>
              <h2 className="font-display text-lg text-ivory mb-4 capitalize">{section}</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
                {keys.map((key) => (
                  <Input
                    key={key}
                    label={LABELS[key] || key}
                    value={settings[key] ?? ''}
                    onChange={(e) => setValue(key, e.target.value)}
                    className="bg-noir border-white/10 text-ivory"
                  />
                ))}
              </div>
            </div>
          ))}

        <Button type="submit" loading={saving} disabled={saving}>
          Save settings
        </Button>
      </form>
    </div>
  )
}
