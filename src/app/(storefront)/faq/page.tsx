'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    q: 'How long does shipping take?',
    a: 'We ship within 1-2 business days. Delivery typically takes 3-7 days across India.',
  },
  {
    q: 'What is your return policy?',
    a: 'Unopened, sealed products can be returned within 7 days. Please contact us to initiate a return.',
  },
  {
    q: 'Are your fragrances inspired by luxury brands?',
    a: 'Yes. Our fragrances are inspired by iconic luxury scents, crafted with premium ingredients at accessible prices.',
  },
  {
    q: 'How do I choose the right fragrance?',
    a: 'Try our Fragrance Finder quiz! Answer a few questions about your preferences and we\'ll recommend the perfect scent.',
  },
  {
    q: 'Is there free shipping?',
    a: 'Yes. Free shipping on all orders ₹999 and above.',
  },
]

export default function FAQPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl text-ivory mb-4">FAQ</h1>
      <p className="text-smoke mb-12">Common questions about URsignature fragrances.</p>

      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map(({ q, a }, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="border border-white/10 rounded-lg px-4 data-[state=open]:border-gold/30"
          >
            <AccordionTrigger className="text-ivory font-display text-lg hover:text-gold hover:no-underline py-4">
              {q}
            </AccordionTrigger>
            <AccordionContent className="text-smoke pb-4">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
