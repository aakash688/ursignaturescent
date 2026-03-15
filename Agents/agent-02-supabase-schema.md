# CURSOR AGENT 02 — Supabase Database Schema

## Your Role
You are a PostgreSQL/Supabase database architect. Your job is to create the complete database schema for URsignature, including Row Level Security policies, triggers, and the Supabase client setup.

---

## Task: Create Full Database Schema

### Step 1: Paste this SQL into Supabase SQL Editor (run all at once)

```sql
-- ==========================================
-- URsignature Complete Database Schema
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==========================================
-- USERS / PROFILES
-- ==========================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE addresses (
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

-- ==========================================
-- CATEGORIES
-- ==========================================
CREATE TABLE categories (
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

-- ==========================================
-- PRODUCTS
-- ==========================================
CREATE TABLE products (
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
  images TEXT[] DEFAULT '{}',   -- Array of R2 URLs
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product ↔ Category (many-to-many)
CREATE TABLE product_categories (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- Product variants (sizes/prices)
CREATE TABLE product_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size_ml INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),  -- Original/crossed-out price
  sku TEXT NOT NULL UNIQUE,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- COUPONS
-- ==========================================
CREATE TABLE coupons (
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

CREATE TABLE coupon_usages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id),
  user_id UUID REFERENCES profiles(id),
  order_id UUID,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ORDERS
-- ==========================================
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guest_email TEXT,
  guest_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')
  ),
  payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN ('pending','paid','failed','refunded')
  ),
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
  -- Shipping address stored as JSONB for snapshot
  shipping_address JSONB NOT NULL,
  shiprocket_order_id TEXT,
  shiprocket_shipment_id TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  courier_name TEXT,
  notes TEXT,
  is_pos BOOLEAN DEFAULT false,   -- True for offline/POS orders
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  product_name TEXT NOT NULL,  -- Snapshot
  product_image TEXT,
  size_ml INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL
);

-- Order status history
CREATE TABLE order_status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INVENTORY TRANSACTIONS (audit trail)
-- ==========================================
CREATE TABLE inventory_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  variant_id UUID REFERENCES product_variants(id),
  type TEXT CHECK (type IN ('sale','restock','adjustment','pos_sale','return')),
  quantity_change INTEGER NOT NULL,  -- negative for sales, positive for restocks
  quantity_after INTEGER NOT NULL,
  order_id UUID REFERENCES orders(id),
  note TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- REVIEWS
-- ==========================================
CREATE TABLE reviews (
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

-- ==========================================
-- ANALYTICS EVENTS (server-side)
-- ==========================================
CREATE TABLE analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL,   -- 'page_view','product_view','add_to_cart','purchase'
  session_id TEXT,
  user_id UUID REFERENCES profiles(id),
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES orders(id),
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SITE SETTINGS
-- ==========================================
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO settings (key, value, description) VALUES
  ('free_shipping_threshold', '999', 'Minimum order value for free shipping in INR'),
  ('default_shipping_charge', '99', 'Default shipping charge in INR'),
  ('low_stock_threshold', '10', 'Global low stock alert threshold'),
  ('store_name', 'URsignature', 'Store display name'),
  ('store_email', 'hello@ursignature.com', 'Store contact email'),
  ('instagram_url', 'https://instagram.com/ursignature', 'Instagram link'),
  ('announcement_bar', 'Free shipping on orders above ₹999 | Premium Fragrances at Honest Prices', 'Top announcement bar text'),
  ('meta_title', 'URsignature — Premium Affordable Fragrances', 'Default SEO title'),
  ('meta_description', 'Shop inspired luxury fragrances at affordable prices. Discover our collection of premium perfumes for men, women, and unisex. Long-lasting, high-quality scents.', 'Default SEO description');

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (new.id, new.email, 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Reduce stock when order is placed
CREATE OR REPLACE FUNCTION reduce_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.variant_id;
  
  INSERT INTO inventory_transactions (variant_id, type, quantity_change, quantity_after, order_id)
  SELECT NEW.variant_id, 'sale', -NEW.quantity, stock_quantity, NEW.order_id
  FROM product_variants WHERE id = NEW.variant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_item_created
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION reduce_stock_on_order();

-- Restore stock on order cancellation
CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE product_variants pv
    SET stock_quantity = pv.stock_quantity + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND oi.variant_id = pv.id;
    
    INSERT INTO inventory_transactions (variant_id, type, quantity_change, quantity_after, order_id)
    SELECT oi.variant_id, 'return', oi.quantity, pv.stock_quantity, NEW.id
    FROM order_items oi
    JOIN product_variants pv ON pv.id = oi.variant_id
    WHERE oi.order_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_cancelled
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION restore_stock_on_cancel();

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Addresses
CREATE POLICY "Users manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);

-- Orders: users see their own; guests matched by email
CREATE POLICY "Users see own orders" ON orders FOR SELECT USING (
  auth.uid() = user_id OR auth.role() = 'service_role'
);
CREATE POLICY "Service role manages orders" ON orders FOR ALL USING (auth.role() = 'service_role');

-- Products, categories: public read
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view product variants" ON product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view product categories" ON product_categories FOR SELECT USING (true);

-- Reviews
CREATE POLICY "Users can add reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can view approved reviews" ON reviews FOR SELECT USING (is_approved = true);

-- ==========================================
-- INDEXES (for performance)
-- ==========================================
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_inventory_transactions_variant_id ON inventory_transactions(variant_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
```

---

### Step 2: Create Supabase Client Files

**`src/lib/supabase/client.ts`** (browser-side)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

**`src/lib/supabase/server.ts`** (server-side / API routes)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) }
          catch {}
        },
      },
    }
  )
}

export const createAdminClient = () => {
  const { createClient: createSBClient } = require('@supabase/supabase-js')
  return createSBClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

**`src/middleware.ts`** (session refresh)
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url))
    }
    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect account routes
  if (request.nextUrl.pathname.startsWith('/account')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?redirect=' + request.nextUrl.pathname, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
}
```

---

### Step 3: Seed Initial Data
Create `src/lib/supabase/seed.ts` and write a script that:
1. Imports `PRODUCTS_SEED` from `../seed-data`
2. Creates default categories: Men, Women, Unisex, Featured, New Arrivals, Best Sellers
3. Inserts all 10 products with their default 50ml variants (price: ₹599 each, compare_at_price: ₹1199)
4. Assigns products to categories based on `category_type`
5. Sets King's Creed, Velvet Desire, Midnight Wild, Royal Oud as `is_featured: true`

Run with: `npx tsx src/lib/supabase/seed.ts`

---

### COMPLETION CRITERIA
- [ ] Full SQL schema runs without errors in Supabase
- [ ] All triggers created and tested
- [ ] RLS policies in place
- [ ] Supabase client files created (browser + server + admin)
- [ ] Middleware protecting admin and account routes
- [ ] Seed script populates all 10 products with correct data
- [ ] Verify in Supabase dashboard all 10 products visible in products table
