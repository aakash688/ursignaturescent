import Razorpay from 'razorpay'
import crypto from 'crypto'

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) throw new Error('Razorpay credentials not configured')
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

export async function createRazorpayOrder(amount: number, receipt: string) {
  const razorpay = getRazorpay()
  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt,
    notes: { store: 'URsignature', website: 'ursignature.com' },
  })
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = `${orderId}|${paymentId}`
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}
