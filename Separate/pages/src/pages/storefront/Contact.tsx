import { useState } from 'react'
import { post } from '../../api/client'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await post('/api/contact', { name, email, subject, message })
      setStatus('success')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-3xl font-display text-ivory mb-2">Contact</h1>
      <p className="text-smoke mb-6">Send us a message and we’ll get back to you.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 rounded bg-white/5 border border-white/10 text-ivory placeholder:text-smoke focus:border-gold outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 rounded bg-white/5 border border-white/10 text-ivory placeholder:text-smoke focus:border-gold outline-none"
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-2 rounded bg-white/5 border border-white/10 text-ivory placeholder:text-smoke focus:border-gold outline-none"
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          className="w-full px-4 py-2 rounded bg-white/5 border border-white/10 text-ivory placeholder:text-smoke resize-none focus:border-gold outline-none"
        />
        <button type="submit" disabled={status === 'loading'} className="w-full py-2 rounded bg-gold text-noir font-medium disabled:opacity-50">
          {status === 'loading' ? '…' : 'Send'}
        </button>
      </form>
      {status === 'success' && <p className="mt-4 text-gold">Message sent.</p>}
      {status === 'error' && <p className="mt-4 text-red-400">Something went wrong.</p>}
    </div>
  )
}
