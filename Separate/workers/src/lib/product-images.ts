type ProductImageRow = { url: string; sort_order: number; is_primary: boolean }

type ProductWithImagesRow = {
  product_images?: ProductImageRow[] | null
  images?: string[]
  [k: string]: unknown
}

function sortImages(rows: ProductImageRow[] | null | undefined): string[] {
  if (!rows?.length) return []
  return [...rows]
    .sort((a, b) => (a.is_primary === b.is_primary ? a.sort_order - b.sort_order : a.is_primary ? -1 : 1))
    .map((r) => r.url)
}

export function mapProductImages<T extends ProductWithImagesRow>(product: T): T {
  const images = sortImages((product.product_images as ProductImageRow[] | null | undefined) ?? null)
  const { product_images: _, ...rest } = product
  return { ...rest, images: images.length ? images : (product.images ?? []) } as T
}

export function mapProductImagesList<T extends ProductWithImagesRow>(products: T[]): T[] {
  return products.map((p) => mapProductImages(p)) as T[]
}
