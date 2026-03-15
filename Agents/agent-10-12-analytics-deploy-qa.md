# CURSOR AGENT 10 — Analytics, SEO & Meta Pixel

## Your Role
Implement GA4, Meta Pixel, server-side analytics, complete SEO setup, structured data, sitemap, and robots.txt.

---

## Step 1: Analytics Library `src/lib/analytics.ts`
```typescript
// Track events on the client side
export function trackEvent(event: string, properties?: Record<string, any>) {
  // GA4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, properties)
  }
  // Meta Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    const metaEvent = GA4_TO_META_MAP[event] || 'CustomEvent'
    ;(window as any).fbq('track', metaEvent, properties)
  }
}

const GA4_TO_META_MAP: Record<string, string> = {
  'purchase': 'Purchase',
  'add_to_cart': 'AddToCart',
  'begin_checkout': 'InitiateCheckout',
  'view_item': 'ViewContent',
  'sign_up': 'CompleteRegistration',
  'search': 'Search',
}

export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID, { page_path: url })
  }
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView')
  }
}

export function trackProductView(product: any) {
  trackEvent('view_item', {
    currency: 'INR',
    value: product.price,
    items: [{ item_id: product.id, item_name: product.name, price: product.price, item_category: product.category_type }],
  })
}

export function trackAddToCart(item: any) {
  trackEvent('add_to_cart', {
    currency: 'INR',
    value: item.price * item.quantity,
    items: [{ item_id: item.product_id, item_name: item.name, price: item.price, quantity: item.quantity }],
  })
}

export function trackPurchase(order: any) {
  trackEvent('purchase', {
    transaction_id: order.orderNumber,
    value: order.total,
    currency: 'INR',
    coupon: order.couponCode || undefined,
    items: order.items?.map((i: any) => ({
      item_id: i.product_id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  })
}
```

---

## Step 2: Analytics Scripts in Root Layout
In `src/app/(storefront)/layout.tsx`, add in `<head>`:

```tsx
{/* GA4 */}
<Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`} strategy="afterInteractive" />
<Script id="ga4-init" strategy="afterInteractive">{`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}', { page_path: window.location.pathname });
`}</Script>

{/* Meta Pixel */}
<Script id="meta-pixel" strategy="afterInteractive">{`
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
  fbq('track', 'PageView');
`}</Script>
<noscript><img height="1" width="1" style={{display:'none'}} src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`} /></noscript>
```

---

## Step 3: Server-Side Analytics API `src/app/api/analytics/track/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { eventType, sessionId, userId, productId, orderId, metadata } = await request.json()
  const supabase = createAdminClient()
  
  await supabase.from('analytics_events').insert({
    event_type: eventType,
    session_id: sessionId,
    user_id: userId || null,
    product_id: productId || null,
    order_id: orderId || null,
    metadata,
    ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    user_agent: request.headers.get('user-agent'),
  })

  return NextResponse.json({ ok: true })
}
```

---

## Step 4: SEO — Metadata for Each Page

### Root Layout Default Metadata
```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://ursignature.com'),
  title: { default: 'URsignature — Premium Inspired Fragrances', template: '%s | URsignature' },
  description: 'Shop luxury inspired fragrances at honest prices. Premium perfumes for men, women & unisex. Long-lasting scents inspired by the world\'s finest.',
  keywords: ['premium fragrances', 'inspired perfumes', 'affordable luxury perfumes', 'best perfumes india', 'inspired by designer fragrances', 'long lasting perfumes', 'mens perfumes india', 'womens perfumes india', 'oud perfumes', 'buy perfumes online india'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://ursignature.com',
    siteName: 'URsignature',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', site: '@ursignature' },
  robots: { index: true, follow: true },
}
```

### Product Page Dynamic Metadata
```typescript
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  if (!product) return {}
  
  const title = product.meta_title || `${product.name} — Inspired by ${product.inspired_by} | URsignature`
  const description = product.meta_description || `Shop ${product.name} — a premium fragrance inspired by ${product.inspired_by}. ${product.fragrance_profile}. Long-lasting, high-quality, affordable.`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: product.images[0], alt: product.name }],
      type: 'website',
    },
    alternates: { canonical: `/product/${product.slug}` },
  }
}
```

---

## Step 5: Structured Data (JSON-LD)

### Product Schema in Product Page
```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "image": product.images,
  "brand": { "@type": "Brand", "name": "URsignature" },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "INR",
    "price": variant.price,
    "availability": variant.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "seller": { "@type": "Organization", "name": "URsignature" }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": product.rating,
    "bestRating": "5",
    "reviewCount": "10"
  }
}) }} />
```

### Organization Schema in Root Layout
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "URsignature",
  "url": "https://ursignature.com",
  "logo": "https://ursignature.com/logo.png",
  "description": "Premium inspired fragrances at honest prices",
  "sameAs": ["https://instagram.com/ursignature"]
}
```

---

## Step 6: Sitemap `src/app/sitemap.ts`
```typescript
import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()
  const { data: products } = await supabase.from('products').select('slug, updated_at').eq('is_active', true)
  const { data: categories } = await supabase.from('categories').select('slug, updated_at').eq('is_active', true)

  const staticPages = ['', '/collections', '/about', '/contact'].map(path => ({
    url: `https://ursignature.com${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }))

  const productPages = products?.map(p => ({
    url: `https://ursignature.com/product/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  })) || []

  const categoryPages = categories?.map(c => ({
    url: `https://ursignature.com/collections/${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) || []

  return [...staticPages, ...productPages, ...categoryPages]
}
```

---

## Step 7: Robots.txt `src/app/robots.ts`
```typescript
export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/account'] }
    ],
    sitemap: 'https://ursignature.com/sitemap.xml',
  }
}
```

---

## COMPLETION CRITERIA
- [ ] GA4 script loading and tracking page views
- [ ] Meta Pixel firing PageView on every page
- [ ] `trackAddToCart` called when item added to cart
- [ ] `trackPurchase` called on order-success page
- [ ] Structured data on all product pages (validate with Google Rich Results Test)
- [ ] Sitemap.xml generating dynamically
- [ ] Robots.txt protecting admin routes
- [ ] Product pages have canonical URLs
- [ ] Open Graph images set for social sharing

---
---

# CURSOR AGENT 11 — Cloudflare Pages Deployment

## Your Role
Configure the project for deployment on Cloudflare Pages with proper environment variables, build settings, and edge configuration.

---

## Step 1: Install Wrangler
```bash
npm install -D wrangler @cloudflare/next-on-pages
```

## Step 2: Create `wrangler.toml`
```toml
name = "ursignature"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

[vars]
NEXT_PUBLIC_APP_URL = "https://ursignature.com"

[[cron_triggers]]
# Daily report at 11:59 PM IST (18:29 UTC)
cron = "29 18 * * *"

[[cron_triggers]]
# Stock check every 6 hours
cron = "0 */6 * * *"
```

## Step 3: Update `package.json` scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "pages:build": "npx @cloudflare/next-on-pages",
    "pages:deploy": "wrangler pages deploy",
    "pages:preview": "wrangler pages dev"
  }
}
```

## Step 4: Create `.github/workflows/deploy.yml`
```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run pages:build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_RAZORPAY_KEY_ID: ${{ secrets.NEXT_PUBLIC_RAZORPAY_KEY_ID }}
          NEXT_PUBLIC_GA4_MEASUREMENT_ID: ${{ secrets.NEXT_PUBLIC_GA4_MEASUREMENT_ID }}
          NEXT_PUBLIC_META_PIXEL_ID: ${{ secrets.NEXT_PUBLIC_META_PIXEL_ID }}
          NEXT_PUBLIC_R2_PUBLIC_URL: ${{ secrets.NEXT_PUBLIC_R2_PUBLIC_URL }}
          NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: ursignature
          directory: .vercel/output/static
```

## Step 5: Cloudflare Pages Setup (Manual Steps — do in dashboard)
1. Go to Cloudflare Pages → Create project → Connect to Git
2. Select your repository
3. Build command: `npm run pages:build`
4. Build output directory: `.vercel/output/static`
5. Add ALL environment variables from `.env.local`
6. Add custom domain: `ursignature.com`
7. Enable "Automatic HTTPS"

## Step 6: R2 Bucket CORS Configuration (in Cloudflare Dashboard)
```json
[
  {
    "AllowedOrigins": ["https://ursignature.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## Step 7: Add Custom Domain for R2 (media.ursignature.com)
In Cloudflare R2 → Your bucket → Settings → Custom Domains → Add `media.ursignature.com`

---

## COMPLETION CRITERIA
- [ ] wrangler.toml configured with cron triggers
- [ ] GitHub Actions workflow for auto-deploy
- [ ] `npm run pages:build` completes without errors
- [ ] Deployed to Cloudflare Pages
- [ ] Custom domain `ursignature.com` pointed to Pages
- [ ] `media.ursignature.com` serving R2 images
- [ ] All environment variables set in CF Pages dashboard
- [ ] HTTPS working on all domains

---
---

# CURSOR AGENT 12 — Testing, QA & Final Polish

## Your Role
Test every feature, fix all issues, and do final performance/SEO audit.

---

## Checklist — Test Every Feature

### Storefront
- [ ] Homepage loads all sections correctly
- [ ] All 10 products display on homepage featured section
- [ ] Collection pages filter products correctly
- [ ] Product detail page shows correct notes, variants, prices
- [ ] Out-of-stock variant shows disabled button
- [ ] Add to cart works, cart persists on refresh
- [ ] Cart drawer opens/closes smoothly
- [ ] Coupon code applies correctly (test with a test coupon)
- [ ] Checkout form validates all fields
- [ ] Razorpay opens with correct amount
- [ ] Test payment with Razorpay test cards:
  - Success: 4111 1111 1111 1111 (any future date, any CVV)
  - Failure: 4000 0000 0000 0002
- [ ] Order created in DB after successful payment
- [ ] Stock decremented after payment
- [ ] Order success page shows correct order number
- [ ] Telegram notification received after purchase

### Auth
- [ ] Sign up creates profile in Supabase
- [ ] Login works and redirects correctly
- [ ] Account page shows orders
- [ ] Order tracking page works without login
- [ ] Logout clears session

### Admin Panel
- [ ] Admin login works
- [ ] Non-admin users redirected away from /admin
- [ ] Dashboard stats are correct
- [ ] Product create/edit/delete working
- [ ] Image upload works and images appear in R2
- [ ] Category create/edit working
- [ ] Product can be assigned to multiple categories
- [ ] Order status can be updated
- [ ] Inventory can be adjusted manually
- [ ] Coupon create/test works
- [ ] POS creates order and decrements stock
- [ ] POS sale triggers Telegram notification
- [ ] Settings save to DB

### Telegram Bot
- [ ] /orders command returns last 5 orders
- [ ] /order URS-XXXX returns specific order
- [ ] /stock shows inventory
- [ ] /revenue shows today's revenue
- [ ] /pending shows pending orders
- [ ] Daily report cron triggered and sends report

### SEO
- [ ] Run Lighthouse audit — target: Performance 90+, SEO 100
- [ ] Validate structured data: https://search.google.com/test/rich-results
- [ ] Check sitemap.xml is accessible and valid
- [ ] Verify robots.txt is correct
- [ ] Check all product pages have canonical URLs
- [ ] Open Graph images visible when shared on WhatsApp/social

### Performance
- [ ] Images are served as WebP from R2
- [ ] Next.js Image optimization working
- [ ] No layout shift on product images (aspect ratios set)
- [ ] Fonts loading from Google Fonts (preconnect set)
- [ ] Core Web Vitals passing (use PageSpeed Insights)

---

## Final Polish Tasks
1. Add `loading.tsx` files for all major routes (skeleton loaders)
2. Add `error.tsx` boundary components
3. Add `not-found.tsx` (404 page with brand styling)
4. Add mobile navigation (hamburger menu working on all pages)
5. Test on real mobile device (iPhone Safari + Android Chrome)
6. Add WhatsApp float button linking to store's WhatsApp
7. Verify all internal links are working (no broken links)
8. Check all environment variables are set in Cloudflare Pages
9. Set up Google Search Console and submit sitemap
10. Connect Meta Pixel to Meta Business Manager and test events

---

## COMPLETION CRITERIA
- [ ] All checklist items above are passing
- [ ] Lighthouse scores: Performance 85+, SEO 100, Accessibility 90+
- [ ] No console errors in production
- [ ] Site live at ursignature.com
- [ ] Admin accessible at ursignature.com/admin
- [ ] First test order completed successfully end-to-end
