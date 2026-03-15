'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ProductCard } from '@/components/storefront/ProductCard'
import { Button } from '@/components/ui/Button'
import { mapProductImagesList } from '@/lib/product-images'
import type { Product, ProductVariant } from '@/types'

const questions = [
  {
    id: 'occasion',
    title: 'When will you wear it?',
    options: [
      { value: 'daily', label: 'Daily / Office' },
      { value: 'date', label: 'Date Night' },
      { value: 'weekend', label: 'Weekend Casual' },
      { value: 'special', label: 'Special Occasions' },
    ],
  },
  {
    id: 'mood',
    title: 'What mood are you going for?',
    options: [
      { value: 'fresh', label: 'Fresh & Clean' },
      { value: 'bold', label: 'Bold & Confident' },
      { value: 'romantic', label: 'Romantic & Sensual' },
      { value: 'elegant', label: 'Elegant & Refined' },
    ],
  },
  {
    id: 'gender',
    title: 'Who is it for?',
    options: [
      { value: 'men', label: 'Men' },
      { value: 'women', label: 'Women' },
      { value: 'unisex', label: 'Unisex' },
    ],
  },
]

export default function FragranceFinderPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Array<Product & { product_variants?: ProductVariant[] }>>([])
  const [loading, setLoading] = useState(false)

  const q = questions[step]
  const isLastStep = step === questions.length - 1

  const handleNext = async () => {
    if (isLastStep) {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*, product_variants(*), product_images(url, sort_order, is_primary)')
        .eq('is_active', true)
        .eq('category_type', answers.gender || 'unisex')
        .limit(6)
      setResults(
        mapProductImagesList<Product & { product_variants?: ProductVariant[] }>(data ?? []) as Array<
          Product & { product_variants?: ProductVariant[] }
        >
      )
      setLoading(false)
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleSelect = (key: string, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }))
  }

  if (results.length > 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="font-display text-4xl text-ivory mb-4">Your Matches</h1>
        <p className="text-smoke mb-12">Based on your preferences, here are fragrances we think you&apos;ll love.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} variant={p.product_variants?.[0]} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/products"><Button variant="outline">Browse All Fragrances</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl text-ivory mb-2">Fragrance Finder</h1>
      <p className="text-smoke mb-12">Answer a few questions to discover your perfect scent.</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="font-display text-2xl text-ivory mb-8">{q.title}</h2>
          <div className="space-y-3">
            {q.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(q.id, opt.value)}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  answers[q.id] === opt.value
                    ? 'border-gold bg-gold-ghost text-gold'
                    : 'border-white/10 text-ivory hover:border-gold/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="mt-8 flex justify-between">
            {step > 0 ? (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            ) : (
              <span />
            )}
            <Button onClick={handleNext} disabled={!answers[q.id]} className="ml-auto">
              {loading ? 'Finding...' : isLastStep ? 'Find My Scent' : 'Next'}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
