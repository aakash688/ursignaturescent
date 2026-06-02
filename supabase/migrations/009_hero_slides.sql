-- Hero carousel slides (JSON array in settings.hero_slides)
-- Seeded from existing hero_image_url + hero copy when present.

INSERT INTO settings (key, value, description)
SELECT
  'hero_slides',
  (
    SELECT jsonb_build_array(
      jsonb_build_object(
        'image_url', COALESCE(NULLIF(TRIM(hi.value), ''), '/r2/hero/1780334026237-image--2-.png'),
        'alt', COALESCE(NULLIF(TRIM(ha.value), ''), 'URsignature Fragrance'),
        'eyebrow', COALESCE(NULLIF(TRIM(he.value), ''), 'Premium Inspired Fragrances'),
        'title_line1', COALESCE(NULLIF(TRIM(h1.value), ''), 'Your Scent.'),
        'title_line2', COALESCE(NULLIF(TRIM(h2.value), ''), 'Your Identity.'),
        'subtitle', COALESCE(
          NULLIF(TRIM(hs.value), ''),
          'The world''s finest fragrances, reimagined for you. Inspired by luxury. Priced for real life.'
        )
      )
    )::text
    FROM (SELECT 1) x
    LEFT JOIN settings hi ON hi.key = 'hero_image_url'
    LEFT JOIN settings ha ON ha.key = 'hero_image_alt'
    LEFT JOIN settings he ON he.key = 'hero_eyebrow'
    LEFT JOIN settings h1 ON h1.key = 'hero_title_line1'
    LEFT JOIN settings h2 ON h2.key = 'hero_title_line2'
    LEFT JOIN settings hs ON hs.key = 'hero_subtitle'
  ),
  'Homepage hero carousel slides (JSON array: image_url, eyebrow, title_line1/2, subtitle, cta_label, cta_url)'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'hero_slides');
