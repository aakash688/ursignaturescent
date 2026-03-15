'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface ProfileFormProps {
  user: User
  profile: { full_name?: string | null; phone?: string | null } | null
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [name, setName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.from('profiles').update({ full_name: name, phone: phone || null, updated_at: new Date().toISOString() }).eq('id', user.id)
      setSaved(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input label="Email" type="email" value={user.email || ''} disabled />
      <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Button type="submit" loading={loading} disabled={loading}>{saved ? 'Saved' : 'Save changes'}</Button>
    </form>
  )
}
