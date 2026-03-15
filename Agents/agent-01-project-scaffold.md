# CURSOR AGENT 01 — Project Scaffold & Configuration

## Your Role
You are a senior Next.js architect. Your job is to scaffold the complete URsignature e-commerce project with all dependencies, folder structure, TypeScript config, and environment variable templates.

---

## Task: Bootstrap the Project

### Step 1: Initialize Next.js 14
```bash
npx create-next-app@latest ursignature --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd ursignature
```

### Step 2: Install All Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr \
  razorpay \
  @aws-sdk/client-s3 @aws-sdk/s3-request-presigner \
  node-telegram-bot-api \
  framer-motion \
  zustand \
  react-hook-form zod @hookform/resolvers \
  sharp \
  next-seo \
  slugify \
  date-fns \
  recharts \
  @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast @radix-ui/react-tabs @radix-ui/react-select @radix-ui/react-switch @radix-ui/react-slider \
  class-variance-authority clsx tailwind-merge \
  lucide-react \
  react-hot-toast \
  @tanstack/react-query \
  axios \
  nanoid \
  qrcode \
  html2canvas jspdf \
  next-themes
```

```bash
npm install -D @types/node wrangler prettier prettier-plugin-tailwindcss
```

---

### Step 3: Create This Exact Folder Structure
```
src/
├── app/
│   ├── (storefront)/           # Public-facing store
│   │   ├── page.tsx            # Homepage
│   │   ├── layout.tsx
│   │   ├── collections/
│   │   │   └── [slug]/page.tsx
│   │   ├── product/
│   │   │   └── [slug]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── order-success/page.tsx
│   │   ├── account/
│   │   │   ├── page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── track-order/page.tsx
│   ├── (admin)/                # Admin panel - protected
│   │   ├── layout.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── inventory/page.tsx
│   │   │   ├── coupons/page.tsx
│   │   │   ├── customers/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── pos/page.tsx
│   │   │   └── settings/page.tsx
│   └── api/
│       ├── auth/
│       │   └── callback/route.ts
│       ├── products/route.ts
│       ├── orders/route.ts
│       ├── payment/
│       │   ├── create-order/route.ts
│       │   └── verify/route.ts
│       ├── shipping/
│       │   ├── create-shipment/route.ts
│       │   └── track/route.ts
│       ├── upload/route.ts
│       ├── coupons/validate/route.ts
│       ├── telegram/webhook/route.ts
│       └── analytics/track/route.ts
├── components/
│   ├── ui/                     # Base design system components
│   ├── storefront/             # Store-specific components
│   ├── admin/                  # Admin-specific components
│   └── shared/                 # Shared across both
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── razorpay.ts
│   ├── r2.ts
│   ├── shiprocket.ts
│   ├── telegram.ts
│   ├── analytics.ts
│   └── utils.ts
├── hooks/
│   ├── useCart.ts
│   ├── useAuth.ts
│   ├── useProducts.ts
│   └── useAdmin.ts
├── stores/
│   └── cart.ts
├── types/
│   └── index.ts
└── styles/
    └── globals.css
```

---

### Step 4: Create `.env.example`
Create this file at the project root:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx

# Cloudflare R2
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=ursignature-media
NEXT_PUBLIC_R2_PUBLIC_URL=https://media.ursignature.com

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_group_or_channel_id

# Shiprocket
SHIPROCKET_EMAIL=your_shiprocket_email
SHIPROCKET_PASSWORD=your_shiprocket_password

# Analytics
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=your_meta_pixel_id

# App
NEXT_PUBLIC_APP_URL=https://ursignature.com
NEXT_PUBLIC_APP_NAME=URsignature
ADMIN_SECRET_KEY=generate_a_random_64_char_string

# Cron / Webhooks
CRON_SECRET=generate_another_random_secret
```

---

### Step 5: Create `src/types/index.ts`
Define all TypeScript types for the project:

```typescript
export type Product = {
  id: string
  name: string
  slug: string
  tagline: string
  description: string
  inspired_by: string
  category_type: 'men' | 'women' | 'unisex'
  fragrance_profile: string
  top_notes: string[]
  heart_notes: string[]
  base_notes: string[]
  rating: number
  images: string[]     // R2 URLs
  is_featured: boolean
  is_active: boolean
  created_at: string
}

export type ProductVariant = {
  id: string
  product_id: string
  size_ml: number
  price: number
  compare_at_price: number | null
  sku: string
  stock_quantity: number
  is_active: boolean
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string
  banner_image: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
}

export type CartItem = {
  product_id: string
  variant_id: string
  name: string
  image: string
  size_ml: number
  price: number
  quantity: number
  slug: string
}

export type Order = {
  id: string
  order_number: string
  user_id: string | null
  guest_email: string | null
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_id: string | null
  razorpay_order_id: string | null
  subtotal: number
  discount: number
  shipping_charge: number
  total: number
  coupon_code: string | null
  shipping_address: ShippingAddress
  items: OrderItem[]
  shiprocket_order_id: string | null
  tracking_number: string | null
  notes: string | null
  is_pos: boolean
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  variant_id: string
  product_name: string
  size_ml: number
  quantity: number
  unit_price: number
  total_price: number
}

export type ShippingAddress = {
  name: string
  phone: string
  email: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  pincode: string
  country: string
}

export type Coupon = {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order_value: number | null
  max_discount: number | null
  usage_limit: number | null
  used_count: number
  per_user_limit: number | null
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export type User = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'customer' | 'admin'
  created_at: string
}
```

---

### Step 6: Create `src/lib/utils.ts`
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `URS-${timestamp}-${random}`
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str
}
```

---

### Step 7: Create `next.config.ts`
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.ursignature.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ]
  },
}

export default nextConfig
```

---

### Step 8: Product Data Seed File
Create `src/lib/seed-data.ts` with the following product array (to be seeded into Supabase):

```typescript
export const PRODUCTS_SEED = [
  {
    name: "Midnight Wild",
    slug: "midnight-wild",
    tagline: "Bold masculine freshness for the fearless",
    inspired_by: "Dior Sauvage",
    category_type: "men",
    fragrance_profile: "Fresh spicy, citrus, woody, amber",
    top_notes: ["Bergamot", "Pepper"],
    heart_notes: ["Lavender", "Geranium"],
    base_notes: ["Ambroxan", "Cedarwood"],
    rating: 5,
    description: "Midnight Wild opens with a burst of electric bergamot and sharp pepper — raw, wild, unapologetic. At its heart, lavender and geranium soften the intensity into something magnetic. The dry-down settles into warm ambroxan and cedarwood that lingers on skin for hours. This is the scent of confidence.",
  },
  {
    name: "Deep Blue",
    slug: "deep-blue",
    tagline: "Elegant versatility — from boardroom to bar",
    inspired_by: "Bleu de Chanel",
    category_type: "men",
    fragrance_profile: "Citrus, aromatic, woody, smoky",
    top_notes: ["Grapefruit", "Mint"],
    heart_notes: ["Jasmine", "Ginger"],
    base_notes: ["Incense", "Sandalwood"],
    rating: 5,
    description: "Deep Blue captures the duality of the modern man — crisp, composed, yet layered with depth. Grapefruit and mint create an immediate freshness; jasmine and ginger add intrigue; incense and sandalwood ground it in quiet authority. The scent that commands respect without demanding attention.",
  },
  {
    name: "King's Creed",
    slug: "kings-creed",
    tagline: "The signature of power",
    inspired_by: "Creed Aventus",
    category_type: "men",
    fragrance_profile: "Fruity, smoky, masculine, premium",
    top_notes: ["Pineapple", "Apple"],
    heart_notes: ["Birch", "Jasmine"],
    base_notes: ["Oakmoss", "Musk"],
    rating: 5,
    description: "King's Creed is a declaration. Pineapple and apple open with tropical regality before birch smoke and jasmine create a complex, charismatic heart. The oakmoss and musk base is primal, powerful, and unmistakably premium. When you wear this, rooms notice.",
  },
  {
    name: "Urban Edge",
    slug: "urban-edge",
    tagline: "The modern professional's signature",
    inspired_by: "YSL Y EDP",
    category_type: "men",
    fragrance_profile: "Fresh, modern, slightly sweet",
    top_notes: ["Apple", "Ginger"],
    heart_notes: ["Sage", "Geranium"],
    base_notes: ["Tonka Bean", "Amberwood"],
    rating: 4,
    description: "Urban Edge is precision in a bottle. The crisp bite of apple and ginger opens fresh and focused. Sage and geranium bring an intellectual depth. Tonka bean and amberwood close with warmth — like the end of a day well lived. Perfect for the driven, the ambitious, the polished.",
  },
  {
    name: "Game On",
    slug: "game-on",
    tagline: "Energy that never quits",
    inspired_by: "CR7 by Cristiano Ronaldo",
    category_type: "men",
    fragrance_profile: "Aromatic, sporty, youthful",
    top_notes: ["Bergamot", "Lavender"],
    heart_notes: ["Cardamom", "Cinnamon"],
    base_notes: ["Vanilla", "Musk"],
    rating: 4,
    description: "Game On is the scent of momentum. Bergamot and lavender launch it with athletic freshness, while cardamom and cinnamon ignite the heart with heat and spice. Vanilla and musk finish it with a crowd-pleasing warmth. For those who live at full speed.",
  },
  {
    name: "Mystic Berry",
    slug: "mystic-berry",
    tagline: "Exclusively yours — a scent like no other",
    inspired_by: "Original URsignature Creation",
    category_type: "women",
    fragrance_profile: "Fruity, soft musky, delicate",
    top_notes: ["Blackberry"],
    heart_notes: ["Violet", "Soft Musk"],
    base_notes: ["White Musk", "Powdery Notes"],
    rating: 4,
    description: "Mystic Berry is URsignature's original — built from imagination, not imitation. The lush burst of blackberry fades into a violet and soft musk heart that feels like a secret whispered. White musk and powder finish with a trail so delicate it becomes part of you. This is your scent.",
  },
  {
    name: "Velvet Desire",
    slug: "velvet-desire",
    tagline: "For nights that linger in memory",
    inspired_by: "Good Girl by Carolina Herrera",
    category_type: "women",
    fragrance_profile: "Sweet, sexy, floral, gourmand",
    top_notes: ["Almond", "Coffee"],
    heart_notes: ["Jasmine", "Tuberose"],
    base_notes: ["Tonka Bean", "Cocoa"],
    rating: 5,
    description: "Velvet Desire opens like a temptation — almond and coffee, sweet and roasted. Jasmine and tuberose bloom in the heart with opulent, intoxicating femininity. Tonka bean and cocoa at the base make it rich, almost edible. This is a scent for the woman who owns every room she enters.",
  },
  {
    name: "Bloom Kiss",
    slug: "bloom-kiss",
    tagline: "Romance, bottled",
    inspired_by: "Gucci Flora",
    category_type: "women",
    fragrance_profile: "Light floral, fruity, citrusy",
    top_notes: ["Citrus", "Peony"],
    heart_notes: ["Rose", "Osmanthus"],
    base_notes: ["Patchouli", "Sandalwood"],
    rating: 4,
    description: "Bloom Kiss is first-light freshness — a garden at dawn. Citrus and peony open with airy, luminous energy. Rose and osmanthus bloom in the heart with graceful elegance. Patchouli and sandalwood ground it with earthy warmth. Effortless, romantic, made for every day.",
  },
  {
    name: "Flirt Rush",
    slug: "flirt-rush",
    tagline: "Young, free, and intoxicatingly fun",
    inspired_by: "Bombshell by Victoria's Secret",
    category_type: "women",
    fragrance_profile: "Fruity, floral, fresh, flirty",
    top_notes: ["Passionfruit", "Grapefruit"],
    heart_notes: ["Peony", "Vanilla Orchid"],
    base_notes: ["Musk", "Woody Notes"],
    rating: 4,
    description: "Flirt Rush is pure joy in a bottle. Passionfruit and grapefruit explode with playful, vibrant freshness. Peony and vanilla orchid soften the middle into something irresistibly flirty. Musk and wood carry it forward with warmth. The scent for sunshine, laughter, and spontaneous adventures.",
  },
  {
    name: "Royal Oud",
    slug: "royal-oud",
    tagline: "Royalty distilled — for those who demand the extraordinary",
    inspired_by: "Amir Al Oudh",
    category_type: "unisex",
    fragrance_profile: "Sweet oud, smoky, oriental, luxurious",
    top_notes: ["Rose", "Saffron"],
    heart_notes: ["Oud", "Patchouli"],
    base_notes: ["Amber", "Musk", "Sandalwood"],
    rating: 5,
    description: "Royal Oud is not a fragrance — it's a ceremony. Saffron and rose announce it like a royal procession. The heart is pure oud and patchouli — dark, complex, uncompromising. Amber, musk, and sandalwood close it in a warm, smoky embrace that lasts all day and into the night. For those who wear their power.",
  },
]
```

---

### Step 9: Configure Tailwind
Update `tailwind.config.ts` to include custom brand tokens:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        noir: '#0A0A0A',
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E2C87A',
          dark: '#9A7A30',
        },
        ivory: '#F5F0E8',
        smoke: '#6B6B6B',
        charcoal: '#1A1A1A',
        mist: '#E8E4DD',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

---

### Step 10: Add Google Fonts to `app/layout.tsx`
Import these fonts from Google Fonts in the root layout using `next/font/google`:
- `Cormorant_Garamond` (weights: 300, 400, 500, 600, 700, italic variants)
- `DM_Sans` (weights: 300, 400, 500, 600)

---

### COMPLETION CRITERIA
- [ ] `package.json` has all dependencies listed
- [ ] Full folder structure created with placeholder `page.tsx` / `route.ts` files
- [ ] `.env.example` created with all variables documented
- [ ] `types/index.ts` complete with all types
- [ ] `tailwind.config.ts` has brand colors and fonts
- [ ] Seed data file complete with all 10 products
- [ ] `next.config.ts` configured
- [ ] Git initialized with `.gitignore` (node_modules, .env.local, .next)