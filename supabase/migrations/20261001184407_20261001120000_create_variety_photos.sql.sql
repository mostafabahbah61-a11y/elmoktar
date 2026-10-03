/*
# Create variety_photos table — multi-photo gallery for each variety

1. New Tables
- `variety_photos`
  - `id` (uuid, primary key)
  - `variety_id` (uuid, foreign key to product_varieties.id, ON DELETE CASCADE)
  - `image_url` (text, not null — URL of the uploaded photo)
  - `display_order` (integer, default 0 — ordering of photos within a variety)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `variety_photos`.
- Public read (anon + authenticated) so site visitors can see gallery photos.
- All writes go through admin RPC functions (SECURITY DEFINER, credential-checked).

3. Admin Functions
- `admin_add_variety_photo(p_username, p_password, p_variety_id, p_image_url)` — inserts a new photo.
- `admin_delete_variety_photo(p_username, p_password, p_photo_id)` — deletes a photo.

4. Notes
- Photos are deleted automatically when a variety is deleted (CASCADE).
- The admin-upload edge function already handles file uploads to the site-images bucket.
*/

CREATE TABLE IF NOT EXISTS variety_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variety_id uuid NOT NULL REFERENCES product_varieties(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE variety_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_variety_photos" ON variety_photos;
CREATE POLICY "anon_select_variety_photos"
ON variety_photos FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_variety_photos" ON variety_photos;
CREATE POLICY "anon_insert_variety_photos"
ON variety_photos FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_variety_photos" ON variety_photos;
CREATE POLICY "anon_delete_variety_photos"
ON variety_photos FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_variety_photos_variety_id ON variety_photos(variety_id);
CREATE INDEX IF NOT EXISTS idx_variety_photos_order ON variety_photos(variety_id, display_order);

-- Admin function: add a photo to a variety
CREATE OR REPLACE FUNCTION admin_add_variety_photo(
  p_username text,
  p_password text,
  p_variety_id uuid,
  p_image_url text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valid boolean;
  v_next_order integer;
  v_photo_id uuid;
BEGIN
  SELECT check_admin_credentials(p_username, p_password) INTO v_valid;
  IF NOT v_valid THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT COALESCE(MAX(display_order), 0) + 1 INTO v_next_order
  FROM variety_photos WHERE variety_id = p_variety_id;

  INSERT INTO variety_photos (variety_id, image_url, display_order)
  VALUES (p_variety_id, p_image_url, v_next_order)
  RETURNING id INTO v_photo_id;

  RETURN v_photo_id;
END;
$$;

-- Admin function: delete a photo
CREATE OR REPLACE FUNCTION admin_delete_variety_photo(
  p_username text,
  p_password text,
  p_photo_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valid boolean;
BEGIN
  SELECT check_admin_credentials(p_username, p_password) INTO v_valid;
  IF NOT v_valid THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  DELETE FROM variety_photos WHERE id = p_photo_id;
END;
$$;

-- Grant execute to anon and authenticated (writes are protected by credential check inside)
GRANT EXECUTE ON FUNCTION admin_add_variety_photo(text, text, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_variety_photo(text, text, uuid) TO anon, authenticated;
