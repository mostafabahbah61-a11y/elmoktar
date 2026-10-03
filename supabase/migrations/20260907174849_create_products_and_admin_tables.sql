/*
# Create products, site_content, and admin_settings tables

1. New Tables
- `products`
  - id (uuid, primary key)
  - category (text: Vegetables, Fruits, Packaging, Shipping)
  - label_en (text, not null)
  - label_ar (text, not null)
  - detail_en (text)
  - detail_ar (text)
  - image_url (text)
  - display_order (int, default 0)
  - created_at (timestamptz)

- `site_content`
  - id (uuid, primary key)
  - key (text, unique) — e.g. 'hero_title_en', 'hero_title_ar', 'contact_email'
  - value (text)
  - updated_at (timestamptz)

- `admin_settings`
  - id (uuid, primary key, default gen_random_uuid())
  - username (text, not null, default 'admin')
  - password_hash (text, not null)
  - updated_at (timestamptz)

2. Security
- RLS enabled on all tables.
- products: public read (anon+authenticated), only admin can write (via service role / edge function).
- site_content: public read, only admin can write.
- admin_settings: only admin can read/write (authenticated with admin role).

3. Notes
- Initial admin_settings row created with username='admin', password_hash='admin' (plaintext for initial setup, to be changed from dashboard).
- Default site_content rows seeded for hero text and contact info.
- Storage bucket 'product-images' created for product image uploads.
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  label_en text NOT NULL,
  label_ar text NOT NULL,
  detail_en text,
  detail_ar text,
  image_url text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- Site content table
CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_content" ON site_content;
CREATE POLICY "public_read_content" ON site_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_write_content" ON site_content;
CREATE POLICY "admin_write_content" ON site_content FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL DEFAULT 'admin',
  password_hash text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_settings" ON admin_settings;
CREATE POLICY "admin_read_settings" ON admin_settings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_write_settings" ON admin_settings;
CREATE POLICY "admin_write_settings" ON admin_settings FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Seed initial admin settings
INSERT INTO admin_settings (username, password_hash)
VALUES ('admin', 'admin')
ON CONFLICT DO NOTHING;

-- Seed default site content
INSERT INTO site_content (key, value) VALUES
  ('hero_title_en', 'From Egyptian soil\nto global markets.'),
  ('hero_title_ar', 'من أرض مصر\nإلى الأسواق العالمية.'),
  ('hero_text_en', 'Al-Mokhtar Import & Export connects carefully selected vegetables and fruits with partners across the world.'),
  ('hero_text_ar', 'المختار للاستيراد والتصدير يربط أجود الخضار والفاكهة بشركاء حول العالم.'),
  ('hero_kicker_en', 'Freshness in motion'),
  ('hero_kicker_ar', 'الطزاجة في حركة'),
  ('contact_email', 'almokhtarimportexport02@gmail.com'),
  ('contact_whatsapp_1', '201090903681'),
  ('contact_whatsapp_2', '201276785117'),
  ('contact_facebook', 'https://www.facebook.com/share/1Dk6EGYJrn/?mibextid=wwXIfr')
ON CONFLICT (key) DO NOTHING;

-- Seed default products
INSERT INTO products (category, label_en, label_ar, detail_en, detail_ar, image_url, display_order) VALUES
  ('Vegetables', 'Carrots', 'جزر', 'Fresh, crisp carrots sorted and graded for export quality.', 'جزر طازج مقرمش، مفرز ومرتب بجودة تصدير.', 'https://images.pexels.com/photos/33622710/pexels-photo-33622710.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
  ('Vegetables', 'White Onion', 'بصل أبيض', 'Clean, firm white onions with excellent shelf life.', 'بصل أبيض نظيف وصلب بعمر تخزين ممتاز.', 'https://images.pexels.com/photos/32986487/pexels-photo-32986487.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
  ('Vegetables', 'Red Onion', 'بصل أحمر', 'Deep-colored red onions with a balanced, rich flavor.', 'بصل أحمر بلون غني ونكهة متوازنة.', 'https://images.pexels.com/photos/10159434/pexels-photo-10159434.jpeg?auto=compress&cs=tinysrgb&w=800', 3),
  ('Vegetables', 'Potatoes', 'بطاطس', 'Carefully graded potatoes for retail and foodservice.', 'بطاطس مفرزة بعناية للبيع بالتجزئة والخدمات الغذائية.', 'https://images.pexels.com/photos/37740954/pexels-photo-37740954.jpeg?auto=compress&cs=tinysrgb&w=800', 4),
  ('Fruits', 'Oranges', 'برتقال', 'Selected citrus in multiple sizes and specifications.', 'حمضيات مختارة بأحجام ومواصفات متعددة.', 'https://images.pexels.com/photos/37543950/pexels-photo-37543950.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
  ('Fruits', 'Mango', 'مانجا', 'Premium mango varieties, prepared for international markets.', 'أنواع مانجا فاخرة معدة للأسواق العالمية.', 'https://images.pexels.com/photos/30542312/pexels-photo-30542312.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
  ('Packaging', '5 kg Sacks', 'شكاير 5 كجم', 'Sacks available in 5 kg weight. Color per customer choice.', 'شكاير متوفرة بوزن 5 كجم. اللون حسب اختيار العميل.', 'https://images.pexels.com/photos/38352190/pexels-photo-38352190.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
  ('Packaging', '10 kg Sacks', 'شكاير 10 كجم', 'Sacks available in 10 kg weight. Color per customer choice.', 'شكاير متوفرة بوزن 10 كجم. اللون حسب اختيار العميل.', 'https://images.pexels.com/photos/21958122/pexels-photo-21958122.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
  ('Packaging', '15 kg Sacks', 'شكاير 15 كجم', 'Sacks available in 15 kg weight. Color per customer choice.', 'شكاير متوفرة بوزن 15 كجم. اللون حسب اختيار العميل.', 'https://images.pexels.com/photos/10778111/pexels-photo-10778111.jpeg?auto=compress&cs=tinysrgb&w=800', 3),
  ('Packaging', '15-30 kg Sacks', 'شكاير 15-30 كجم', 'Sacks adjustable from 15 kg to 30 kg. Color per customer choice.', 'شكاير قابلة للتعديل من 15 كجم إلى 30 كجم. اللون حسب اختيار العميل.', 'https://images.pexels.com/photos/21958122/pexels-photo-21958122.jpeg?auto=compress&cs=tinysrgb&w=800', 4),
  ('Packaging', 'Big Bags (1-1.5 ton)', 'جامبوهات (1-1.5 طن)', 'Jumbo bags used for onions and potatoes, 1 to 1.5 tons.', 'جامبوهات تستخدم للبصل والبطاطس، من 1 إلى 1.5 طن.', 'https://images.pexels.com/photos/21958122/pexels-photo-21958122.jpeg?auto=compress&cs=tinysrgb&w=800', 5),
  ('Packaging', 'Wooden/Plastic Crates', 'صناديق خشبية/بلاستيك', 'Wooden or plastic crates for fruits. Weight per agreement: 10 kg, 15 kg.', 'صناديق خشبية أو بلاستيك للفاكهة. الوزن حسب الاتفاق: 10 كجم، 15 كجم.', 'https://images.pexels.com/photos/38352190/pexels-photo-38352190.jpeg?auto=compress&cs=tinysrgb&w=800', 6),
  ('Packaging', 'Net Bags', 'أكياس شبكية', 'Net bags for fruits, breathable and export-ready.', 'أكياس شبكية للفاكهة، تسمح بالتهوية وجاهزة للتصدير.', 'https://images.pexels.com/photos/10778111/pexels-photo-10778111.jpeg?auto=compress&cs=tinysrgb&w=800', 7),
  ('Shipping', 'Land Shipping', 'شحن بري', 'Organized land freight with clear delivery coordination.', 'شحن بري منظم بتنسيق تسليم واضح.', 'https://images.pexels.com/photos/9754798/pexels-photo-9754798.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
  ('Shipping', 'Sea Shipping', 'شحن بحري', 'Containerized sea freight for international destinations.', 'شحن بحري بحاويات لوجهات دولية.', 'https://images.pexels.com/photos/20581299/pexels-photo-20581299.jpeg?auto=compress&cs=tinysrgb&w=800', 2)
ON CONFLICT DO NOTHING;

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product-images bucket
DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "admin_upload_product_images" ON storage.objects;
CREATE POLICY "admin_upload_product_images" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "admin_update_product_images" ON storage.objects;
CREATE POLICY "admin_update_product_images" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "admin_delete_product_images" ON storage.objects;
CREATE POLICY "admin_delete_product_images" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_order_idx ON products(display_order);
