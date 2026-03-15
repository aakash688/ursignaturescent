-- 005_master_schema_additions.sql
-- Adds Phase 3 tables from MASTER-AGENT: coupon_usages, order_status_history,
-- analytics_events, newsletter_subscribers, settings (+ default settings seed).
-- Safe to run multiple times: CREATE TABLE IF NOT EXISTS, ON CONFLICT for inserts.

-- COUPON USAGES (tracks which user/order used which coupon)
CREATE TABLE IF NOT EXISTS coupon_usages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id),
  user_id UUID REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER STATUS HISTORY (audit trail for order status changes)
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANALYTICS EVENTS (product views, add-to-cart, purchases, etc.)
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

-- NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- SETTINGS (key-value store for store config)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default settings seed (idempotent)
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

-- Index for analytics querying by time
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC);
