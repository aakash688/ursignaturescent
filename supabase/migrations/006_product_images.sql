-- 006_product_images.sql
-- Product images in R2: multiple images per product, one marked primary.
-- Run after 005. Safe to run multiple times.

-- Product images table (R2 URLs; one primary per product)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, sort_order)
);

-- Only one primary per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_single_primary
  ON product_images (product_id) WHERE is_primary = true;

-- Backfill from existing products.images (text array)
-- Inserts one row per URL; first image = primary. Run once.
DO $$
DECLARE
  r RECORD;
  i INT;
  url_val TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_images' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM product_images LIMIT 1) THEN
      FOR r IN SELECT id, images FROM products WHERE images IS NOT NULL AND array_length(images, 1) > 0
      LOOP
        FOR i IN 1..array_length(r.images, 1) LOOP
          url_val := r.images[i];
          IF url_val IS NOT NULL AND url_val != '' THEN
            INSERT INTO product_images (product_id, url, sort_order, is_primary)
            VALUES (r.id, url_val, i - 1, i = 1)
            ON CONFLICT (product_id, sort_order) DO NOTHING;
          END IF;
        END LOOP;
      END LOOP;
    END IF;
  END IF;
END $$;

-- RLS: public read for product_images (same as products)
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_product_images" ON product_images;
CREATE POLICY "public_product_images" ON product_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM products p WHERE p.id = product_images.product_id AND p.is_active = true)
);
-- Service role can manage (admin)
DROP POLICY IF EXISTS "service_manages_product_images" ON product_images;
CREATE POLICY "service_manages_product_images" ON product_images FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE product_images IS 'Multiple images per product; is_primary marks the main image. URLs point to R2.';

-- Optional: site logo URL (set by upload script)
INSERT INTO settings (key, value, description) VALUES
  ('site_logo_url', '', 'Site logo URL (R2); set by scripts/upload-images-to-r2.mjs')
ON CONFLICT (key) DO NOTHING;
