'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { StarRating } from '@/components/ui/StarRating'
import { Button } from '@/components/ui/Button'
import { NotesPill } from '@/components/ui/NotesPill'
import { FragranceStrengthBars } from '@/components/ui/FragranceStrengthBars'
import { useCartStore } from '@/stores/cart'
import { trackAddToCart } from '@/lib/analytics'
import type { Product, ProductVariant } from '@/types'

interface ProductDetailProps {
  product: Product & { product_variants?: ProductVariant[] }
}

export function ProductDetail({ product }: ProductDetailProps) {
  const variants = product.product_variants || []
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(variants[0] || null)
  const [quantity, setQuantity] = useState(1)
  const [mainImage, setMainImage] = useState(product.images?.[0] || '/images/products/placeholder.png')
  const [stickyVisible, setStickyVisible] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock_quantity <= 0) return
    addItem({
      product_id: product.id,
      variant_id: selectedVariant.id,
      name: product.name,
      slug: product.slug,
      image: mainImage.startsWith('http') ? mainImage : `${process.env.NEXT_PUBLIC_APP_URL || ''}${mainImage}`,
      size_ml: selectedVariant.size_ml,
      price: selectedVariant.price,
      compare_at_price: selectedVariant.compare_at_price,
      quantity,
      max_quantity: selectedVariant.stock_quantity,
    })
    trackAddToCart({
      product_id: product.id,
      name: product.name,
      price: selectedVariant.price,
      quantity,
      size_ml: selectedVariant.size_ml,
    })
    openCart()
  }

  const images = product.images?.length ? product.images : [mainImage]
  const imageSrc = (img: string) =>
    img.startsWith('http') ? img : img.startsWith('/') ? img : `/${img}`

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-[4/5] relative rounded-lg overflow-hidden bg-charcoal mb-4">
              <Image
                src={imageSrc(mainImage)}
                alt={product.name}
                fill
                className="object-cover"
                priority
                unoptimized={!mainImage.startsWith('http')}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-24 flex-shrink-0 rounded overflow-hidden border-2 transition-colors hover:border-gold ${
                      mainImage === img ? 'border-gold' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={imageSrc(img)}
                      alt=""
                      width={80}
                      height={96}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.inspired_by && (
              <p className="text-gold text-sm mb-2">Inspired by {product.inspired_by}</p>
            )}
            <h1 className="font-display text-4xl text-ivory">{product.name}</h1>
            <div className="flex items-center gap-4 mt-4">
              <StarRating rating={product.rating} />
            </div>
            {selectedVariant && (
              <div className="mt-6 flex items-baseline gap-4">
                <span className="text-2xl text-gold font-medium">{formatPrice(selectedVariant.price)}</span>
                {selectedVariant.compare_at_price && (
                  <span className="text-smoke line-through">{formatPrice(selectedVariant.compare_at_price)}</span>
                )}
              </div>
            )}
            <p className="text-smoke mt-4">{product.short_description}</p>

            <FragranceStrengthBars
              top={70}
              heart={85}
              base={60}
              className="mt-6"
            />

            {variants.length > 1 && (
              <div className="mt-6">
                <p className="text-sm text-smoke mb-2">Size</p>
                <div className="flex gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      disabled={v.stock_quantity <= 0}
                      className={`px-4 py-2 rounded border text-sm ${
                        selectedVariant?.id === v.id
                          ? 'border-gold text-gold bg-gold/10'
                          : 'border-white/20 text-ivory hover:border-gold/50'
                      } ${v.stock_quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {v.size_ml}ml
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border border-white/10 rounded">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-4 py-2 text-ivory hover:bg-white/5">−</button>
                <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="px-4 py-2 text-ivory hover:bg-white/5">+</button>
              </div>
              <Button onClick={handleAddToCart} disabled={!selectedVariant || selectedVariant.stock_quantity <= 0} size="lg" className="flex-1">
                Add to Cart
              </Button>
            </div>

            <div className="mt-12 space-y-6">
              {product.top_notes?.length > 0 && (
                <div>
                  <p className="text-gold text-sm mb-2">Top Notes</p>
                  <NotesPill notes={product.top_notes} variant="top" />
                </div>
              )}
              {product.heart_notes?.length > 0 && (
                <div>
                  <p className="text-gold text-sm mb-2">Heart Notes</p>
                  <NotesPill notes={product.heart_notes} variant="heart" />
                </div>
              )}
              {product.base_notes?.length > 0 && (
                <div>
                  <p className="text-gold text-sm mb-2">Base Notes</p>
                  <NotesPill notes={product.base_notes} variant="base" />
                </div>
              )}
            </div>

            {product.description && (
              <div className="mt-12">
                <h3 className="font-display text-lg text-ivory mb-2">Product Details</h3>
                <p className="text-smoke text-sm leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {stickyVisible && selectedVariant && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-noir/98 backdrop-blur border-t border-white/5 py-4 px-4 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-lg text-ivory">{product.name}</p>
              <p className="text-gold font-medium">{formatPrice(selectedVariant.price)} · {selectedVariant.size_ml}ml</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-white/10 rounded">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 text-ivory hover:bg-white/5">−</button>
                <span className="px-3 py-2 min-w-[2.5rem] text-center text-sm">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="px-3 py-2 text-ivory hover:bg-white/5">+</button>
              </div>
              <Button onClick={handleAddToCart} disabled={selectedVariant.stock_quantity <= 0} size="lg">
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
