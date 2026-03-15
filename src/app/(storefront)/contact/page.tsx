'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
        }),
      })
      if (res.ok) {
        setStatus('success')
        form.reset()
      } else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl text-ivory mb-4">Contact Us</h1>
      <p className="text-smoke mb-12">
        Have a question? We&apos;d love to hear from you. Reach out via the form below or WhatsApp.
      </p>

      {status === 'success' && (
        <p className="text-gold mb-6">Thank you! We&apos;ll get back to you soon.</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input name="name" label="Name" required placeholder="Your name" />
        <Input name="email" type="email" label="Email" required placeholder="your@email.com" />
        <div>
          <label className="block text-sm text-smoke mb-2">Message</label>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="How can we help?"
            className="w-full bg-noir-elevated border border-white/10 rounded px-4 py-3 text-ivory placeholder:text-smoke/50 focus:outline-none focus:border-gold/50"
          />
        </div>
        <Button type="submit" loading={status === 'loading'} disabled={status === 'loading'}>
          {status === 'loading' ? 'Sending...' : 'Send Message'}
        </Button>
      </form>

      <div className="mt-12 pt-12 border-t border-white/5">
        <p className="text-smoke text-sm">Prefer WhatsApp? Message us at +91 99999 99999</p>
      </div>
    </div>
  )
}
