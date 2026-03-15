import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/ProductCard'
import { mapProductImagesList } from '@/lib/product-images'
import { notFound } from 'next/navigation'
import type { Product, ProductVariant } from '@/types'

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!category) notFound()

  const { data: pc } = await supabase
    .from('product_categories')
    .select('product_id')
    .eq('category_id', category.id)

  const productIds = pc?.map((p) => p.product_id) || []
  let products: Array<Product & { product_variants?: ProductVariant[] }> = []

  if (productIds.length > 0) {
    const { data } = await supabase
      .from('products')
      .select('*, product_variants(*), product_images(url, sort_order, is_primary)')
      .eq('is_active', true)
      .in('id', productIds)
      .order('sort_order')
    products = mapProductImagesList<Product & { product_variants?: ProductVariant[] }>(
      (data ?? []) as (Product & { product_variants?: ProductVariant[] })[]
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl text-ivory mb-4">{category.name}</h1>
      {category.description && <p className="text-smoke mb-12">{category.description}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} variant={p.product_variants?.[0]} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="text-smoke text-center py-16">No products in this collection yet.</p>
      )}
    </div>
  )
}
