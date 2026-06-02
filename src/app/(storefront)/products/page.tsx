import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/ProductCard'
import { ProductsFilters } from '@/components/storefront/ProductsFilters'
import { mapProductImagesList } from '@/lib/product-images'
import type { Product, ProductVariant } from '@/types'

interface SearchParams {
  category?: string
  gender?: string
  sort?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*, product_variants(*), product_images(url, sort_order, is_primary)')
    .eq('is_active', true)

  if (params.gender && ['men', 'women', 'unisex'].includes(params.gender)) {
    query = query.eq('category_type', params.gender)
  }

  if (params.sort === 'price-asc') {
    query = query.order('id')
  } else if (params.sort === 'price-desc') {
    query = query.order('id', { ascending: false })
  } else {
    query = query.order('sort_order')
  }

  const { data: productsRaw } = await query
  const products = mapProductImagesList<Product & { product_variants?: ProductVariant[] }>(
    (productsRaw ?? []) as (Product & { product_variants?: ProductVariant[] })[]
  )

  if (params.category) {
    const { data: pc } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single()
    if (pc) {
      const { data: pids } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', pc.id)
      const ids = pids?.map((p) => p.product_id) ?? []
      const filtered = products.filter((p) => ids.includes(p.id))
      return (
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <h1 className="font-display text-3xl sm:text-4xl text-ivory mb-4">All Fragrances</h1>
          <ProductsFilters currentGender={params.gender} currentSort={params.sort} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mt-6 sm:mt-8">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} variant={p.product_variants?.[0]} />
            ))}
          </div>
          {filtered.length === 0 && <p className="text-smoke text-center py-16">No products found.</p>}
        </div>
      )
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="font-display text-3xl sm:text-4xl text-ivory mb-4">All Fragrances</h1>
      <ProductsFilters currentGender={params.gender} currentSort={params.sort} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mt-6 sm:mt-8">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} variant={p.product_variants?.[0]} />
        ))}
      </div>
      {products.length === 0 && <p className="text-smoke text-center py-16">No products found.</p>}
    </div>
  )
}
