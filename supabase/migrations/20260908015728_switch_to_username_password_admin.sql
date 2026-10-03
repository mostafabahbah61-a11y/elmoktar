/*
# Switch admin auth to username/password with server-enforced writes

1. Purpose
- The dashboard login returns to a simple username + password form (no Supabase Auth email/password).
- All admin write operations (products, content, media, bot, varieties, settings) go through SECURITY DEFINER functions that verify the admin credentials server-side.
- Anonymous visitors can only read public data and create orders. They cannot modify any admin-managed table or upload images.

2. New functions
- `admin_save_product(p_username, p_password, p_product jsonb)` — insert or update a product.
- `admin_delete_product(p_username, p_password, p_product_id uuid)` — delete a product.
- `admin_save_content(p_username, p_password, p_key text, p_value text)` — upsert a site_content row.
- `admin_save_media(p_username, p_password, p_media jsonb)` — upsert a site_media row.
- `admin_save_bot(p_username, p_password, p_enabled boolean, p_prompt_ar text, p_prompt_en text)` — upsert bot_settings.
- `admin_save_variety(p_username, p_password, p_variety jsonb)` — insert or update a product_variety.
- `admin_delete_variety(p_username, p_password, p_variety_id uuid)` — delete a product_variety.
- `admin_change_credentials(p_username, p_password, p_new_username, p_new_password)` — change admin credentials.

3. Security
- Every function checks `admin_settings` for matching username + password before performing any write.
- All write policies on admin-managed tables are removed; only the functions can write.
- `admin_settings` has no SELECT grant for any API role.
- Storage write policies for site-images and product-images are removed; uploads go through the edge function.
- `check_admin_credentials` is re-enabled for anon so the login form can verify credentials without exposing the table.
*/

CREATE OR REPLACE FUNCTION public.check_admin_credentials(p_username text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_settings
    WHERE username = p_username AND password_hash = p_password
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_admin_credentials(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_admin_credentials(text, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_admin_credentials(text, text) TO anon, authenticated;

-- Remove old claim/is_admin functions and their grants
REVOKE ALL ON FUNCTION public.claim_admin_access(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_admin_credentials(text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.list_registered_users(text, text) FROM PUBLIC, anon, authenticated;

-- admin_save_product
CREATE OR REPLACE FUNCTION public.admin_save_product(p_username text, p_password text, p_product jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public.check_admin_credentials(p_username, p_password) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  v_id := (p_product->>'id')::uuid;

  IF v_id IS NOT NULL THEN
    UPDATE products SET
      category = p_product->>'category',
      label_en = p_product->>'label_en',
      label_ar = p_product->>'label_ar',
      detail_en = p_product->>'detail_en',
      detail_ar = p_product->>'detail_ar',
      image_url = p_product->>'image_url',
      display_order = (p_product->>'display_order')::int
    WHERE id = v_id;
  ELSE
    INSERT INTO products (category, label_en, label_ar, detail_en, detail_ar, image_url, display_order)
    VALUES (
      p_product->>'category',
      p_product->>'label_en',
      p_product->>'label_ar',
      p_product->>'detail_en',
      p_product->>'detail_ar',
      p_product->>'image_url',
      (p_product->>'display_order')::int
    );
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_save_product(text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_save_product(text, text, jsonb) TO anon, authenticated;

-- admin_delete_product
CREATE OR REPLACE FUNCTION public.admin_delete_product(p_username text, p_password text, p_product_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.check_admin_credentials(p_username, p_password) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  DELETE FROM products WHERE id = p_product_id;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_product(text, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_product(text, text, uuid) TO anon, authenticated;

-- admin_save_content
CREATE OR REPLACE FUNCTION public.admin_save_content(p_username text, p_password text, p_key text, p_value text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.check_admin_credentials(p_username, p_password) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  INSERT INTO site_content (key, value, updated_at)
  VALUES (p_key, p_value, now())
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_save_content(text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_save_content(text, text, text, text) TO anon, authenticated;

-- admin_save_media
CREATE OR REPLACE FUNCTION public.admin_save_media(p_username text, p_password text, p_media jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.check_admin_credentials(p_username, p_password) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  INSERT INTO site_media (media_key, url, alt_en, alt_ar, updated_at)
  VALUES (
    p_media->>'media_key',
    p_media->>'url',
    p_media->>'alt_en',
    p_media->>'alt_ar',
    now()
  )
  ON CONFLICT (media_key) DO UPDATE SET
    url = EXCLUDED.url,
    alt_en = EXCLUDED.alt_en,
    alt_ar = EXCLUDED.alt_ar,
    updated_at = now();
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_save_media(text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_save_media(text, text, jsonb) TO anon, authenticated;

-- admin_save_bot
CREATE OR REPLACE FUNCTION public.admin_save_bot(p_username text, p_password text, p_enabled boolean, p_prompt_ar text, p_prompt_en text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.check_admin_credentials(p_username, p_password) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  INSERT INTO bot_settings (singleton, enabled, system_prompt_ar, system_prompt_en, updated_at)
  VALUES (true, p_enabled, p_prompt_ar, p_prompt_en, now())
  ON CONFLICT (singleton) DO UPDATE SET
    enabled = EXCLUDED.enabled,
    system_prompt_ar = EXCLUDED.system_prompt_ar,
    system_prompt_en = EXCLUDED.system_prompt_en,
    updated_at = now();
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_save_bot(text, text, boolean, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_save_bot(text, text, boolean, text, text) TO anon, authenticated;

-- admin_save_variety
CREATE OR REPLACE FUNCTION public.admin_save_variety(p_username text, p_password text, p_variety jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public.check_admin_credentials(p_username, p_password) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  v_id := (p_variety->>'id')::uuid;

  IF v_id IS NOT NULL THEN
    UPDATE product_varieties SET
      product_id = (p_variety->>'product_id')::uuid,
      category = p_variety->>'category',
      label_en = p_variety->>'label_en',
      label_ar = p_variety->>'label_ar',
      detail_en = p_variety->>'detail_en',
      detail_ar = p_variety->>'detail_ar',
      image_url = p_variety->>'image_url',
      display_order = (p_variety->>'display_order')::int
    WHERE id = v_id;
  ELSE
    INSERT INTO product_varieties (product_id, category, label_en, label_ar, detail_en, detail_ar, image_url, display_order)
    VALUES (
      (p_variety->>'product_id')::uuid,
      p_variety->>'category',
      p_variety->>'label_en',
      p_variety->>'label_ar',
      p_variety->>'detail_en',
      p_variety->>'detail_ar',
      p_variety->>'image_url',
      (p_variety->>'display_order')::int
    );
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_save_variety(text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_save_variety(text, text, jsonb) TO anon, authenticated;

-- admin_delete_variety
CREATE OR REPLACE FUNCTION public.admin_delete_variety(p_username text, p_password text, p_variety_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.check_admin_credentials(p_username, p_password) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  DELETE FROM product_varieties WHERE id = p_variety_id;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_variety(text, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_variety(text, text, uuid) TO anon, authenticated;

-- admin_change_credentials
CREATE OR REPLACE FUNCTION public.admin_change_credentials(p_username text, p_password text, p_new_username text, p_new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.check_admin_credentials(p_username, p_password) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE admin_settings SET username = p_new_username, password_hash = p_new_password, updated_at = now();
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_change_credentials(text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_change_credentials(text, text, text, text) TO anon, authenticated;

-- Remove ALL write policies from admin-managed tables
DROP POLICY IF EXISTS "admin_insert_products" ON public.products;
DROP POLICY IF EXISTS "admin_update_products" ON public.products;
DROP POLICY IF EXISTS "admin_delete_products" ON public.products;
DROP POLICY IF EXISTS "admin_insert_content" ON public.site_content;
DROP POLICY IF EXISTS "admin_update_content" ON public.site_content;
DROP POLICY IF EXISTS "admin_delete_content" ON public.site_content;
DROP POLICY IF EXISTS "admin_update_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "admin_insert_varieties" ON public.product_varieties;
DROP POLICY IF EXISTS "admin_update_varieties" ON public.product_varieties;
DROP POLICY IF EXISTS "admin_delete_varieties" ON public.product_varieties;
DROP POLICY IF EXISTS "admin_insert_site_media" ON public.site_media;
DROP POLICY IF EXISTS "admin_update_site_media" ON public.site_media;
DROP POLICY IF EXISTS "admin_delete_site_media" ON public.site_media;
DROP POLICY IF EXISTS "admin_insert_bot_settings" ON public.bot_settings;
DROP POLICY IF EXISTS "admin_update_bot_settings" ON public.bot_settings;
DROP POLICY IF EXISTS "admin_delete_bot_settings" ON public.bot_settings;

-- Revoke direct write privileges on admin tables
REVOKE INSERT, UPDATE, DELETE ON public.products FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.site_content FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.admin_settings FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.product_varieties FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.site_media FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.bot_settings FROM anon, authenticated;

-- Remove storage write policies (uploads go through edge function with service role)
DROP POLICY IF EXISTS "admin_upload_product_images" ON storage.objects;
DROP POLICY IF EXISTS "admin_update_product_images" ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_product_images" ON storage.objects;
DROP POLICY IF EXISTS "admin_insert_site_images" ON storage.objects;
DROP POLICY IF EXISTS "admin_update_site_images" ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_site_images" ON storage.objects;

REVOKE INSERT, UPDATE, DELETE ON storage.objects FROM anon, authenticated;
