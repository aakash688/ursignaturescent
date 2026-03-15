export default function ShippingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl text-ivory mb-6">Shipping Policy</h1>
      <div className="text-smoke space-y-6 leading-relaxed">
        <p>We ship across India. Orders are processed within 1-2 business days.</p>
        <p><strong className="text-ivory">Free Shipping</strong> on orders ₹999 and above. Flat ₹99 for orders below.</p>
        <p>Delivery typically takes 3-7 business days depending on your location.</p>
        <p>You will receive tracking information once your order ships.</p>
      </div>
    </div>
  )
}
