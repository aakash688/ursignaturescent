import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <RevealOnScroll>
        <h1 className="font-display text-4xl text-ivory mb-6">About URsignature</h1>
      </RevealOnScroll>
      <RevealOnScroll>
        <p className="text-smoke leading-relaxed mb-6">
          URsignature brings you premium inspired fragrances — the world&apos;s most coveted scents, reimagined for real life. We believe everyone deserves to smell exceptional without the luxury price tag.
        </p>
      </RevealOnScroll>
      <RevealOnScroll>
        <p className="text-smoke leading-relaxed mb-6">
          Our fragrances are crafted with care, inspired by iconic luxury houses. Each bottle is a blend of top, heart, and base notes that unfold over time — long-lasting, distinctive, and unmistakably premium.
        </p>
      </RevealOnScroll>
      <RevealOnScroll>
        <h2 className="font-display text-2xl text-gold mt-12 mb-4">Our Promise</h2>
        <p className="text-smoke leading-relaxed">
          100% authentic formulations. Free shipping on orders ₹999+. Easy returns. Your scent, your identity — at a price that makes sense.
        </p>
      </RevealOnScroll>
    </div>
  )
}
