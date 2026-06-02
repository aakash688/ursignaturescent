'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { signIn } from '@/app/auth/actions'

function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/account'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const form = e.currentTarget
      const formData = new FormData(form)
      formData.set('redirect', redirect)
      const result = await signIn(formData)
      if (result?.error) setError(result.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Logo size="lg" variant="brand" href="/" className="inline-block mb-8" />
        <h1 className="font-display text-3xl text-ivory mb-2">Welcome back</h1>
        <p className="text-smoke mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input name="email" type="email" label="Email" required placeholder="you@example.com" />
          <Input name="password" type="password" label="Password" required placeholder="••••••••" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" className="w-full" size="lg" loading={loading} disabled={loading}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-smoke text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-gold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><p className="text-smoke">Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  )
}
