import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductDetail } from '@/components/storefront/ProductDetail'
import { mapProductImages } from '@/lib/product-images'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: raw, error } = await supabase
    .from('products')
    .select('*, product_variants(*), product_images(url, sort_order, is_primary)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !raw) notFound()
  const product = mapProductImages(raw)

  return <ProductDetail product={product} />
}
