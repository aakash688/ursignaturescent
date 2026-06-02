'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) setStatus('success')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="py-12 sm:py-24 px-4 border-t border-white/5">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="font-display text-3xl sm:text-4xl text-ivory mb-4">Be the first to know</h2>
        <p className="text-smoke mb-8">Exclusive drops, offers, and fragrance guides.</p>
        {status === 'success' ? (
          <p className="text-gold">Thank you! You&apos;re on the list.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
              disabled={status === 'loading'}
              className="flex-1 bg-noir-elevated border border-white/10 rounded px-4 py-3 text-ivory placeholder:text-smoke/50 focus:outline-none focus:border-gold/50 disabled:opacity-50"
            />
            <Button type="submit" loading={status === 'loading'} disabled={status === 'loading'}>
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
        )}
        {status === 'error' && (
          <p className="text-red-400 text-sm mt-2">Something went wrong. Please try again.</p>
        )}
      </div>
    </section>
  )
}
