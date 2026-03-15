'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const KEYS = {
  store: ['store_name', 'store_email', 'announcement_bar'],
  shipping: ['free_shipping_threshold', 'default_shipping_charge'],
  inventory: ['low_stock_threshold'],
  social: ['instagram_url', 'whatsapp_number'],
  seo: ['meta_title', 'meta_description'],
} as const

const LABELS: Record<string, string> = {
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

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((d) => {
        setSettings(typeof d === 'object' && d !== null ? d : {})
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const setValue = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    if (res.ok) {
      const d = await res.json()
      setSettings(d)
    } else {
      alert('Failed to save')
    }
  }

  if (loading) {
    return (
      <div>
        <div className="text-smoke">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-8">Settings</h1>

      <form onSubmit={save} className="space-y-10">
        {(Object.entries(KEYS) as [keyof typeof KEYS, readonly string[]][]).map(([section, keys]) => (
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
