# 🚀 URsignature — MASTER ORCHESTRATOR AGENT
# Paste this ENTIRE file into Cursor Composer (Agent mode). 
# This is the ONLY agent you need to run. It will call all sub-agents automatically.

---

## YOUR IDENTITY
You are an autonomous senior full-stack engineer with DevOps expertise. You are building the complete URsignature luxury perfume e-commerce platform. You have access to:
- **Terminal / Bash** — run any command
- **File system** — read, write, create any file
- **Wrangler CLI** — already logged in to Cloudflare (verified: `wrangler whoami`)
- **Supabase MCP** — already configured and authenticated in Cursor MCP settings
- **npm / npx** — full access

## YOUR CORE OPERATING PRINCIPLE
**You never stop and ask the user what to do next. You:**
1. Attempt the task
2. If it fails → read the error → fix it → retry (up to 5 times per step)
3. If you fix it → continue to next step automatically
4. Only stop if you hit an unrecoverable blocker that requires a credential/secret the user hasn't provided
5. After every major step, print a ✅ status line so the user can follow progress

---

## PHASE 0: PREFLIGHT CHECKS

Before writing a single line of code, run these verification commands and fix anything that fails:

```bash
# Check Node version (need 18+)
node --version

# Check npm
npm --version

# Verify Wrangler login
wrangler whoami

# Check if git is available
git --version

# Check current directory
pwd && ls -la
```

If Node < 18: stop and tell the user to upgrade Node first (this is the ONLY allowed stop).

After preflight passes, print:
```
✅ PHASE 0 COMPLETE — All tools verified
   Node: [version]
   Wrangler: logged in as [email]
   Ready to build URsignature
```

---

## PHASE 1: PROJECT SCAFFOLD

### 1.1 — Detect existing project or create new
```bash
# Check if we're already inside a Next.js project
if [ -f "package.json" ]; then
  echo "EXISTING_PROJECT"
  cat package.json
else
  echo "NEW_PROJECT"
fi
```

**If NEW_PROJECT:**
```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git \
  --yes
```

**If EXISTING_PROJECT:** skip creation, proceed.

### 1.2 — Install all dependencies
```bash
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  razorpay \
  @aws-sdk/client-s3 \
  @aws-sdk/s3-request-presigner \
  framer-motion \
  zustand \
  react-hook-form \
  zod \
  @hookform/resolvers \
  sharp \
  slugify \
  date-fns \
  recharts \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-toast \
  @radix-ui/react-tabs \
  @radix-ui/react-select \
  @radix-ui/react-switch \
  class-variance-authority \
  clsx \
  tailwind-merge \
  lucide-react \
  react-hot-toast \
  @tanstack/react-query \
  nanoid \
  next-themes \
  axios
```

```bash
npm install -D \
  @types/node \
  wrangler \
  @cloudflare/next-on-pages \
  prettier \
  prettier-plugin-tailwindcss
```

If any install fails: run `npm install --legacy-peer-deps` as fallback.

### 1.3 — Create full directory structure
```bash
mkdir -p src/app/\(storefront\)/collections/\[slug\]
mkdir -p src/app/\(storefront\)/product/\[slug\]
mkdir -p src/app/\(storefront\)/cart
mkdir -p src/app/\(storefront\)/checkout
mkdir -p src/app/\(storefront\)/order-success
mkdir -p src/app/\(storefront\)/account/orders
mkdir -p src/app/\(storefront\)/account/profile
mkdir -p src/app/\(storefront\)/login
mkdir -p src/app/\(storefront\)/signup
mkdir -p src/app/\(storefront\)/track-order
mkdir -p src/app/\(admin\)/admin/products/new
mkdir -p "src/app/(admin)/admin/products/[id]"
mkdir -p src/app/\(admin\)/admin/categories
mkdir -p src/app/\(admin\)/admin/orders
mkdir -p "src/app/(admin)/admin/orders/[id]"
mkdir -p src/app/\(admin\)/admin/inventory
mkdir -p src/app/\(admin\)/admin/coupons
mkdir -p src/app/\(admin\)/admin/customers
mkdir -p src/app/\(admin\)/admin/analytics
mkdir -p src/app/\(admin\)/admin/pos
mkdir -p src/app/\(admin\)/admin/settings
mkdir -p src/app/api/auth/callback
mkdir -p src/app/api/products
mkdir -p src/app/api/orders
mkdir -p src/app/api/payment/create-order
mkdir -p src/app/api/payment/verify
mkdir -p src/app/api/shipping/create-shipment
mkdir -p src/app/api/shipping/track
mkdir -p src/app/api/upload/presign
mkdir -p src/app/api/coupons/validate
mkdir -p src/app/api/telegram/webhook
mkdir -p src/app/api/analytics/track
mkdir -p src/app/api/cron/daily-report
mkdir -p src/app/api/cron/stock-check
mkdir -p src/app/api/admin/products
mkdir -p src/app/api/admin/orders
mkdir -p src/app/api/admin/inventory
mkdir -p src/app/api/admin/settings
mkdir -p src/components/ui
mkdir -p src/components/storefront
mkdir -p src/components/admin
mkdir -p src/components/shared
mkdir -p src/lib/supabase
mkdir -p src/hooks
mkdir -p src/stores
mkdir -p src/types
mkdir -p src/styles
mkdir -p public/images/products
mkdir -p public/images/categories
mkdir -p public/fonts
```

### 1.4 — Copy perfume images from workspace
The perfume images are already in the Cursor workspace under "Perfume images" folder. Find them and copy:
```bash
# Find where the perfume image folders are
find . -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" -o -name "*.webp" | grep -i -E "bloom|deep.blue|flirt|game|kings|midnight|mystic|royal|urban|velvet|logo" | head -30
```

Then for each found image, copy to `public/images/products/` with the correct slug name:
- Any image in "Bloom Kiss" folder → `public/images/products/bloom-kiss-1.jpg` (and -2, -3 if multiple)
- Any image in "Deep Blue" folder → `public/images/products/deep-blue-1.jpg`
- Any image in "Flirt Rush" folder → `public/images/products/flirt-rush-1.jpg`
- Any image in "Game On" folder → `public/images/products/game-on-1.jpg`
- Any image in "Kings Creed" folder → `public/images/products/kings-creed-1.jpg`
- Any image in "Midnight Wild" folder → `public/images/products/midnight-wild-1.jpg`
- Any image in "Mystic Berry" folder → `public/images/products/mystic-berry-1.jpg`
- Any image in "Royal Oud" folder → `public/images/products/royal-oud-1.jpg`
- Any image in "Urban Edge" folder → `public/images/products/urban-edge-1.jpg`
- Any image in "Velvet Desire" folder → `public/images/products/velvet-desire-1.jpg`
- Any file named `logo.png` or `logo.*` → `public/logo.png`

After copying, verify:
```bash
ls -la public/images/products/
ls -la public/logo.png 2>/dev/null || echo "WARNING: logo.png not found — place it at public/logo.png"
```

### 1.5 — Verify build compiles
```bash
npm run build 2>&1 | tail -20
```
If build fails at this stage: fix TypeScript errors, missing imports, etc. before proceeding.

Print: `✅ PHASE 1 COMPLETE — Project scaffolded, dependencies installed, images copied`

---

## PHASE 2: ENVIRONMENT & CONFIGURATION FILES

### 2.1 — Create `.env.local`
⚠️ STOP HERE ONLY IF: The user has not provided the env values yet.

Check if `.env.local` already exists:
```bash
cat .env.local 2>/dev/null && echo "EXISTS" || echo "NOT_FOUND"
```

If NOT_FOUND, create it with placeholder comments and ask user to fill these specific values (print as a clean list):
```
🔑 REQUIRED CREDENTIALS — Please fill these in .env.local:

1. SUPABASE: Go to supabase.com → Your project → Settings → API
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=

2. RAZORPAY: razorpay.com → Settings → API Keys
   RAZORPAY_KEY_ID=
   RAZORPAY_KEY_SECRET=
   NEXT_PUBLIC_RAZORPAY_KEY_ID=

3. CLOUDFLARE R2: cloudflare.com → R2 → Manage R2 API Tokens
   R2_ACCOUNT_ID=
   R2_ACCESS_KEY_ID=
   R2_SECRET_ACCESS_KEY=
   R2_BUCKET_NAME=ursignature-media
   NEXT_PUBLIC_R2_PUBLIC_URL=https://media.ursignature.com

4. TELEGRAM: @BotFather on Telegram
   TELEGRAM_BOT_TOKEN=
   TELEGRAM_CHAT_ID=

5. SHIPROCKET: shiprocket.in credentials
   SHIPROCKET_EMAIL=
   SHIPROCKET_PASSWORD=

6. ANALYTICS (can add later):
   NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_META_PIXEL_ID=

7. APP CONFIG:
   NEXT_PUBLIC_APP_URL=https://ursignature.com
   NEXT_PUBLIC_APP_NAME=URsignature
   CRON_SECRET=[generate random 32-char string]
```

Once `.env.local` exists (even partially filled), continue with the rest. Mark unfilled ones as TODO.

### 2.2 — Create all config files

**`next.config.ts`:**
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.ursignature.com' },
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: '*.cloudflarestorage.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
}

export default nextConfig
```

**`tailwind.config.ts`** — full brand config with colors, fonts, animations:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        noir: { DEFAULT: '#0A0A0A', 50: '#1A1A1A', 100: '#111111' },
        gold: { DEFAULT: '#C9A84C', light: '#E2C87A', dark: '#9A7A30', muted: 'rgba(201,168,76,0.15)' },
        ivory: { DEFAULT: '#F5F0E8', muted: '#D4CEC5' },
        smoke: { DEFAULT: '#6B6B6B', light: '#9B9B9B', dark: '#3A3A3A' },
        charcoal: '#111111',
        mist: '#1E1E1E',
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'shimmer': 'shimmer 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-out-right': 'slideOutRight 0.3s ease-in forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        slideInRight: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        slideOutRight: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(105deg, #C9A84C 0%, #F0D98A 40%, #C9A84C 60%, #9A7A30 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
        'hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%)',
      },
      boxShadow: {
        'gold': '0 0 0 1px rgba(201,168,76,0.3)',
        'gold-lg': '0 8px 32px rgba(201,168,76,0.12)',
        'dark': '0 4px 24px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}

export default config
```

Print: `✅ PHASE 2 COMPLETE — Config files created`

---

## PHASE 3: SUPABASE DATABASE (using Supabase MCP)

Use the **Supabase MCP** tool to execute all SQL. Do NOT use the Supabase web dashboard manually.

### 3.1 — Run schema via Supabase MCP
Execute this complete SQL using the MCP `query` or `execute_sql` tool:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  banner_image TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  description TEXT,
  short_description TEXT,
  inspired_by TEXT,
  category_type TEXT CHECK (category_type IN ('men', 'women', 'unisex')),
  fragrance_profile TEXT,
  top_notes TEXT[] DEFAULT '{}',
  heart_notes TEXT[] DEFAULT '{}',
  base_notes TEXT[] DEFAULT '{}',
  rating NUMERIC(3,2) DEFAULT 5.0,
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT-CATEGORY JUNCTION
CREATE TABLE IF NOT EXISTS product_categories (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size_ml INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),
  sku TEXT NOT NULL UNIQUE,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC(10,2) NOT NULL,
  min_order_value NUMERIC(10,2),
  max_discount NUMERIC(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_usages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id),
  user_id UUID REFERENCES profiles(id),
  order_id UUID,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guest_email TEXT,
  guest_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_method TEXT DEFAULT 'razorpay',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  shipping_charge NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  coupon_code TEXT,
  coupon_id UUID REFERENCES coupons(id),
  shipping_address JSONB NOT NULL,
  shiprocket_order_id TEXT,
  shiprocket_shipment_id TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  courier_name TEXT,
  notes TEXT,
  is_pos BOOLEAN DEFAULT false,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  size_ml INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVENTORY TRANSACTIONS
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  variant_id UUID REFERENCES product_variants(id),
  type TEXT CHECK (type IN ('sale','restock','adjustment','pos_sale','return')),
  quantity_change INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  order_id UUID REFERENCES orders(id),
  note TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANALYTICS EVENTS
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL,
  session_id TEXT,
  user_id UUID REFERENCES profiles(id),
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES orders(id),
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NEWSLETTER
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO settings (key, value, description) VALUES
  ('free_shipping_threshold', '999', 'Minimum order for free shipping (INR)'),
  ('default_shipping_charge', '99', 'Default shipping charge (INR)'),
  ('low_stock_threshold', '10', 'Global low stock alert threshold'),
  ('store_name', 'URsignature', 'Store name'),
  ('store_email', 'hello@ursignature.com', 'Store email'),
  ('instagram_url', 'https://instagram.com/ursignature', 'Instagram URL'),
  ('whatsapp_number', '+919999999999', 'WhatsApp number'),
  ('announcement_bar', '✨ Free shipping on orders above ₹999 | Premium Fragrances at Honest Prices', 'Announcement bar'),
  ('meta_title', 'URsignature — Premium Inspired Fragrances', 'Default SEO title'),
  ('meta_description', 'Shop luxury inspired fragrances at honest prices. Long-lasting premium perfumes for men, women and unisex. Inspired by the world finest.', 'Default SEO description')
ON CONFLICT (key) DO NOTHING;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured, is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC);

-- TRIGGERS: auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;
DO $$ BEGIN
  CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;
DO $$ BEGIN
  CREATE TRIGGER trg_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;
DO $$ BEGIN
  CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

-- TRIGGER: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (new.id, new.email, 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "own_profile_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "own_profile_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "own_addresses" ON addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "own_orders" ON orders FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "service_manages_orders" ON orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "service_manages_items" ON order_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "public_products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY IF NOT EXISTS "public_categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY IF NOT EXISTS "public_variants" ON product_variants FOR SELECT USING (is_active = true);
CREATE POLICY IF NOT EXISTS "public_product_categories" ON product_categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "own_reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "approved_reviews" ON reviews FOR SELECT USING (is_approved = true);
```

After executing, verify tables were created:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
```

### 3.2 — Seed initial data via Supabase MCP

```sql
-- INSERT CATEGORIES
INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES
  ('Men', 'men', 'Premium fragrances for men', 1, true),
  ('Women', 'women', 'Luxurious fragrances for women', 2, true),
  ('Unisex', 'unisex', 'Fragrances for everyone', 3, true),
  ('Featured', 'featured', 'Our most loved fragrances', 4, true),
  ('Best Sellers', 'best-sellers', 'Top selling fragrances', 5, true),
  ('New Arrivals', 'new-arrivals', 'Latest additions', 6, true),
  ('Premium Collection', 'premium', 'Our ultra-premium selection', 7, true),
  ('Gift Sets', 'gift-sets', 'Perfect gifts', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- INSERT ALL 10 PRODUCTS
INSERT INTO products (name, slug, tagline, description, short_description, inspired_by, category_type, fragrance_profile, top_notes, heart_notes, base_notes, rating, is_featured, is_active, meta_title, meta_description) VALUES

('Midnight Wild', 'midnight-wild',
 'Bold masculine freshness for the fearless',
 'Midnight Wild opens with a burst of electric bergamot and sharp pepper — raw, wild, unapologetic. At its heart, lavender and geranium soften the intensity into something magnetic. The dry-down settles into warm ambroxan and cedarwood that lingers on skin for hours. This is the scent of confidence.',
 'Fresh spicy citrus fragrance with ambroxan and cedarwood base. Bold, masculine, all-day wear.',
 'Dior Sauvage', 'men', 'Fresh spicy, citrus, woody, amber',
 ARRAY['Bergamot', 'Pepper'], ARRAY['Lavender', 'Geranium'], ARRAY['Ambroxan', 'Cedarwood'],
 5.0, true, true,
 'Midnight Wild — Inspired by Dior Sauvage | URsignature',
 'Shop Midnight Wild, a bold masculine fragrance inspired by Dior Sauvage. Fresh bergamot, pepper, lavender and ambroxan. Premium quality at honest prices.'),

('Deep Blue', 'deep-blue',
 'Elegant versatility — from boardroom to bar',
 'Deep Blue captures the duality of the modern man — crisp, composed, yet layered with depth. Grapefruit and mint create an immediate freshness; jasmine and ginger add intrigue; incense and sandalwood ground it in quiet authority.',
 'Citrus aromatic woody fragrance. Versatile, elegant, perfect for all occasions.',
 'Bleu de Chanel', 'men', 'Citrus, aromatic, woody, smoky',
 ARRAY['Grapefruit', 'Mint'], ARRAY['Jasmine', 'Ginger'], ARRAY['Incense', 'Sandalwood'],
 5.0, true, true,
 'Deep Blue — Inspired by Bleu de Chanel | URsignature',
 'Shop Deep Blue, inspired by Bleu de Chanel. Citrus, woody and aromatic perfume for men. Premium fragrance at affordable prices.'),

('King''s Creed', 'kings-creed',
 'The signature of power',
 'King''s Creed is a declaration. Pineapple and apple open with tropical regality before birch smoke and jasmine create a complex, charismatic heart. The oakmoss and musk base is primal, powerful, and unmistakably premium.',
 'Fruity smoky masculine fragrance. The scent of ambition and success.',
 'Creed Aventus', 'men', 'Fruity, smoky, masculine, premium',
 ARRAY['Pineapple', 'Apple'], ARRAY['Birch', 'Jasmine'], ARRAY['Oakmoss', 'Musk'],
 5.0, true, true,
 'King''s Creed — Inspired by Creed Aventus | URsignature',
 'Shop King''s Creed, inspired by Creed Aventus. Pineapple, birch and oakmoss. The ultimate signature scent for men.'),

('Urban Edge', 'urban-edge',
 'The modern professional''s signature',
 'Urban Edge is precision in a bottle. The crisp bite of apple and ginger opens fresh and focused. Sage and geranium bring intellectual depth. Tonka bean and amberwood close with warmth.',
 'Fresh modern slightly sweet fragrance for the driven professional.',
 'YSL Y EDP', 'men', 'Fresh, modern, slightly sweet',
 ARRAY['Apple', 'Ginger'], ARRAY['Sage', 'Geranium'], ARRAY['Tonka Bean', 'Amberwood'],
 4.0, false, true,
 'Urban Edge — Inspired by YSL Y EDP | URsignature',
 'Shop Urban Edge, inspired by YSL Y EDP. Fresh apple, sage and tonka bean. Perfect for office and date nights.'),

('Game On', 'game-on',
 'Energy that never quits',
 'Game On is the scent of momentum. Bergamot and lavender launch it with athletic freshness, while cardamom and cinnamon ignite the heart with heat and spice. Vanilla and musk finish with crowd-pleasing warmth.',
 'Aromatic sporty youthful fragrance. For those who live at full speed.',
 'CR7 by Cristiano Ronaldo', 'men', 'Aromatic, sporty, youthful',
 ARRAY['Bergamot', 'Lavender'], ARRAY['Cardamom', 'Cinnamon'], ARRAY['Vanilla', 'Musk'],
 4.0, false, true,
 'Game On — Sporty Aromatic Fragrance | URsignature',
 'Shop Game On, an energetic sporty fragrance inspired by CR7. Bergamot, cardamom and vanilla musk. Perfect for active lifestyles.'),

('Mystic Berry', 'mystic-berry',
 'Exclusively yours — a scent like no other',
 'Mystic Berry is URsignature''s original creation — built from imagination, not imitation. The lush burst of blackberry fades into a violet and soft musk heart. White musk and powder finish with a trail so delicate it becomes part of you.',
 'Unique fruity musky fragrance. URsignature original creation.',
 'URsignature Original', 'women', 'Fruity, soft musky, delicate',
 ARRAY['Blackberry'], ARRAY['Violet', 'Soft Musk'], ARRAY['White Musk', 'Powdery Notes'],
 4.0, false, true,
 'Mystic Berry — Original URsignature Creation',
 'Shop Mystic Berry, an exclusive URsignature original fragrance. Blackberry, violet, white musk. Unique signature scent for women.'),

('Velvet Desire', 'velvet-desire',
 'For nights that linger in memory',
 'Velvet Desire opens like a temptation — almond and coffee, sweet and roasted. Jasmine and tuberose bloom in the heart with opulent femininity. Tonka bean and cocoa close it in a rich, almost edible embrace.',
 'Sweet sexy floral gourmand fragrance for the woman who owns every room.',
 'Good Girl by Carolina Herrera', 'women', 'Sweet, sexy, floral, gourmand',
 ARRAY['Almond', 'Coffee'], ARRAY['Jasmine', 'Tuberose'], ARRAY['Tonka Bean', 'Cocoa'],
 5.0, true, true,
 'Velvet Desire — Inspired by Good Girl | URsignature',
 'Shop Velvet Desire, inspired by Good Girl by Carolina Herrera. Sweet almond, jasmine, tonka bean. Seductive night fragrance.'),

('Bloom Kiss', 'bloom-kiss',
 'Romance, bottled',
 'Bloom Kiss is first-light freshness — a garden at dawn. Citrus and peony open with airy luminous energy. Rose and osmanthus bloom with graceful elegance. Patchouli and sandalwood ground it with earthy warmth.',
 'Light floral fruity fragrance. Romantic and elegant for daily wear.',
 'Gucci Flora', 'women', 'Light floral, fruity, citrusy',
 ARRAY['Citrus', 'Peony'], ARRAY['Rose', 'Osmanthus'], ARRAY['Patchouli', 'Sandalwood'],
 4.0, false, true,
 'Bloom Kiss — Inspired by Gucci Flora | URsignature',
 'Shop Bloom Kiss, inspired by Gucci Flora. Peony, rose and sandalwood. Light romantic fragrance for everyday wear.'),

('Flirt Rush', 'flirt-rush',
 'Young, free, and intoxicatingly fun',
 'Flirt Rush is pure joy in a bottle. Passionfruit and grapefruit explode with playful vibrant freshness. Peony and vanilla orchid soften into something irresistibly flirty. Musk and wood carry it forward with warmth.',
 'Fruity floral fresh fragrance. The scent for sunshine and spontaneous adventures.',
 'Bombshell by Victoria''s Secret', 'women', 'Fruity, floral, fresh, flirty',
 ARRAY['Passionfruit', 'Grapefruit'], ARRAY['Peony', 'Vanilla Orchid'], ARRAY['Musk', 'Woody Notes'],
 4.0, false, true,
 'Flirt Rush — Inspired by Bombshell | URsignature',
 'Shop Flirt Rush, inspired by Bombshell by Victoria''s Secret. Passionfruit, peony and musk. Fun flirty fragrance for women.'),

('Royal Oud', 'royal-oud',
 'Royalty distilled — for those who demand the extraordinary',
 'Royal Oud is not a fragrance — it is a ceremony. Saffron and rose announce it like a royal procession. The heart is pure oud and patchouli — dark, complex, uncompromising. Amber, musk and sandalwood close in a warm smoky embrace that lasts all day.',
 'Oriental oud fragrance. Strong projection, long-lasting, luxurious.',
 'Amir Al Oudh', 'unisex', 'Sweet oud, smoky, oriental, luxurious',
 ARRAY['Rose', 'Saffron'], ARRAY['Oud', 'Patchouli'], ARRAY['Amber', 'Musk', 'Sandalwood'],
 5.0, true, true,
 'Royal Oud — Premium Oud Fragrance | URsignature',
 'Shop Royal Oud, an Arabian-inspired oud fragrance. Rose, saffron, oud and amber. Strong projection, all-day wear.')

ON CONFLICT (slug) DO NOTHING;

-- INSERT 50ML VARIANTS FOR ALL PRODUCTS
DO $$
DECLARE
  p RECORD;
  sku_val TEXT;
BEGIN
  FOR p IN SELECT id, slug FROM products LOOP
    sku_val := 'URS-' || UPPER(LEFT(REPLACE(p.slug, '-', ''), 8)) || '-50';
    INSERT INTO product_variants (product_id, size_ml, price, compare_at_price, sku, stock_quantity, low_stock_threshold)
    VALUES (p.id, 50, 599.00, 1199.00, sku_val, 100, 10)
    ON CONFLICT (sku) DO NOTHING;
  END LOOP;
END $$;

-- ASSIGN PRODUCTS TO CATEGORIES
DO $$
DECLARE
  men_id UUID;
  women_id UUID;
  unisex_id UUID;
  featured_id UUID;
  premium_id UUID;
BEGIN
  SELECT id INTO men_id FROM categories WHERE slug = 'men';
  SELECT id INTO women_id FROM categories WHERE slug = 'women';
  SELECT id INTO unisex_id FROM categories WHERE slug = 'unisex';
  SELECT id INTO featured_id FROM categories WHERE slug = 'featured';
  SELECT id INTO premium_id FROM categories WHERE slug = 'premium';

  -- Men products
  INSERT INTO product_categories (product_id, category_id)
  SELECT p.id, men_id FROM products p WHERE p.category_type = 'men'
  ON CONFLICT DO NOTHING;

  -- Women products
  INSERT INTO product_categories (product_id, category_id)
  SELECT p.id, women_id FROM products p WHERE p.category_type = 'women'
  ON CONFLICT DO NOTHING;

  -- Unisex products
  INSERT INTO product_categories (product_id, category_id)
  SELECT p.id, unisex_id FROM products p WHERE p.category_type = 'unisex'
  ON CONFLICT DO NOTHING;

  -- Featured products (5-star rating)
  INSERT INTO product_categories (product_id, category_id)
  SELECT p.id, featured_id FROM products p WHERE p.is_featured = true
  ON CONFLICT DO NOTHING;

  -- Premium collection (5-star)
  INSERT INTO product_categories (product_id, category_id)
  SELECT p.id, premium_id FROM products p WHERE p.rating = 5.0
  ON CONFLICT DO NOTHING;
END $$;

-- CREATE WELCOME COUPONS
INSERT INTO coupons (code, type, value, min_order_value, max_discount, usage_limit, per_user_limit, is_active) VALUES
  ('WELCOME10', 'percentage', 10, 599, 100, 1000, 1, true),
  ('FIRSTORDER', 'fixed', 100, 599, NULL, 500, 1, true),
  ('ROYAL20', 'percentage', 20, 999, 200, 100, 1, true)
ON CONFLICT (code) DO NOTHING;
```

Verify seeding worked:
```sql
SELECT name, slug, category_type, is_featured FROM products ORDER BY name;
SELECT name, slug FROM categories;
SELECT p.name, pv.size_ml, pv.price, pv.stock_quantity FROM products p JOIN product_variants pv ON pv.product_id = p.id ORDER BY p.name;
```

Print: `✅ PHASE 3 COMPLETE — Database schema created, all 10 products seeded`

---

## PHASE 4: CLOUDFLARE R2 BUCKET SETUP (using Wrangler)

### 4.1 — Create R2 bucket
```bash
wrangler r2 bucket create ursignature-media 2>&1

# Check if it was created
wrangler r2 bucket list 2>&1
```

If bucket already exists, that's fine — continue.

### 4.2 — Set R2 CORS policy
Create a temp cors file and apply it:
```bash
cat > /tmp/r2-cors.json << 'EOF'
[
  {
    "AllowedOrigins": ["https://ursignature.com", "http://localhost:3000", "http://localhost:3001"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
EOF

wrangler r2 bucket cors put ursignature-media --file /tmp/r2-cors.json 2>&1 || echo "CORS: Will need to set via dashboard — non-critical, continuing"
```

### 4.3 — Upload perfume images to R2
```bash
# Find and upload all perfume images
for img in public/images/products/*.{jpg,jpeg,png,webp}; do
  if [ -f "$img" ]; then
    filename=$(basename "$img")
    echo "Uploading: $filename"
    wrangler r2 object put "ursignature-media/products/$filename" --file "$img" 2>&1
  fi
done

# Upload logo
if [ -f "public/logo.png" ]; then
  wrangler r2 object put "ursignature-media/brand/logo.png" --file "public/logo.png" 2>&1
  echo "Logo uploaded"
fi

# Verify uploads
wrangler r2 object list ursignature-media --prefix products/ 2>&1 | head -20
```

### 4.4 — Update product image URLs in Supabase
After upload, update the products table with actual R2 URLs via Supabase MCP:

```sql
-- Construct R2 URLs based on uploaded image names
UPDATE products SET images = ARRAY['https://media.ursignature.com/products/bloom-kiss-1.jpg'] WHERE slug = 'bloom-kiss';
UPDATE products SET images = ARRAY['https://media.ursignature.com/products/deep-blue-1.jpg'] WHERE slug = 'deep-blue';
UPDATE products SET images = ARRAY['https://media.ursignature.com/products/flirt-rush-1.jpg'] WHERE slug = 'flirt-rush';
UPDATE products SET images = ARRAY['https://media.ursignature.com/products/game-on-1.jpg'] WHERE slug = 'game-on';
UPDATE products SET images = ARRAY['https://media.ursignature.com/products/kings-creed-1.jpg'] WHERE slug = 'kings-creed';
UPDATE products SET images = ARRAY['https://media.ursignature.com/products/midnight-wild-1.jpg'] WHERE slug = 'midnight-wild';
UPDATE products SET images = ARRAY['https://media.ursignature.com/products/mystic-berry-1.jpg'] WHERE slug = 'mystic-berry';
UPDATE products SET images = ARRAY['https://media.ursignature.com/products/royal-oud-1.jpg'] WHERE slug = 'royal-oud';
UPDATE products SET images = ARRAY['https://media.ursignature.com/products/urban-edge-1.jpg'] WHERE slug = 'urban-edge';
UPDATE products SET images = ARRAY['https://media.ursignature.com/products/velvet-desire-1.jpg'] WHERE slug = 'velvet-desire';
```

NOTE: The actual filenames depend on what was found in step 1.4. Adjust the SQL to match the actual filenames that were copied.

Print: `✅ PHASE 4 COMPLETE — R2 bucket created, images uploaded`

---

## PHASE 5: WRITE ALL SOURCE CODE

Now write ALL source code files. Do them in this order — each depends on the previous.

### 5.1 — Core Lib Files

Write `src/types/index.ts` — all TypeScript types (Product, ProductVariant, Category, CartItem, Order, OrderItem, ShippingAddress, Coupon, User, Settings)

Write `src/lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount)
}

export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `URS-${ts}-${rnd}`
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '...' : str
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
```

Write `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/middleware.ts` — full Supabase SSR setup with admin route protection

Write `src/lib/r2.ts` — full R2 upload/delete/presign functions

Write `src/lib/razorpay.ts` — create order + verify signature

Write `src/lib/shiprocket.ts` — token caching, create order, track

Write `src/lib/telegram.ts` — sendMessage, sendOrderAlert, sendLowStockAlert, sendDailyReport

Write `src/lib/analytics.ts` — trackEvent, trackPageView, trackProductView, trackAddToCart, trackPurchase

### 5.2 — Global Styles

Write `src/styles/globals.css` with:
- Cormorant Garamond + DM Sans Google Font imports
- CSS variables for all brand colors
- Custom scrollbar (gold)
- Selection color (gold background, noir text)
- `.text-gold-shimmer` animation class
- `.divider-gold` class
- Base body styles (noir bg, ivory text, font-body)

### 5.3 — UI Component Library (src/components/ui/)

Write each of these components completely:
- `Button.tsx` — variants: primary(gold), outline, ghost, danger; sizes: sm, md, lg; loading state
- `Input.tsx` — label, error, hint, dark theme
- `Textarea.tsx` — same as Input
- `Select.tsx` — custom styled select
- `Badge.tsx` — variants: gold, smoke, success, error, warning
- `Card.tsx` — dark card with hover border
- `Modal.tsx` — radix dialog, dark theme
- `Toast.tsx` — react-hot-toast config for dark theme
- `Skeleton.tsx` — shimmer loading skeleton
- `StarRating.tsx` — clickable and display modes
- `Spinner.tsx` — gold spinning loader
- `Tabs.tsx` — radix tabs, dark theme
- `Switch.tsx` — radix switch, gold active state
- `TagInput.tsx` — for fragrance notes (add/remove pill tags)
- `ImageUploader.tsx` — drag-drop upload to R2 (uses /api/upload)

### 5.4 — Storefront Components (src/components/storefront/)

**`AnnouncementBar.tsx`** — fetches from settings, marquee or static, gold bg, noir text, dismissible

**`Header.tsx`** — complete implementation:
- URsignature logo (SVG text + logo.png)
- Desktop nav: Collections, Men, Women, Unisex, About
- Sticky + blur on scroll
- Cart icon with animated count badge
- Account icon (shows avatar if logged in)
- Mobile hamburger → full-screen overlay menu

**`Footer.tsx`** — complete:
- Logo + tagline
- 3 column links
- Social icons
- Trust badges (authentic, free shipping, easy returns)
- Payment icons (UPI, Visa, Mastercard, RazorPay)
- Copyright

**`ProductCard.tsx`** — complete:
- Image with aspect-ratio 4/5, next/image with blur placeholder
- Hover: image zoom + "Add to Cart" slides up
- Product name (Cormorant), tagline, price, compare price
- Stars, "Inspired by" tag
- Out-of-stock overlay
- Loading skeleton state

**`ProductGrid.tsx`** — responsive grid wrapper with skeleton loading

**`NotesBadge.tsx`** — fragrance notes pills, color coded (green/pink/brown for top/heart/base)

**`CartDrawer.tsx`** — complete slide-in:
- Item list with image, name, size, qty controls (+/-), remove button
- Coupon code input with validation API call
- Price breakdown with animated updates
- Free shipping progress bar
- Checkout button

**`NotesGuide.tsx`** — educational section (Top/Heart/Base notes explainer)

**`SocialProof.tsx`** — instagram placeholder grid

**`NewsletterSection.tsx`** — email capture, saves to Supabase

**`WhatsAppButton.tsx`** — floating button, bottom right, links to WhatsApp

### 5.5 — Storefront Pages

**`src/app/(storefront)/layout.tsx`** — includes AnnouncementBar, Header, Footer, CartDrawer, GA4 Script, Meta Pixel Script, Toast provider, QueryClient provider

**`src/app/(storefront)/page.tsx`** — full homepage with all 11 sections (see agent-05 spec)

**`src/app/(storefront)/collections/page.tsx`** — all collections grid

**`src/app/(storefront)/collections/[slug]/page.tsx`** — dynamic collection with filter/sort

**`src/app/(storefront)/product/[slug]/page.tsx`** — full PDP with gallery, notes, variants, add to cart, structured data JSON-LD

**`src/app/(storefront)/checkout/page.tsx`** — 3-step checkout with Razorpay

**`src/app/(storefront)/order-success/page.tsx`** — fires GA4 + Meta purchase events

**`src/app/(storefront)/login/page.tsx`** and **`signup/page.tsx`**

**`src/app/(storefront)/account/page.tsx`**, **`account/orders/page.tsx`**, **`account/profile/page.tsx`**

**`src/app/(storefront)/track-order/page.tsx`**

### 5.6 — Admin Layout & Pages

**`src/app/(admin)/layout.tsx`** — sidebar nav, admin-only, dark theme

**`src/app/(admin)/admin/page.tsx`** — dashboard with stats, charts (Recharts), recent orders, low stock

**`src/app/(admin)/admin/products/page.tsx`** — full product table with search/filter/actions

**`src/app/(admin)/admin/products/new/page.tsx`** — create product with 5 tabs

**`src/app/(admin)/admin/products/[id]/page.tsx`** — edit product

**`src/app/(admin)/admin/categories/page.tsx`** — category CRUD with tree view

**`src/app/(admin)/admin/orders/page.tsx`** — orders with filters, status updates, CSV export

**`src/app/(admin)/admin/orders/[id]/page.tsx`** — full order detail

**`src/app/(admin)/admin/inventory/page.tsx`** — stock table, inline edit, transaction history

**`src/app/(admin)/admin/coupons/page.tsx`** — full coupon CRUD

**`src/app/(admin)/admin/pos/page.tsx`** — POS system with receipt print

**`src/app/(admin)/admin/analytics/page.tsx`** — analytics dashboard

**`src/app/(admin)/admin/customers/page.tsx`** — customer list

**`src/app/(admin)/admin/settings/page.tsx`** — all settings

### 5.7 — API Routes

Write all API routes completely:

- `src/app/api/payment/create-order/route.ts` — validates stock, calculates totals, creates Razorpay order + DB order
- `src/app/api/payment/verify/route.ts` — verifies Razorpay signature, confirms order, triggers Shiprocket + Telegram
- `src/app/api/coupons/validate/route.ts` — full coupon validation
- `src/app/api/upload/route.ts` — image upload with sharp compression
- `src/app/api/telegram/webhook/route.ts` — handles all bot commands
- `src/app/api/cron/daily-report/route.ts` — sends daily Telegram report
- `src/app/api/cron/stock-check/route.ts` — sends low stock alerts
- `src/app/api/auth/callback/route.ts` — Supabase auth callback
- `src/app/api/admin/products/route.ts` — product CRUD for admin
- `src/app/api/admin/orders/route.ts` — order management
- `src/app/api/admin/inventory/route.ts` — inventory adjustments

### 5.8 — Zustand Cart Store

Write `src/stores/cart.ts` — persisted cart with Zustand + localStorage

### 5.9 — Custom Hooks

Write:
- `src/hooks/useAuth.ts` — Supabase user, profile, signout
- `src/hooks/useCart.ts` — cart state from store
- `src/hooks/useProducts.ts` — product fetching with react-query

---

## PHASE 6: BUILD VERIFICATION LOOP

After writing all code files:

```bash
# Attempt build
npm run build 2>&1
```

**IF BUILD FAILS:**
1. Read the EXACT error message
2. Fix the specific file/line causing the error
3. Re-run `npm run build`
4. Repeat up to 10 times

Common fixes to apply automatically:
- Missing imports → add them
- Type errors → fix types or add `as any` as last resort
- Module not found → check package is installed, if not `npm install [package]`
- "use client" missing → add it to components using hooks/browser APIs
- Env var issues → add fallback `|| ''` to optional vars

Only stop if: cannot resolve after 10 attempts, needs user input.

Print after successful build:
```
✅ PHASE 6 COMPLETE — Build successful
   Pages generated: [count]
   Ready to deploy
```

---

## PHASE 7: CLOUDFLARE PAGES DEPLOYMENT (Wrangler)

### 7.1 — Create wrangler.toml
```toml
name = "ursignature"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

[vars]
NEXT_PUBLIC_APP_NAME = "URsignature"

[[cron_triggers]]
cron = "29 18 * * *"

[[cron_triggers]]
cron = "0 */6 * * *"
```

### 7.2 — Build for Cloudflare Pages
```bash
npx @cloudflare/next-on-pages 2>&1
```

If this fails, try:
```bash
# Alternative: use next build first then wrap
npm run build 2>&1
npx @cloudflare/next-on-pages 2>&1
```

### 7.3 — Create Cloudflare Pages project and deploy
```bash
# Create Pages project if it doesn't exist
wrangler pages project create ursignature --production-branch main 2>&1 || echo "Project may already exist, continuing..."

# Deploy
wrangler pages deploy .vercel/output/static --project-name ursignature 2>&1
```

### 7.4 — Set environment variables in Cloudflare
```bash
# Read values from .env.local and set them in CF Pages
# Do this for each variable in .env.local
while IFS='=' read -r key value; do
  [[ "$key" =~ ^#.*$ ]] && continue
  [[ -z "$key" ]] && continue
  [[ -z "$value" ]] && continue
  echo "Setting: $key"
  wrangler pages secret put "$key" --project-name ursignature <<< "$value" 2>&1 || true
done < .env.local
```

### 7.5 — Set up Telegram webhook
```bash
# Register webhook with Telegram (run after deployment)
BOT_TOKEN=$(grep TELEGRAM_BOT_TOKEN .env.local | cut -d= -f2)
APP_URL=$(grep NEXT_PUBLIC_APP_URL .env.local | cut -d= -f2 | tr -d '"')

if [ -n "$BOT_TOKEN" ] && [ -n "$APP_URL" ]; then
  curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"${APP_URL}/api/telegram/webhook\",\"allowed_updates\":[\"message\"]}" 2>&1
  echo "✅ Telegram webhook registered"
else
  echo "⚠️  Telegram bot token or app URL not found in .env.local — set webhook manually"
fi
```

---

## PHASE 8: POST-DEPLOY VERIFICATION

### 8.1 — Health checks
After deployment, verify these URLs return 200:
```bash
DEPLOY_URL=$(wrangler pages project list 2>&1 | grep ursignature | head -1 | awk '{print $NF}')
echo "Deployed at: $DEPLOY_URL"

# Check health
curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL" 2>&1
curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/api/products" 2>&1 || true
```

### 8.2 — Print final summary
```
════════════════════════════════════════════════════════════════
🎉 URsignature is LIVE!

🌐 Store URL: [deployed URL]
🔐 Admin Panel: [deployed URL]/admin
📦 Products: 10 fragrances loaded
🗄️  Database: Supabase (10 products, 8 categories, 3 coupons)
☁️  Images: Cloudflare R2 (ursignature-media bucket)
💳 Payments: Razorpay (set to TEST mode — switch to live when ready)
📦 Shipping: Shiprocket integration ready
🤖 Telegram Bot: Configured (test with /help command)
📊 Analytics: GA4 + Meta Pixel tracking

⚡ NEXT STEPS FOR YOU:
1. Add custom domain in Cloudflare Pages dashboard:
   Pages → ursignature → Custom domains → Add ursignature.com
2. Point your domain's DNS to Cloudflare Pages
3. Switch Razorpay from test → live mode when ready to accept real payments
4. Add your Telegram bot to a group/channel and start receiving order alerts
5. Submit sitemap to Google Search Console:
   https://[your-domain]/sitemap.xml
6. Test a complete order with Razorpay test card:
   Card: 4111 1111 1111 1111 | Expiry: any future | CVV: any 3 digits

🔑 DEFAULT ADMIN ACCESS:
   Create your admin account: go to /signup
   Then run this SQL via Supabase MCP:
   UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
════════════════════════════════════════════════════════════════
```

---

## ERROR RECOVERY PROTOCOL

If at any phase you encounter an error, follow this protocol:

1. **Network error**: Retry up to 3 times with 5s delay
2. **Build error**: Read error, fix code, rebuild — loop up to 10 times
3. **SQL error**: Check for existing tables (use IF NOT EXISTS), fix constraint errors, retry
4. **Wrangler error**: Check `wrangler whoami` still authenticated, retry command
5. **npm error**: Try `--legacy-peer-deps`, then `--force` as last resort
6. **Type error**: Add explicit types or use `as unknown as TargetType` pattern
7. **Import error**: Check path, add missing file, retry build

Never ask the user "should I continue?" unless you have exhausted all automatic fixes.

---

## IMPORTANT NOTES

- All 9 perfume images are in the workspace under "Perfume images" folder with subfolders named exactly as the perfume names
- `logo.png` is also in the workspace — find it and use it
- The Supabase MCP is configured — use it directly for all database operations
- Wrangler is logged in — use it for all Cloudflare operations
- This is a PREPAID-only store (no COD) — ensure checkout reflects this
- Currency is INR (₹) throughout
- Default timezone for reports: Asia/Kolkata (IST)
