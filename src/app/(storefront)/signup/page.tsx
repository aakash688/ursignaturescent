'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { signUp } from '@/app/auth/actions'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const form = e.currentTarget
      const result = await signUp(new FormData(form))
      if (result?.error) setError(result.error)
      else if (result?.success) setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl text-ivory mb-4">Check your email</h1>
          <p className="text-smoke mb-8">
            We&apos;ve sent you a confirmation link. Click it to activate your account.
          </p>
          <Link href="/login"><Button>Go to Sign in</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Logo size="lg" variant="brand" href="/" className="inline-block mb-8" />
        <h1 className="font-display text-3xl text-ivory mb-2">Create account</h1>
        <p className="text-smoke mb-8">Join URsignature</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input name="full_name" label="Full name" placeholder="Your name" />
          <Input name="email" type="email" label="Email" required placeholder="you@example.com" />
          <Input name="phone" label="Phone" placeholder="+91 98765 43210" />
          <Input name="password" type="password" label="Password" required placeholder="••••••••" minLength={6} />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" className="w-full" size="lg" loading={loading} disabled={loading}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-smoke text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
