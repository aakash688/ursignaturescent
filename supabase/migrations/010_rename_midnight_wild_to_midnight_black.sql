-- Rename Midnight Wild → Midnight Black (correct product name)
UPDATE products
SET
  name = 'Midnight Black',
  slug = 'midnight-black',
  tagline = 'Bold masculine freshness for the fearless',
  description = REPLACE(description, 'Midnight Wild', 'Midnight Black'),
  meta_title = 'Midnight Black — Inspired by Dior Sauvage | URsignature',
  meta_description = 'Shop Midnight Black, a bold masculine fragrance inspired by Dior Sauvage.'
WHERE slug = 'midnight-wild';

-- Update product image paths that used the old slug folder
UPDATE product_images
SET url = REPLACE(url, '/products/midnight-wild/', '/products/midnight-black/')
WHERE url LIKE '%midnight-wild%';

UPDATE product_images
SET url = REPLACE(url, 'midnight-wild', 'midnight-black')
WHERE url LIKE '%midnight-wild%';

-- Hero slides JSON may reference old copy
UPDATE settings
SET value = REPLACE(
  REPLACE(value, 'Midnight Wild', 'Midnight Black'),
  'midnight-wild',
  'midnight-black'
)
WHERE key = 'hero_slides'
  AND (value LIKE '%Midnight Wild%' OR value LIKE '%midnight-wild%');
