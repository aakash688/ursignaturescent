import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { mapProductImages } from '@/lib/product-images'
import { Button } from '@/components/ui/Button'
import { ProductForm } from '@/components/admin/ProductForm'

interface VariantRow {
  id?: string
  size_ml: number
  price: number
  compare_at_price: number | null
  sku: string
  stock_quantity: number
  low_stock_threshold: number
  is_active: boolean
}

export default async function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data: raw } = await supabase
    .from('products')
    .select('*, product_variants(*), product_images(id, url, sort_order, is_primary)')
    .eq('id', id)
    .single()
  if (!raw) notFound()

  const product = mapProductImages(raw as {
    product_images?: { url: string; sort_order: number; is_primary: boolean }[]
    name?: string
    slug?: string
    id?: string
    tagline?: string | null
    description?: string | null
    short_description?: string | null
    inspired_by?: string | null
    category_type?: string
    fragrance_profile?: string | null
    top_notes?: string[]
    heart_notes?: string[]
    base_notes?: string[]
    rating?: number
    is_featured?: boolean
    is_active?: boolean
    meta_title?: string | null
    meta_description?: string | null
    sort_order?: number
    product_variants?: Array<{
      id: string
      size_ml: number
      price: number
      compare_at_price: number | null
      sku: string
      stock_quantity: number
      low_stock_threshold: number
      is_active: boolean
    }>
    images?: string[]
  }) as {
    name: string
    slug: string
    id: string
    tagline?: string | null
    description?: string | null
    short_description?: string | null
    inspired_by?: string | null
    category_type?: string
    fragrance_profile?: string | null
    top_notes?: string[]
    heart_notes?: string[]
    base_notes?: string[]
    rating?: number
    is_featured?: boolean
    is_active?: boolean
    meta_title?: string | null
    meta_description?: string | null
    sort_order?: number
    product_variants?: Array<{
      id: string
      size_ml: number
      price: number
      compare_at_price: number | null
      sku: string
      stock_quantity: number
      low_stock_threshold: number
      is_active: boolean
    }>
    images?: string[]
  }

  const { data: pc } = await supabase.from('product_categories').select('category_id').eq('product_id', id)
  const category_ids = (pc ?? []).map((r) => r.category_id)

  const variants: VariantRow[] = (product.product_variants ?? []).map((v) => ({
    id: v.id,
    size_ml: v.size_ml,
    price: v.price,
    compare_at_price: v.compare_at_price ?? null,
    sku: v.sku ?? '',
    stock_quantity: v.stock_quantity ?? 0,
    low_stock_threshold: v.low_stock_threshold ?? 10,
    is_active: v.is_active !== false,
  }))

  const initialData = {
    name: product.name,
    slug: product.slug,
    tagline: product.tagline ?? null,
    description: product.description ?? null,
    short_description: product.short_description ?? null,
    inspired_by: product.inspired_by ?? null,
    category_type: product.category_type ?? 'unisex',
    fragrance_profile: product.fragrance_profile ?? null,
    top_notes: product.top_notes ?? [],
    heart_notes: product.heart_notes ?? [],
    base_notes: product.base_notes ?? [],
    rating: product.rating ?? 0,
    is_featured: product.is_featured ?? false,
    is_active: product.is_active !== false,
    meta_title: product.meta_title ?? null,
    meta_description: product.meta_description ?? null,
    sort_order: product.sort_order ?? 0,
    variants: variants.length ? variants : [{ size_ml: 50, price: 0, compare_at_price: null, sku: '', stock_quantity: 0, low_stock_threshold: 10, is_active: true }],
    category_ids,
    image_urls: product.images ?? [],
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="font-display text-2xl text-ivory">Edit: {product.name}</h1>
        <Link href="/admin/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>
      <ProductForm mode="edit" productId={id} initialSlug={product.slug} initialData={initialData} />
    </div>
  )
}
