-- Homepage hero content (editable in Admin → Settings)
INSERT INTO settings (key, value, description) VALUES
  ('hero_eyebrow', 'Premium Inspired Fragrances', 'Hero: small gold label above headline'),
  ('hero_title_line1', 'Your Scent.', 'Hero: headline line 1 (ivory)'),
  ('hero_title_line2', 'Your Identity.', 'Hero: headline line 2 (gold)'),
  ('hero_subtitle', 'The world''s finest fragrances, reimagined for you. Inspired by luxury. Priced for real life.', 'Hero: paragraph under headline'),
  ('hero_image_url', '', 'Hero: product image URL (upload via Admin or paste R2 URL). Recommended 800×1100px PNG/WebP'),
  ('hero_image_alt', 'URsignature Fragrance', 'Hero: image alt text for accessibility'),
  ('hero_cta_men_label', 'Shop Men', 'Hero: primary button label'),
  ('hero_cta_men_url', '/collections/men', 'Hero: Shop Men link'),
  ('hero_cta_women_label', 'Shop Women', 'Hero: secondary button label'),
  ('hero_cta_women_url', '/collections/women', 'Hero: Shop Women link'),
  ('hero_cta_finder_label', 'Find My Scent', 'Hero: text link label'),
  ('hero_cta_finder_url', '/fragrance-finder', 'Hero: Find My Scent link')
ON CONFLICT (key) DO NOTHING;
