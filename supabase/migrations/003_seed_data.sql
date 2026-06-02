-- Run in Supabase SQL Editor after 002_triggers_rls.sql
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

INSERT INTO products (name, slug, tagline, description, short_description, inspired_by, category_type, fragrance_profile, top_notes, heart_notes, base_notes, rating, is_featured, is_active, meta_title, meta_description) VALUES
('Midnight Black', 'midnight-black', 'Bold masculine freshness for the fearless', 'Midnight Black opens with a burst of electric bergamot and sharp pepper — raw, wild, unapologetic. At its heart, lavender and geranium soften the intensity into something magnetic. The dry-down settles into warm ambroxan and cedarwood that lingers on skin for hours. This is the scent of confidence.', 'Fresh spicy citrus fragrance with ambroxan and cedarwood base. Bold, masculine, all-day wear.', 'Dior Sauvage', 'men', 'Fresh spicy, citrus, woody, amber', ARRAY['Bergamot', 'Pepper'], ARRAY['Lavender', 'Geranium'], ARRAY['Ambroxan', 'Cedarwood'], 5.0, true, true, 'Midnight Black — Inspired by Dior Sauvage | URsignature', 'Shop Midnight Black, a bold masculine fragrance inspired by Dior Sauvage.'),
('Deep Blue', 'deep-blue', 'Elegant versatility — from boardroom to bar', 'Deep Blue captures the duality of the modern man — crisp, composed, yet layered with depth. Grapefruit and mint create an immediate freshness; jasmine and ginger add intrigue; incense and sandalwood ground it in quiet authority.', 'Citrus aromatic woody fragrance. Versatile, elegant, perfect for all occasions.', 'Bleu de Chanel', 'men', 'Citrus, aromatic, woody, smoky', ARRAY['Grapefruit', 'Mint'], ARRAY['Jasmine', 'Ginger'], ARRAY['Incense', 'Sandalwood'], 5.0, true, true, 'Deep Blue — Inspired by Bleu de Chanel | URsignature', 'Shop Deep Blue, inspired by Bleu de Chanel.'),
('King''s Creed', 'kings-creed', 'The signature of power', 'King''s Creed is a declaration. Pineapple and apple open with tropical regality before birch smoke and jasmine create a complex, charismatic heart. The oakmoss and musk base is primal, powerful, and unmistakably premium.', 'Fruity smoky masculine fragrance. The scent of ambition and success.', 'Creed Aventus', 'men', 'Fruity, smoky, masculine, premium', ARRAY['Pineapple', 'Apple'], ARRAY['Birch', 'Jasmine'], ARRAY['Oakmoss', 'Musk'], 5.0, true, true, 'King''s Creed — Inspired by Creed Aventus | URsignature', 'Shop King''s Creed, inspired by Creed Aventus.'),
('Urban Edge', 'urban-edge', 'The modern professional''s signature', 'Urban Edge is precision in a bottle. The crisp bite of apple and ginger opens fresh and focused. Sage and geranium bring intellectual depth. Tonka bean and amberwood close with warmth.', 'Fresh modern slightly sweet fragrance for the driven professional.', 'YSL Y EDP', 'men', 'Fresh, modern, slightly sweet', ARRAY['Apple', 'Ginger'], ARRAY['Sage', 'Geranium'], ARRAY['Tonka Bean', 'Amberwood'], 4.0, false, true, 'Urban Edge — Inspired by YSL Y EDP | URsignature', 'Shop Urban Edge, inspired by YSL Y EDP.'),
('Game On', 'game-on', 'Energy that never quits', 'Game On is the scent of momentum. Bergamot and lavender launch it with athletic freshness, while cardamom and cinnamon ignite the heart with heat and spice. Vanilla and musk finish with crowd-pleasing warmth.', 'Aromatic sporty youthful fragrance. For those who live at full speed.', 'CR7 by Cristiano Ronaldo', 'men', 'Aromatic, sporty, youthful', ARRAY['Bergamot', 'Lavender'], ARRAY['Cardamom', 'Cinnamon'], ARRAY['Vanilla', 'Musk'], 4.0, false, true, 'Game On — Sporty Aromatic Fragrance | URsignature', 'Shop Game On, an energetic sporty fragrance.'),
('Mystic Berry', 'mystic-berry', 'Exclusively yours — a scent like no other', 'Mystic Berry is URsignature''s original creation — built from imagination, not imitation. The lush burst of blackberry fades into a violet and soft musk heart. White musk and powder finish with a trail so delicate it becomes part of you.', 'Unique fruity musky fragrance. URsignature original creation.', 'URsignature Original', 'women', 'Fruity, soft musky, delicate', ARRAY['Blackberry'], ARRAY['Violet', 'Soft Musk'], ARRAY['White Musk', 'Powdery Notes'], 4.0, false, true, 'Mystic Berry — Original URsignature Creation', 'Shop Mystic Berry, an exclusive URsignature original fragrance.'),
('Velvet Desire', 'velvet-desire', 'For nights that linger in memory', 'Velvet Desire opens like a temptation — almond and coffee, sweet and roasted. Jasmine and tuberose bloom in the heart with opulent femininity. Tonka bean and cocoa close it in a rich, almost edible embrace.', 'Sweet sexy floral gourmand fragrance for the woman who owns every room.', 'Good Girl by Carolina Herrera', 'women', 'Sweet, sexy, floral, gourmand', ARRAY['Almond', 'Coffee'], ARRAY['Jasmine', 'Tuberose'], ARRAY['Tonka Bean', 'Cocoa'], 5.0, true, true, 'Velvet Desire — Inspired by Good Girl | URsignature', 'Shop Velvet Desire, inspired by Good Girl.'),
('Bloom Kiss', 'bloom-kiss', 'Romance, bottled', 'Bloom Kiss is first-light freshness — a garden at dawn. Citrus and peony open with airy luminous energy. Rose and osmanthus bloom with graceful elegance. Patchouli and sandalwood ground it with earthy warmth.', 'Light floral fruity fragrance. Romantic and elegant for daily wear.', 'Gucci Flora', 'women', 'Light floral, fruity, citrusy', ARRAY['Citrus', 'Peony'], ARRAY['Rose', 'Osmanthus'], ARRAY['Patchouli', 'Sandalwood'], 4.0, false, true, 'Bloom Kiss — Inspired by Gucci Flora | URsignature', 'Shop Bloom Kiss, inspired by Gucci Flora.'),
('Flirt Rush', 'flirt-rush', 'Young, free, and intoxicatingly fun', 'Flirt Rush is pure joy in a bottle. Passionfruit and grapefruit explode with playful vibrant freshness. Peony and vanilla orchid soften into something irresistibly flirty. Musk and wood carry it forward with warmth.', 'Fruity floral fresh fragrance. The scent for sunshine and spontaneous adventures.', 'Bombshell by Victoria''s Secret', 'women', 'Fruity, floral, fresh, flirty', ARRAY['Passionfruit', 'Grapefruit'], ARRAY['Peony', 'Vanilla Orchid'], ARRAY['Musk', 'Woody Notes'], 4.0, false, true, 'Flirt Rush — Inspired by Bombshell | URsignature', 'Shop Flirt Rush, inspired by Bombshell.'),
('Royal Oud', 'royal-oud', 'Royalty distilled — for those who demand the extraordinary', 'Royal Oud is not a fragrance — it is a ceremony. Saffron and rose announce it like a royal procession. The heart is pure oud and patchouli — dark, complex, uncompromising. Amber, musk and sandalwood close in a warm smoky embrace that lasts all day.', 'Oriental oud fragrance. Strong projection, long-lasting, luxurious.', 'Amir Al Oudh', 'unisex', 'Sweet oud, smoky, oriental, luxurious', ARRAY['Rose', 'Saffron'], ARRAY['Oud', 'Patchouli'], ARRAY['Amber', 'Musk', 'Sandalwood'], 5.0, true, true, 'Royal Oud — Premium Oud Fragrance | URsignature', 'Shop Royal Oud, an Arabian-inspired oud fragrance.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, size_ml, price, compare_at_price, sku, stock_quantity, low_stock_threshold)
SELECT p.id, 50, 599.00, 1199.00, 'URS-' || UPPER(LEFT(REPLACE(p.slug, '-', ''), 8)) || '-50', 100, 10
FROM products p
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE (c.slug = 'men' AND p.category_type = 'men')
   OR (c.slug = 'women' AND p.category_type = 'women')
   OR (c.slug = 'unisex' AND p.category_type = 'unisex')
   OR (c.slug = 'featured' AND p.is_featured = true)
   OR (c.slug = 'premium' AND p.rating = 5.0)
ON CONFLICT (product_id, category_id) DO NOTHING;

INSERT INTO coupons (code, type, value, min_order_value, max_discount, usage_limit, per_user_limit, is_active) VALUES
  ('WELCOME10', 'percentage', 10, 599, 100, 1000, 1, true),
  ('FIRSTORDER', 'fixed', 100, 599, NULL, 500, 1, true),
  ('ROYAL20', 'percentage', 20, 999, 200, 100, 1, true)
ON CONFLICT (code) DO NOTHING;

UPDATE products SET images = ARRAY['/images/products/' || slug || '-1.png'] WHERE slug IN ('bloom-kiss','deep-blue','flirt-rush','game-on','kings-creed','midnight-black','mystic-berry','royal-oud','urban-edge','velvet-desire');
