-- URsignature v3 — Add 16 collections
INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES
('Inspired by Dior', 'inspired-by-dior', 'Fragrances inspired by the world of Christian Dior', 10, true),
('Inspired by Chanel', 'inspired-by-chanel', 'Fragrances inspired by the elegance of Chanel', 11, true),
('Inspired by Creed', 'inspired-by-creed', 'Fragrances inspired by the royal house of Creed', 12, true),
('Inspired by YSL', 'inspired-by-ysl', 'Fragrances inspired by Yves Saint Laurent', 13, true),
('Inspired by Carolina Herrera', 'inspired-by-carolina-herrera', 'Fragrances inspired by Carolina Herrera', 14, true),
('Inspired by Gucci', 'inspired-by-gucci', 'Fragrances inspired by Gucci''s floral world', 15, true),
('Inspired by Victoria''s Secret', 'inspired-by-victorias-secret', 'Fragrances inspired by Victoria''s Secret', 16, true),
('Inspired by CR7', 'inspired-by-cr7', 'Fragrances inspired by Cristiano Ronaldo', 17, true),
('Arabic Oud', 'arabic-oud', 'Oriental and oud-based fragrances', 18, true),
('Gift Sets', 'gifts', 'Perfect gifts for every occasion', 20, true),
('Date Night', 'date-night', 'Seductive scents for special evenings', 23, true),
('Office Wear', 'office-wear', 'Professional, refined fragrances for the workplace', 24, true),
('Weekend Casual', 'weekend-casual', 'Fresh, relaxed fragrances for downtime', 25, true),
('All Day Wear', 'all-day-wear', 'Long-lasting fragrances from morning to night', 26, true)
ON CONFLICT (slug) DO NOTHING;

-- Assign products to inspired-by collections (separate INSERT per category to avoid duplicates)
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE c.slug = 'inspired-by-dior' AND p.slug = 'midnight-wild'
ON CONFLICT (product_id, category_id) DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE c.slug = 'inspired-by-chanel' AND p.slug = 'deep-blue'
ON CONFLICT (product_id, category_id) DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE c.slug = 'inspired-by-creed' AND p.slug = 'kings-creed'
ON CONFLICT (product_id, category_id) DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE c.slug = 'inspired-by-ysl' AND p.slug = 'urban-edge'
ON CONFLICT (product_id, category_id) DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE c.slug = 'inspired-by-cr7' AND p.slug = 'game-on'
ON CONFLICT (product_id, category_id) DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE c.slug = 'inspired-by-carolina-herrera' AND p.slug = 'velvet-desire'
ON CONFLICT (product_id, category_id) DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE c.slug = 'inspired-by-gucci' AND p.slug = 'bloom-kiss'
ON CONFLICT (product_id, category_id) DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE c.slug = 'inspired-by-victorias-secret' AND p.slug = 'flirt-rush'
ON CONFLICT (product_id, category_id) DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE c.slug = 'arabic-oud' AND p.slug = 'royal-oud'
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Lifestyle assignments (separate INSERT per category)
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE c.slug = 'date-night' AND p.slug IN ('velvet-desire','kings-creed','royal-oud')
ON CONFLICT (product_id, category_id) DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE c.slug = 'office-wear' AND p.slug IN ('deep-blue','urban-edge','midnight-wild')
ON CONFLICT (product_id, category_id) DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE c.slug = 'weekend-casual' AND p.slug IN ('game-on','bloom-kiss','flirt-rush','mystic-berry')
ON CONFLICT (product_id, category_id) DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE c.slug = 'all-day-wear' AND p.slug IN ('midnight-wild','kings-creed','royal-oud','deep-blue')
ON CONFLICT (product_id, category_id) DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE c.slug = 'best-sellers' AND p.slug IN ('midnight-wild','kings-creed','velvet-desire','royal-oud')
ON CONFLICT (product_id, category_id) DO NOTHING;
