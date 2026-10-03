-- Fix RLS policies so the admin dashboard (which uses custom credentials, not Supabase Auth)
-- can write to tables. The admin client is effectively "anon" in Supabase terms.

-- products: add anon write policies
DROP POLICY IF EXISTS "admin_delete_products" ON products;
DROP POLICY IF EXISTS "admin_insert_products" ON products;
DROP POLICY IF EXISTS "admin_update_products" ON products;

CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- site_content: add anon write policies
DROP POLICY IF EXISTS "admin_write_content" ON site_content;

CREATE POLICY "anon_insert_content" ON site_content FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_content" ON site_content FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_content" ON site_content FOR DELETE
  TO anon, authenticated USING (true);

-- admin_settings: add anon write policies
DROP POLICY IF EXISTS "admin_write_settings" ON admin_settings;

CREATE POLICY "anon_insert_settings" ON admin_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_settings" ON admin_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_settings" ON admin_settings FOR DELETE
  TO anon, authenticated USING (true);

-- product_varieties: add write policies (currently only has SELECT)
CREATE POLICY "anon_insert_varieties" ON product_varieties FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_varieties" ON product_varieties FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_varieties" ON product_varieties FOR DELETE
  TO anon, authenticated USING (true);
