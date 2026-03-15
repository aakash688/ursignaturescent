'use client'

import { useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('orderNumber') || 'your order'

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', { order_number: orderNumber })
    }
  }, [orderNumber])

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="inline-flex p-4 rounded-full bg-gold/10 text-gold mb-8">
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="font-display text-4xl text-ivory mb-4">Thank you</h1>
      <p className="text-smoke mb-2">Your order <strong className="text-gold">{orderNumber}</strong> has been placed.</p>
      <p className="text-smoke text-sm mb-10">We&apos;ll send you an email with tracking details once it ships.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/account/orders"><Button variant="outline">View orders</Button></Link>
        <Link href="/products"><Button>Continue shopping</Button></Link>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><p className="text-smoke">Loading...</p></div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}
