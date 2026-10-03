/*
# Create admin credential check and update functions

1. New Functions
- `check_admin_credentials(p_username, p_password)` — SECURITY DEFINER, returns boolean
- `update_admin_credentials(p_old_username, p_old_password, p_new_username, p_new_password)` — SECURITY DEFINER, returns boolean

2. Security
- Both functions are executable by anon and authenticated roles.
- They use SECURITY DEFINER to bypass RLS on admin_settings.
- check_admin_credentials only returns true/false, never exposes the stored password.
- update_admin_credentials verifies old credentials before updating.

3. Notes
- These allow the frontend to verify admin login without exposing the admin_settings table directly.
*/

CREATE OR REPLACE FUNCTION check_admin_credentials(p_username text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_settings
    WHERE username = p_username AND password_hash = p_password
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION check_admin_credentials FROM anon;
GRANT EXECUTE ON FUNCTION check_admin_credentials TO anon, authenticated;

CREATE OR REPLACE FUNCTION update_admin_credentials(
  p_old_username text,
  p_old_password text,
  p_new_username text,
  p_new_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM admin_settings
    WHERE username = p_old_username AND password_hash = p_old_password
  ) THEN
    RETURN false;
  END IF;

  UPDATE admin_settings
  SET username = p_new_username,
      password_hash = p_new_password,
      updated_at = now()
  WHERE username = p_old_username AND password_hash = p_old_password;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_admin_credentials FROM anon;
GRANT EXECUTE ON FUNCTION update_admin_credentials TO anon, authenticated;
