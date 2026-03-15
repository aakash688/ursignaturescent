-- Run this in Supabase SQL Editor if triggers/RLS weren't applied
-- TRIGGERS: auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_variants_updated_at ON product_variants;
CREATE TRIGGER trg_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (new.id, new.email, 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_profile_select" ON profiles;
CREATE POLICY "own_profile_select" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "own_profile_update" ON profiles;
CREATE POLICY "own_profile_update" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "own_addresses" ON addresses;
CREATE POLICY "own_addresses" ON addresses FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "own_orders" ON orders;
CREATE POLICY "own_orders" ON orders FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "service_manages_orders" ON orders;
CREATE POLICY "service_manages_orders" ON orders FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "service_manages_items" ON order_items;
CREATE POLICY "service_manages_items" ON order_items FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "public_products" ON products;
CREATE POLICY "public_products" ON products FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "public_categories" ON categories;
CREATE POLICY "public_categories" ON categories FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "public_variants" ON product_variants;
CREATE POLICY "public_variants" ON product_variants FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "public_product_categories" ON product_categories;
CREATE POLICY "public_product_categories" ON product_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "own_reviews" ON reviews;
CREATE POLICY "own_reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "approved_reviews" ON reviews;
CREATE POLICY "approved_reviews" ON reviews FOR SELECT USING (is_approved = true);
