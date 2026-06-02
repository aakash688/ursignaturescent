'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { StarRating } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/stores/cart'
import type { Product, ProductVariant } from '@/types'
import { trackAddToCart } from '@/lib/analytics'
import { resolveMediaUrl } from '@/lib/media-url'

interface ProductCardProps {
  product: Product
  variant?: ProductVariant
}

export function ProductCard({ product, variant }: ProductCardProps) {
  const v = variant || product.variants?.[0]
  const rawImage = product.images?.[0] || '/images/products/placeholder.png'
  const image = resolveMediaUrl(rawImage) || rawImage
  const src = image.startsWith('http') ? image : image.startsWith('/') ? image : `/${image}`
  const isOutOfStock = !v || v.stock_quantity <= 0
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  const handleAddToCart = () => {
    if (!v || isOutOfStock) return
    addItem({
      product_id: product.id,
      variant_id: v.id,
      name: product.name,
      slug: product.slug,
      image: image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_APP_URL || ''}${image}`,
      size_ml: v.size_ml,
      price: v.price,
      compare_at_price: v.compare_at_price,
      quantity: 1,
      max_quantity: v.stock_quantity,
    })
    trackAddToCart({ product_id: product.id, name: product.name, price: v.price, quantity: 1, size_ml: v.size_ml })
    openCart()
  }

  return (
    <div className="product-card group relative bg-charcoal border border-white/5 rounded-lg overflow-hidden">
      <Link href={`/product/${product.slug}`} className="block aspect-[4/5] relative overflow-hidden">
        <Image
          src={src}
          alt={product.name}
          fill
          className="product-card-img object-cover"
          sizes="(max-width: 640px) 50vw, 25vw"
          unoptimized={!src.startsWith('http')}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-noir/70 flex items-center justify-center">
            <span className="text-ivory font-medium">Out of Stock</span>
          </div>
        )}
        <div className="product-card-overlay absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-noir to-transparent" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <Button size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(); }} disabled={isOutOfStock} fullWidth type="button" className="text-xs sm:text-sm">
            Add to Cart
          </Button>
        </div>
      </Link>
      <div className="p-3 sm:p-4">
        {product.is_featured && <Badge variant="gold" className="mb-1 sm:mb-2 text-[10px] sm:text-xs">Featured</Badge>}
        <h3 className="font-display text-sm sm:text-lg text-ivory line-clamp-2">{product.name}</h3>
        <p className="text-smoke text-xs sm:text-sm mt-0.5 line-clamp-1">{product.tagline}</p>
        <div className="flex items-center justify-between mt-1.5 sm:mt-2 gap-1">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <StarRating rating={product.rating} size={10} />
            {v && (
              <span className="text-gold font-medium text-xs sm:text-base truncate">{formatPrice(v.price)}</span>
            )}
          </div>
          {v?.compare_at_price && (
            <span className="text-smoke text-[10px] sm:text-sm line-through shrink-0">{formatPrice(v.compare_at_price)}</span>
          )}
        </div>
        {product.inspired_by && (
          <p className="text-gold/80 text-[10px] sm:text-xs mt-1 line-clamp-1">Inspired by {product.inspired_by}</p>
        )}
      </div>
    </div>
  )
}
