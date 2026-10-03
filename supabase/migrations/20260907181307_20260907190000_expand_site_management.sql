/*
# Expand site management controls

1. New tables
- `site_media`: editable image URLs and alt text for every named image on the public website.
- `bot_settings`: the active assistant instructions and enabled state.

2. Modified content
- Adds bilingual text, contact, social, and visual setting keys to `site_content` without removing existing keys.
- Adds packaging and shipping management through the existing `products` table categories.

3. Security
- Public website rows are readable by anon and authenticated users.
- This single-business website uses its existing custom dashboard login, so dashboard data mutations remain available to anon through the existing policies.
- Storage policies allow public display and dashboard uploads to the public site-images bucket.

4. Important notes
- Existing rows and user orders are preserved.
- All inserts are idempotent and safe to run again.
*/

CREATE TABLE IF NOT EXISTS site_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_key text UNIQUE NOT NULL,
  url text NOT NULL,
  alt_en text NOT NULL DEFAULT '',
  alt_ar text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_site_media" ON site_media;
CREATE POLICY "public_read_site_media" ON site_media FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_site_media" ON site_media;
CREATE POLICY "public_insert_site_media" ON site_media FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_site_media" ON site_media;
CREATE POLICY "public_update_site_media" ON site_media FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_site_media" ON site_media;
CREATE POLICY "public_delete_site_media" ON site_media FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS bot_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean UNIQUE NOT NULL DEFAULT true,
  enabled boolean NOT NULL DEFAULT true,
  system_prompt_ar text NOT NULL DEFAULT '',
  system_prompt_en text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bot_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_bot_settings" ON bot_settings;
CREATE POLICY "public_read_bot_settings" ON bot_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_bot_settings" ON bot_settings;
CREATE POLICY "public_insert_bot_settings" ON bot_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_bot_settings" ON bot_settings;
CREATE POLICY "public_update_bot_settings" ON bot_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_bot_settings" ON bot_settings;
CREATE POLICY "public_delete_bot_settings" ON bot_settings FOR DELETE TO anon, authenticated USING (true);

INSERT INTO bot_settings (singleton, enabled, system_prompt_ar, system_prompt_en)
VALUES (
  true,
  true,
  'أنت مساعد ودود لموقع المختار للاستيراد والتصدير. أجب على أي رسالة بالعربية إذا كتب العميل بالعربية وبالإنجليزية إذا كتب بالإنجليزية. كن مفيدًا ومحترمًا، واستخدم بيانات الموقع عند السؤال عن المنتجات أو التغليف أو الشحن أو التواصل. إذا كان السؤال خارج الموقع فأجب عنه بشكل عام وباختصار، وإذا لم تعرف معلومة فقل ذلك بوضوح.',
  'You are a friendly assistant for Al-Mokhtar Import & Export. Reply in Arabic when the customer writes Arabic and in English when they write English. Be helpful and respectful, use the website data for products, packaging, shipping, and contact questions. For unrelated questions, answer generally and briefly. If you do not know something, say so clearly.'
)
ON CONFLICT (singleton) DO NOTHING;

INSERT INTO site_content (key, value) VALUES
  ('hero_explore_en', 'Explore products'), ('hero_explore_ar', 'اكتشف المنتجات'),
  ('hero_order_en', 'Request an order'), ('hero_order_ar', 'اطلب الآن'),
  ('hero_trusted_en', 'Built for dependable trade'), ('hero_trusted_ar', 'تجارة موثوقة من المصدر'),
  ('categories_title_en', 'Everything you need for global trade.'), ('categories_title_ar', 'كل ما تحتاجه للتجارة العالمية.'),
  ('categories_text_en', 'The products, packaging and logistics your business needs — handled with precision.'), ('categories_text_ar', 'المنتجات والتغليف والخدمات اللوجستية التي يحتاجها عملك — بدقة واحتراف.'),
  ('products_title_en', 'Selected with purpose.'), ('products_title_ar', 'اختيارات منتقاة، جاهزة للعالم.'),
  ('promise_title_en', 'Coordination that protects quality.'), ('promise_title_ar', 'التنسيق الذي يحافظ على الجودة.'),
  ('promise_text_en', 'From first selection to final arrival, we coordinate packaging and land or sea shipping with care.'), ('promise_text_ar', 'من أول اختيار المنتج وحتى وصوله، ننسق التغليف والشحن البري والبحري بعناية.'),
  ('contact_title_en', 'Let''s start a partnership.'), ('contact_title_ar', 'خلّينا نبدأ شراكة.'),
  ('contact_text_en', 'Tell us what you need and our team will respond with the right export solution.'), ('contact_text_ar', 'أخبرنا بما تحتاجه وسيقدم لك فريقنا الحل التصديري المناسب.'),
  ('contact_instagram', ''), ('contact_tiktok', ''), ('contact_linkedin', ''), ('contact_address_en', 'Cairo · Egypt'), ('contact_address_ar', 'القاهرة · مصر'),
  ('shipping_land_detail_en', 'Organized land freight with clear delivery coordination.'), ('shipping_land_detail_ar', 'شحن بري منظم بتنسيق تسليم واضح.'),
  ('shipping_sea_detail_en', 'Containerized sea freight for international destinations.'), ('shipping_sea_detail_ar', 'شحن بحري بحاويات لوجهات دولية.'),
  ('footer_note_en', 'CAIRO · EGYPT'), ('footer_note_ar', 'القاهرة · مصر')
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_media (media_key, url, alt_en, alt_ar) VALUES
  ('hero_background', '/large_background_.png', 'Fresh produce export', 'تصدير المنتجات الطازجة'),
  ('brand_logo', '/logo.jpeg', 'Al-Mokhtar logo', 'شعار المختار'),
  ('promise_image', '/large_background_.png', 'From field to container', 'من الحقل إلى الحاوية')
ON CONFLICT (media_key) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_site_images" ON storage.objects;
CREATE POLICY "public_read_site_images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'site-images');
DROP POLICY IF EXISTS "public_insert_site_images" ON storage.objects;
CREATE POLICY "public_insert_site_images" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'site-images');
DROP POLICY IF EXISTS "public_update_site_images" ON storage.objects;
CREATE POLICY "public_update_site_images" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'site-images') WITH CHECK (bucket_id = 'site-images');
DROP POLICY IF EXISTS "public_delete_site_images" ON storage.objects;
CREATE POLICY "public_delete_site_images" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'site-images');

CREATE OR REPLACE FUNCTION list_registered_users(p_username text, p_password text)
RETURNS TABLE (id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_settings WHERE username = p_username AND password_hash = p_password) THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT u.id, u.email::text, u.created_at, u.last_sign_in_at FROM auth.users u ORDER BY u.created_at DESC;
END;
$$;
REVOKE EXECUTE ON FUNCTION list_registered_users(text, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION list_registered_users(text, text) TO anon, authenticated;
