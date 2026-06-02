import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get, post } from '../../api/client'
import HeroSection from '../../components/storefront/HeroSection'

type Product = {
  id: string
  name: string
  slug: string
  tagline?: string
  images?: string[]
}

type ProductsResponse = { data: Product[]; count: number }

export default function Home() {
  const [heroSettings, setHeroSettings] = useState<Record<string, string>>({})
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    Promise.all([
      get<Record<string, string>>('/api/settings/public').catch(() => ({})),
      get<ProductsResponse>('/api/products', { featured: 'true' }).catch(() => ({ data: [], count: 0 })),
    ]).then(([settings, productsRes]) => {
      setHeroSettings(settings)
      setFeatured(productsRes?.data ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      await post('/api/newsletter', { email: email.trim() })
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  const fallbackHeroImage = featured[0]?.images?.[0]

  return (
    <div>
      <HeroSection settings={heroSettings} fallbackImageUrl={fallbackHeroImage} />

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-display text-3xl md:text-4xl text-ivory mb-10 text-center">
          Signature Collection
        </h2>
        {loading ? (
          <p className="text-smoke text-center py-8">Loading…</p>
        ) : featured.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featured.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.slug}`}
                  className="group block rounded-lg border border-white/10 overflow-hidden hover:border-gold/50 transition-colors no-underline hover:no-underline"
                >
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-white/5 flex items-center justify-center text-smoke">
                      No image
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-display text-ivory group-hover:text-gold">{p.name}</h3>
                    {p.tagline && (
                      <p className="text-sm text-smoke mt-1">{p.tagline}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                to="/products"
                className="inline-block px-6 py-3 rounded border border-gold text-gold hover:bg-gold hover:text-noir transition-colors no-underline hover:no-underline"
              >
                View All Fragrances
              </Link>
            </div>
          </>
        ) : (
          <p className="text-smoke text-center py-8">
            No featured products yet.{' '}
            <Link to="/products" className="text-gold hover:underline">
              Browse all
            </Link>
            .
          </p>
        )}
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16 text-center border-t border-white/10">
        <h2 className="font-display text-2xl text-gold mb-4">Newsletter</h2>
        <p className="text-smoke mb-6">Get early access to new scents and exclusive offers.</p>
        <form
          onSubmit={handleNewsletter}
          className="flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="flex-1 px-4 py-2 rounded bg-white/5 border border-white/10 text-ivory placeholder:text-smoke focus:border-gold outline-none"
            required
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 rounded bg-gold text-noir font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {status === 'loading' ? '…' : 'Subscribe'}
          </button>
        </form>
        {status === 'success' && (
          <p className="mt-2 text-gold text-sm">Thank you — you’re subscribed.</p>
        )}
        {status === 'error' && (
          <p className="mt-2 text-red-400 text-sm">Something went wrong. Try again.</p>
        )}
      </section>
    </div>
  )
}
