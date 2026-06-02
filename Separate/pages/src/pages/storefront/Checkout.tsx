import { useState } from 'react'
import { post } from '../../api/client'

export default function Checkout() {
  const [code, setCode] = useState('')
  const [amount, setAmount] = useState(1000)
  const [result, setResult] = useState<{ valid?: boolean; discount?: number } | null>(null)

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)
    try {
      const res = await post<{ valid: boolean; discount?: number }>('/api/coupons/validate', {
        code: code.trim(),
        subtotal: amount,
      })
      setResult(res)
    } catch {
      setResult({ valid: false })
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-3xl font-display text-ivory mb-6">Checkout</h1>
      <p className="text-smoke mb-6">Payment (Razorpay) is wired via Workers API. This page demonstrates coupon validation.</p>
      <form onSubmit={handleValidate} className="space-y-4">
        <input
          type="text"
          placeholder="Coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full px-4 py-2 rounded bg-white/5 border border-white/10 text-ivory placeholder:text-smoke focus:border-gold outline-none"
        />
        <input
          type="number"
          placeholder="Subtotal"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full px-4 py-2 rounded bg-white/5 border border-white/10 text-ivory focus:border-gold outline-none"
        />
        <button type="submit" className="w-full py-2 rounded bg-gold text-noir font-medium">Validate</button>
      </form>
      {result && (
        <p className={`mt-4 ${result.valid ? 'text-gold' : 'text-red-400'}`}>
          {result.valid ? `Valid. Discount: ₹${result.discount ?? 0}` : 'Invalid or expired coupon'}
        </p>
      )}
    </div>
  )
}
