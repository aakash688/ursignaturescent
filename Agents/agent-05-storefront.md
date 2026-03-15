# CURSOR AGENT 05 — Storefront Pages (Homepage, Collections, Product, Cart, Checkout)

## Your Role
You are a luxury e-commerce frontend engineer. Build all customer-facing pages for URsignature. Every page must feel like a high-end perfume brand website — cinematic, editorial, conversion-focused.

---

## Page 1: Homepage `src/app/(storefront)/page.tsx`

Build a stunning homepage with these sections in order:

### Section 1: Hero
```
Full-viewport hero with:
- Background: Very dark with subtle golden particle/dust effect (CSS animated dots)
- Headline (Cormorant Garamond, 72-96px): "Your Scent." on line 1, "Your Identity." on line 2
- Subtext: "Luxury fragrances inspired by the world's finest — at a fraction of the price."
- Two CTAs: [Shop Men] [Shop Women] — both in outline style, side by side
- Fade-in animation on load (stagger: headline → subtext → CTAs)
- Optional: floating perfume bottle image (from public/images) with subtle float animation
```

### Section 2: Brand Promise Bar
```
3 columns with gold icons:
🏆 Premium Quality | ✨ Inspired by Luxury | 🚚 Free Shipping ₹999+
```

### Section 3: Featured Collection
```
- Section title: "Signature Collection" (Cormorant, 48px)
- Show 4 featured products in a responsive grid
- Each using ProductCard component
- CTA: "View All Fragrances"
```

### Section 4: Men's Collection Preview
```
- Split layout: large image (left) + product grid (right)
- Show 3 men's products
- CTA: "Explore Men's Collection"
```

### Section 5: Women's Collection Preview
```
- Reverse split layout: product grid (left) + large image (right)
- Show 3 women's products
- CTA: "Explore Women's Collection"
```

### Section 6: Royal Oud Feature (Hero Product Spotlight)
```
Full-width dark section featuring Royal Oud:
- Cinematic background (can use a dark gradient)
- Product name in gold, large
- Key notes listed beautifully
- Rating stars
- Price + Add to Cart
- "The Scent of Royalty" tagline
```

### Section 7: The Notes Guide
```
Educational section: "Understanding Your Fragrance"
3 cards: Top Notes (first impression) | Heart Notes (the soul) | Base Notes (lasting memory)
Brief elegant descriptions. Builds trust and educates buyers.
```

### Section 8: Why URsignature
```
4 value props with icons:
- Inspired by the Best: Premium formulations inspired by world-famous perfumes
- Honest Pricing: No middlemen. Luxury quality, honest price.
- Long-Lasting: 8-12 hours of wear per application
- Your Signature: Unique, personal, unforgettable
```

### Section 9: Bestsellers Carousel
```
Horizontal scrollable row of all 10 products
Each card: image, name, price, add to cart
```

### Section 10: Instagram/Social Proof Section
```
"Join the URsignature Family"
Static grid placeholder (6 squares) styled to look like IG grid
CTA: "Follow @ursignature" linking to Instagram
```

### Section 11: Newsletter Signup
```
Dark section:
"Be the first to know" — exclusive drops, offers, fragrance guides
Email input + Subscribe button
On submit: save email to Supabase `newsletter_subscribers` table
```

---

## Page 2: Collections Page `src/app/(storefront)/collections/[slug]/page.tsx`

```tsx
// This is a dynamic page that loads based on category slug
// Shows:
// - Category banner image (full width, with category name overlaid)
// - Category description
// - Filter bar: Sort (Featured, Price Low-High, Price High-Low, Newest, Rating)
// - Product grid (3 cols desktop, 2 cols tablet, 1 col mobile)
// - Product count
// - Empty state if no products

// Also create a /collections page that shows ALL categories as cards
```

---

## Page 3: Product Detail Page `src/app/(storefront)/product/[slug]/page.tsx`

This is the most important page. Build it with:

### Left: Product Gallery
```
- Large main image
- Thumbnail strip below (4 thumbnails)
- Click to change main image
- Smooth transitions
```

### Right: Product Info
```
- "Inspired by {brand}" — small gold text at top
- Product name — large Cormorant serif
- Star rating + review count
- Price (large) + Compare at price (crossed out, smaller)
- Short description
- Variant selector: size pills (50ml, etc.) — fetched from DB
  Show price for each variant
  Out of stock variants: disabled with strikethrough
- Quantity selector (+ -)
- [Add to Cart] — primary gold button, full width
- [Buy Now] — outline button, full width
- Fragrance Notes section:
  3 rows: 🌿 Top Notes | 💫 Heart Notes | 🌳 Base Notes
  Each note as a pill tag
- Fragrance Profile description
- Expandable sections:
  - Product Details
  - Shipping & Delivery
  - Return Policy
```

### Below: Related Products
```
"You May Also Like" — 4 products from same category
```

### SEO: Generate metadata for each product page:
```typescript
export async function generateMetadata({ params }) {
  // Fetch product from DB
  // Return: title, description, openGraph with product image
}
```

---

## Page 4: Cart Store `src/stores/cart.ts`
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  get subtotal(): number
  get itemCount(): number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.variant_id === item.variant_id)
        if (existing) {
          return { items: state.items.map(i => i.variant_id === item.variant_id ? { ...i, quantity: i.quantity + item.quantity } : i) }
        }
        return { items: [...state.items, item], isOpen: true }
      }),
      removeItem: (variantId) => set(state => ({ items: state.items.filter(i => i.variant_id !== variantId) })),
      updateQuantity: (variantId, quantity) => set(state => ({
        items: quantity <= 0
          ? state.items.filter(i => i.variant_id !== variantId)
          : state.items.map(i => i.variant_id === variantId ? { ...i, quantity } : i)
      })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
      get subtotal() { return get().items.reduce((s, i) => s + i.price * i.quantity, 0) },
      get itemCount() { return get().items.reduce((s, i) => s + i.quantity, 0) },
    }),
    { name: 'ursignature-cart' }
  )
)
```

---

## Page 5: Checkout Page `src/app/(storefront)/checkout/page.tsx`

Multi-step checkout (3 steps shown in a progress bar):

### Step 1: Contact & Address
```
- Email input
- Phone input
- Full Name
- Address Line 1, 2
- City, State, Pincode dropdowns
- "Save address for next time" checkbox (if logged in)
```

### Step 2: Review Order
```
- Order summary with all items, sizes, quantities
- Coupon code input with validation (hits /api/coupons/validate)
- Pricing breakdown: subtotal, discount, shipping, total
- Show free shipping indicator
```

### Step 3: Payment
```
- "Proceed to Secure Payment" button
- Loads Razorpay checkout
- Show Razorpay logo + "100% Secure" badges
- Payment icons: Visa, Mastercard, UPI, Net Banking
```

### Order Success Page `src/app/(storefront)/order-success/page.tsx`
```
- Show order confirmation with order number
- "Thank you for your order" message
- Estimated delivery: 5-7 business days
- CTA: Track Order | Continue Shopping
- Trigger: GA4 purchase event + Meta Pixel purchase event
```

---

## COMPLETION CRITERIA
- [ ] Homepage with all 11 sections, fully responsive
- [ ] Collection listing and detail pages
- [ ] Product detail page with all features
- [ ] Cart persisted in localStorage via Zustand
- [ ] Cart drawer slides in/out smoothly
- [ ] Checkout multi-step with address form
- [ ] Order success page
- [ ] All pages generate proper SEO metadata
- [ ] Fully mobile-responsive (test at 375px, 768px, 1440px)
