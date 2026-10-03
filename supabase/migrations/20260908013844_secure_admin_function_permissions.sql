/*
# Secure remaining admin functions

1. Purpose
- Make credential changes and user listing available only to an authenticated admin session.

2. Security
- Existing function signatures remain compatible with the dashboard while authorization comes from `auth.uid()`.
- Anonymous callers lose access to all admin functions.
*/

CREATE OR REPLACE FUNCTION public.update_admin_credentials(
  p_old_username text,
  p_old_password text,
  p_new_username text,
  p_new_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RETURN false;
  END IF;

  UPDATE public.admin_settings
  SET username = p_new_username,
      password_hash = p_new_password,
      updated_at = now()
  WHERE username = p_old_username AND password_hash = p_old_password;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.update_admin_credentials(text, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.update_admin_credentials(text, text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.list_registered_users(p_username text, p_password text)
RETURNS TABLE (id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT u.id, u.email::text, u.created_at, u.last_sign_in_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.list_registered_users(text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.list_registered_users(text, text) TO authenticated;
