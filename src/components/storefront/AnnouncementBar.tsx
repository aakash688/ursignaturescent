'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AnnouncementBar({ initialAnnouncement }: { initialAnnouncement?: string } = {}) {
  const defaultText = '✨ Free shipping on orders above ₹999 | Premium Fragrances at Honest Prices'
  const [text, setText] = useState(initialAnnouncement?.trim() || defaultText)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (initialAnnouncement?.trim()) {
      setText(initialAnnouncement.trim())
      return
    }
    const supabase = createClient()
    void supabase.from('settings').select('value').eq('key', 'announcement_bar').single()
      .then(({ data }) => {
        if (data?.value) setText(data.value)
      })
  }, [initialAnnouncement])

  if (dismissed) return null

  return (
    <div className="bg-gold text-noir py-2 px-4 text-center text-sm font-medium relative">
      <span>{text}</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  )
}
