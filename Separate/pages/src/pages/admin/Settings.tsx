import { useEffect, useState, useRef } from 'react'
import { get, put } from '../../api/client'
import { HERO_DEFAULTS, HERO_KEYS, HERO_IMAGE_SPEC, mergeHeroSettings } from '../../lib/hero-settings'

const HERO_LABELS: Record<string, { label: string; multiline?: boolean }> = {
  hero_eyebrow: { label: 'Eyebrow (small gold text)' },
  hero_title_line1: { label: 'Headline line 1' },
  hero_title_line2: { label: 'Headline line 2 (gold)' },
  hero_subtitle: { label: 'Subtitle paragraph', multiline: true },
  hero_image_url: { label: 'Hero image URL' },
  hero_image_alt: { label: 'Image alt text' },
  hero_cta_men_label: { label: 'Shop Men — button label' },
  hero_cta_men_url: { label: 'Shop Men — link' },
  hero_cta_women_label: { label: 'Shop Women — button label' },
  hero_cta_women_url: { label: 'Shop Women — link' },
  hero_cta_finder_label: { label: 'Find My Scent — label' },
  hero_cta_finder_url: { label: 'Find My Scent — link' },
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    get<Record<string, string>>('/api/admin/settings')
      .then((data) => setSettings({ ...HERO_DEFAULTS, ...data }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await put<Record<string, string>>('/api/admin/settings', settings)
      setSettings({ ...HERO_DEFAULTS, ...updated })
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('slug', 'hero')
      const res = await fetch(
        `${(import.meta.env.VITE_WORKERS_API_URL as string || '').replace(/\/$/, '')}/api/admin/upload`,
        { method: 'POST', body: form, credentials: 'include' }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error || 'Upload failed')
      }
      const { url } = (await res.json()) as { url: string }
      setSettings((s) => ({ ...s, hero_image_url: url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  if (loading) return <div className="text-smoke">Loading…</div>
  if (error && Object.keys(settings).length === 0) {
    return <div className="text-red-400">{error}</div>
  }

  const hero = mergeHeroSettings(settings)
  const otherKeys = Object.keys(settings).filter((k) => !HERO_KEYS.includes(k)).sort()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-display text-ivory mb-2">Settings</h1>
      <p className="text-smoke text-sm mb-8">
        Homepage hero text and image appear on the store home page. Save after editing.
      </p>

      <form onSubmit={handleSave} className="space-y-10">
        <section className="border border-gold/30 rounded-lg p-6 bg-white/[0.02]">
          <h2 className="text-lg font-display text-gold mb-1">Homepage hero</h2>
          <p className="text-smoke text-sm mb-6">
            Image spec: <strong className="text-ivory">{HERO_IMAGE_SPEC.width}×{HERO_IMAGE_SPEC.height}px</strong>{' '}
            portrait ({HERO_IMAGE_SPEC.aspectRatio}), PNG/WebP. Product centered; displayed tilted (~8°) at{' '}
            {HERO_IMAGE_SPEC.width / 2}×{HERO_IMAGE_SPEC.height / 2}px on desktop.
          </p>

          <div className="mb-6 flex flex-wrap gap-4 items-start">
            {hero.hero_image_url ? (
              <div className="hero-image-frame shrink-0 scale-75 origin-top-left">
                <img src={hero.hero_image_url} alt="Hero preview" />
              </div>
            ) : (
              <div className="w-40 h-52 border border-dashed border-white/20 rounded flex items-center justify-center text-smoke text-xs text-center p-2">
                No image
              </div>
            )}
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleHeroUpload}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="px-4 py-2 rounded border border-gold text-gold text-sm hover:bg-gold hover:text-noir disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : 'Upload hero image'}
              </button>
              <p className="text-xs text-smoke max-w-xs">
                Or paste a URL below (e.g. from R2 / media CDN).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {HERO_KEYS.map((key) => {
              const meta = HERO_LABELS[key] ?? { label: key }
              return (
                <div key={key}>
                  <label className="block text-smoke text-sm mb-1">{meta.label}</label>
                  {meta.multiline ? (
                    <textarea
                      rows={3}
                      value={settings[key] ?? ''}
                      onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                      className="w-full px-4 py-2 rounded bg-white/5 border border-white/10 text-ivory focus:border-gold outline-none resize-y"
                    />
                  ) : (
                    <input
                      type="text"
                      value={settings[key] ?? ''}
                      onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                      className="w-full px-4 py-2 rounded bg-white/5 border border-white/10 text-ivory focus:border-gold outline-none"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {otherKeys.length > 0 && (
          <section>
            <h2 className="text-lg font-display text-ivory mb-4">Store settings</h2>
            <div className="space-y-4">
              {otherKeys.map((key) => (
                <div key={key}>
                  <label className="block text-smoke text-sm mb-1">{key}</label>
                  <input
                    type="text"
                    value={settings[key] ?? ''}
                    onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                    className="w-full px-4 py-2 rounded bg-white/5 border border-white/10 text-ivory focus:border-gold outline-none"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {saved && <p className="text-gold text-sm">Saved. Refresh the storefront home page to see changes.</p>}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded bg-gold text-noir font-medium disabled:opacity-50 hover:opacity-90"
        >
          {saving ? 'Saving…' : 'Save all settings'}
        </button>
      </form>
    </div>
  )
}
