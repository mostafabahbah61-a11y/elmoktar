/*
# Fix admin_change_credentials to return false instead of raising exception

The previous version raised RAISE EXCEPTION 'Not authorized' when credentials
didn't match, which caused PostgREST to return an error object. This made it
impossible to distinguish between "wrong credentials" and "function error" in
the frontend. Now it returns false for wrong credentials and true on success.
*/

CREATE OR REPLACE FUNCTION public.admin_change_credentials(p_username text, p_password text, p_new_username text, p_new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.check_admin_credentials(p_username, p_password) THEN
    RETURN false;
  END IF;
  UPDATE admin_settings SET username = p_new_username, password_hash = p_new_password, updated_at = now() WHERE username = p_username;
  RETURN true;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.admin_change_credentials(text, text, text, text) TO anon, authenticated, service_role;
