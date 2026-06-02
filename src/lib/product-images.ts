import { resolveMediaUrl } from '@/lib/media-url'

/**
 * Build product.images array from product_images (primary first, then by sort_order).
 * Use after fetching products with: .select('*, product_variants(*), product_images(url, sort_order, is_primary)')
 */

export type ProductImageRow = { url: string; sort_order: number; is_primary: boolean }

/** Row shape from Supabase when selecting product_images (optional so Product satisfies it) */
export type ProductWithImagesRow = {
  product_images?: ProductImageRow[] | null
  images?: string[]
}

function sortImages(rows: ProductImageRow[] | null | undefined): string[] {
  if (!rows?.length) return []
  return [...rows]
    .sort((a, b) => (a.is_primary === b.is_primary ? a.sort_order - b.sort_order : a.is_primary ? -1 : 1))
    .map((r) => resolveMediaUrl(r.url))
}

export function mapProductImages<T extends ProductWithImagesRow>(product: T): T {
  const images = sortImages(product.product_images as ProductImageRow[] | null | undefined)
  const { product_images: _, ...rest } = product
  const legacy = (product.images ?? []).map((u) => resolveMediaUrl(u))
  return { ...rest, images: images.length ? images : legacy } as T
}

export function mapProductImagesList<T extends ProductWithImagesRow>(products: T[]): T[] {
  return products.map((p) => mapProductImages(p)) as T[]
}
