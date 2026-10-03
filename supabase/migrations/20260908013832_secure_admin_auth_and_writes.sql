/*
# Secure admin authentication and dashboard writes

1. Purpose
- Replace the previous public write access with server-enforced admin authorization.
- Keep public website reads and customer order creation unchanged.

2. Modified data
- `admin_settings.admin_user_id` stores the Supabase Auth user assigned as the administrator.
- Existing products, content, media, and bot data are preserved.

3. Security changes
- Anonymous users lose INSERT, UPDATE, and DELETE access to all admin-managed tables.
- Authenticated users can write only when `auth.uid()` is the configured admin user.
- Storage uploads and edits are restricted to the configured admin user.
- Admin authorization is checked in SECURITY DEFINER functions with a fixed search path.

4. Bootstrap
- The first authenticated session may claim admin access only with the existing admin credentials.
- Once claimed, no other account can claim or use the admin write paths.
*/

ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_settings
    WHERE admin_user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_admin_access(p_username text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.admin_settings
  SET admin_user_id = auth.uid(), updated_at = now()
  WHERE admin_user_id IS NULL
    AND username = p_username
    AND password_hash = p_password;

  RETURN EXISTS (
    SELECT 1 FROM public.admin_settings WHERE admin_user_id = auth.uid()
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_admin_access(text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_admin_access(text, text) TO authenticated;

DROP POLICY IF EXISTS "anon_insert_products" ON public.products;
DROP POLICY IF EXISTS "anon_update_products" ON public.products;
DROP POLICY IF EXISTS "anon_delete_products" ON public.products;
DROP POLICY IF EXISTS "admin_insert_products" ON public.products;
DROP POLICY IF EXISTS "admin_update_products" ON public.products;
DROP POLICY IF EXISTS "admin_delete_products" ON public.products;

CREATE POLICY "admin_insert_products" ON public.products FOR INSERT
  TO authenticated WITH CHECK (public.is_current_user_admin());
CREATE POLICY "admin_update_products" ON public.products FOR UPDATE
  TO authenticated USING (public.is_current_user_admin()) WITH CHECK (public.is_current_user_admin());
CREATE POLICY "admin_delete_products" ON public.products FOR DELETE
  TO authenticated USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "anon_insert_content" ON public.site_content;
DROP POLICY IF EXISTS "anon_update_content" ON public.site_content;
DROP POLICY IF EXISTS "anon_delete_content" ON public.site_content;
DROP POLICY IF EXISTS "admin_write_content" ON public.site_content;

CREATE POLICY "admin_insert_content" ON public.site_content FOR INSERT
  TO authenticated WITH CHECK (public.is_current_user_admin());
CREATE POLICY "admin_update_content" ON public.site_content FOR UPDATE
  TO authenticated USING (public.is_current_user_admin()) WITH CHECK (public.is_current_user_admin());
CREATE POLICY "admin_delete_content" ON public.site_content FOR DELETE
  TO authenticated USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "anon_insert_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "anon_update_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "anon_delete_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "admin_write_settings" ON public.admin_settings;

CREATE POLICY "admin_update_settings" ON public.admin_settings FOR UPDATE
  TO authenticated USING (public.is_current_user_admin()) WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "anon_insert_varieties" ON public.product_varieties;
DROP POLICY IF EXISTS "anon_update_varieties" ON public.product_varieties;
DROP POLICY IF EXISTS "anon_delete_varieties" ON public.product_varieties;

CREATE POLICY "admin_insert_varieties" ON public.product_varieties FOR INSERT
  TO authenticated WITH CHECK (public.is_current_user_admin());
CREATE POLICY "admin_update_varieties" ON public.product_varieties FOR UPDATE
  TO authenticated USING (public.is_current_user_admin()) WITH CHECK (public.is_current_user_admin());
CREATE POLICY "admin_delete_varieties" ON public.product_varieties FOR DELETE
  TO authenticated USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "public_insert_site_media" ON public.site_media;
DROP POLICY IF EXISTS "public_update_site_media" ON public.site_media;
DROP POLICY IF EXISTS "public_delete_site_media" ON public.site_media;
DROP POLICY IF EXISTS "admin_insert_site_media" ON public.site_media;
DROP POLICY IF EXISTS "admin_update_site_media" ON public.site_media;
DROP POLICY IF EXISTS "admin_delete_site_media" ON public.site_media;

CREATE POLICY "admin_insert_site_media" ON public.site_media FOR INSERT
  TO authenticated WITH CHECK (public.is_current_user_admin());
CREATE POLICY "admin_update_site_media" ON public.site_media FOR UPDATE
  TO authenticated USING (public.is_current_user_admin()) WITH CHECK (public.is_current_user_admin());
CREATE POLICY "admin_delete_site_media" ON public.site_media FOR DELETE
  TO authenticated USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "public_insert_bot_settings" ON public.bot_settings;
DROP POLICY IF EXISTS "public_update_bot_settings" ON public.bot_settings;
DROP POLICY IF EXISTS "public_delete_bot_settings" ON public.bot_settings;
DROP POLICY IF EXISTS "admin_insert_bot_settings" ON public.bot_settings;
DROP POLICY IF EXISTS "admin_update_bot_settings" ON public.bot_settings;
DROP POLICY IF EXISTS "admin_delete_bot_settings" ON public.bot_settings;

CREATE POLICY "admin_insert_bot_settings" ON public.bot_settings FOR INSERT
  TO authenticated WITH CHECK (public.is_current_user_admin());
CREATE POLICY "admin_update_bot_settings" ON public.bot_settings FOR UPDATE
  TO authenticated USING (public.is_current_user_admin()) WITH CHECK (public.is_current_user_admin());
CREATE POLICY "admin_delete_bot_settings" ON public.bot_settings FOR DELETE
  TO authenticated USING (public.is_current_user_admin());

REVOKE INSERT, UPDATE, DELETE ON public.products, public.site_content, public.admin_settings, public.product_varieties, public.site_media, public.bot_settings FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.admin_settings FROM authenticated;
GRANT UPDATE (admin_user_id, updated_at) ON public.admin_settings TO authenticated;

DROP POLICY IF EXISTS "public_insert_site_images" ON storage.objects;
DROP POLICY IF EXISTS "public_update_site_images" ON storage.objects;
DROP POLICY IF EXISTS "public_delete_site_images" ON storage.objects;
DROP POLICY IF EXISTS "admin_insert_site_images" ON storage.objects;
DROP POLICY IF EXISTS "admin_update_site_images" ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_site_images" ON storage.objects;

CREATE POLICY "admin_insert_site_images" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'site-images' AND public.is_current_user_admin());
CREATE POLICY "admin_update_site_images" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'site-images' AND public.is_current_user_admin())
  WITH CHECK (bucket_id = 'site-images' AND public.is_current_user_admin());
CREATE POLICY "admin_delete_site_images" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'site-images' AND public.is_current_user_admin());

DROP POLICY IF EXISTS "admin_upload_product_images" ON storage.objects;
DROP POLICY IF EXISTS "admin_update_product_images" ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_product_images" ON storage.objects;

CREATE POLICY "admin_upload_product_images" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'product-images' AND public.is_current_user_admin());
CREATE POLICY "admin_update_product_images" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'product-images' AND public.is_current_user_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_current_user_admin());
CREATE POLICY "admin_delete_product_images" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'product-images' AND public.is_current_user_admin());

REVOKE EXECUTE ON FUNCTION public.check_admin_credentials(text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_admin_credentials(text, text, text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.list_registered_users(text, text) FROM anon, authenticated;
