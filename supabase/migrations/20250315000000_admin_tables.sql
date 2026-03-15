-- Admin panel: contact_messages, reviews, order_status_history, inventory_transactions,
-- settings (if missing), and optional columns on orders/coupons.

-- Settings key-value store (if not exists)
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT ''
);

-- Contact form submissions (storefront contact page)
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Product reviews (for moderation)
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text,
  author_email text,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);

-- Order status history (for admin status changes)
CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);

-- Inventory adjustments (restock, adjustment, sale, etc.)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('sale', 'restock', 'adjustment', 'pos_sale', 'return')),
  quantity_change int NOT NULL,
  quantity_after int NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  note text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_variant ON inventory_transactions(variant_id);

-- Ensure orders has payment_method, is_pos, admin_notes (add if missing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
    ALTER TABLE orders ADD COLUMN payment_method text DEFAULT 'razorpay';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'is_pos') THEN
    ALTER TABLE orders ADD COLUMN is_pos boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'admin_notes') THEN
    ALTER TABLE orders ADD COLUMN admin_notes text;
  END IF;
END $$;

-- Ensure coupons has per_user_limit and expires_at if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'per_user_limit') THEN
    ALTER TABLE coupons ADD COLUMN per_user_limit int;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'expires_at') THEN
    ALTER TABLE coupons ADD COLUMN expires_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'created_at') THEN
    ALTER TABLE coupons ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

-- RLS: enabled so anon/authenticated have no access; admin APIs use service role which bypasses RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
