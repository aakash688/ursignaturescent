import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/ProductCard'
import { HeroSection } from '@/components/storefront/HeroSection'
import { QuickShopStrip } from '@/components/storefront/QuickShopStrip'
import { BrandPromiseBar } from '@/components/storefront/BrandPromiseBar'
import { ParallaxBanner } from '@/components/storefront/ParallaxBanner'
import { FragranceFinderTeaser } from '@/components/storefront/FragranceFinderTeaser'
import { CollectionsGrid } from '@/components/storefront/CollectionsGrid'
import { NotesEducation } from '@/components/storefront/NotesEducation'
import { ReviewsCarousel } from '@/components/storefront/ReviewsCarousel'
import { NewsletterSection } from '@/components/storefront/NewsletterSection'
import { Button } from '@/components/ui/Button'
import { mapProductImagesList } from '@/lib/product-images'
import { getPublicSettings } from '@/lib/settings-public'
import { mergeHeroSettings } from '@/lib/hero-settings'
import { buildHeroSlides } from '@/lib/hero-slides'
import type { Product, ProductVariant, Category } from '@/types'

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { data: featuredRaw },
    { data: mensRaw },
    { data: womensRaw },
    { data: categories },
    publicSettings,
  ] = await Promise.all([
    supabase
      .from('products')
      .select('*, product_variants(*), product_images(url, sort_order, is_primary)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(4),
    supabase
      .from('products')
      .select('*, product_variants(*), product_images(url, sort_order, is_primary)')
      .eq('is_active', true)
      .eq('category_type', 'men')
      .limit(3),
    supabase
      .from('products')
      .select('*, product_variants(*), product_images(url, sort_order, is_primary)')
      .eq('is_active', true)
      .eq('category_type', 'women')
      .limit(3),
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
    getPublicSettings(),
  ])

  const heroSettings = mergeHeroSettings({
    ...(publicSettings as Record<string, string>),
    hero_slides: publicSettings.hero_slides ?? '',
  })

  const featured = mapProductImagesList(featuredRaw ?? [])
  const mens = mapProductImagesList(mensRaw ?? [])
  const womens = mapProductImagesList(womensRaw ?? [])

  const featuredImage = featured?.[0]?.images?.[0]
    ? featured[0].images[0].startsWith('http')
      ? featured[0].images[0]
      : featured[0].images[0].startsWith('/')
        ? featured[0].images[0]
        : `/images/products/${featured[0].slug}-1.png`
    : '/images/products/midnight-black-1.png'

  const heroSlides = buildHeroSlides(heroSettings as Record<string, string>, featuredImage)

  const menImage = mens?.[0]?.images?.[0]
    ? mens[0].images[0].startsWith('/') ? mens[0].images[0] : `/images/products/${mens[0].slug}-1.png`
    : '/images/products/midnight-black-1.png'

  const womenImage = womens?.[0]?.images?.[0]
    ? womens[0].images[0].startsWith('/') ? womens[0].images[0] : `/images/products/${womens[0].slug}-1.png`
    : '/images/products/velvet-desire-1.png'

  return (
    <div>
      <HeroSection featuredImage={featuredImage} hero={heroSettings} slides={heroSlides} />

      <QuickShopStrip />

      <BrandPromiseBar />

      {/* Featured Collection */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl text-ivory mb-12">Signature Collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {(featured || []).map((p) => (
              <ProductCard
                key={p.id}
                product={p as Product & { product_variants?: ProductVariant[] }}
                variant={(p as Product & { product_variants?: ProductVariant[] }).product_variants?.[0]}
              />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/collections">
              <Button variant="outline">View All Fragrances</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Parallax Men */}
      <ParallaxBanner
        title="Men's Collection"
        subtitle="Bold, fresh, unmistakably masculine."
        href="/collections/men"
        cta="Explore Men's"
        image={menImage}
        alt="Men's fragrances"
      />

      {/* Men's Preview */}
      <section className="py-20 px-4 bg-noir-card/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl text-ivory mb-12">Men&apos;s Collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {(mens || []).map((p) => (
              <ProductCard
                key={p.id}
                product={p as Product & { product_variants?: ProductVariant[] }}
                variant={(p as Product & { product_variants?: ProductVariant[] }).product_variants?.[0]}
              />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/collections/men">
              <Button variant="outline">Explore Men&apos;s Collection</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Parallax Women */}
      <ParallaxBanner
        title="Women's Collection"
        subtitle="Elegant, sensual, unforgettable."
        href="/collections/women"
        cta="Explore Women's"
        image={womenImage}
        alt="Women's fragrances"
      />

      {/* Women's Preview */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl text-ivory mb-12">Women&apos;s Collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {(womens || []).map((p) => (
              <ProductCard
                key={p.id}
                product={p as Product & { product_variants?: ProductVariant[] }}
                variant={(p as Product & { product_variants?: ProductVariant[] }).product_variants?.[0]}
              />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/collections/women">
              <Button variant="outline">Explore Women&apos;s Collection</Button>
            </Link>
          </div>
        </div>
      </section>

      <FragranceFinderTeaser />

      <CollectionsGrid categories={(categories || []) as Category[]} />

      <NotesEducation />

      <ReviewsCarousel />

      <NewsletterSection />
    </div>
  )
}
