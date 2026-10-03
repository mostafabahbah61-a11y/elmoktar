-- Simplify admin auth: password-only login with fixed username "admin"
-- Update current credentials to username=admin, password=admin
UPDATE admin_settings SET username = 'admin', password_hash = 'admin', updated_at = now();

-- Replace check_admin_credentials to only check password (username is always "admin")
CREATE OR REPLACE FUNCTION public.check_admin_credentials(p_username text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_settings
    WHERE password_hash = p_password
  );
END;
$function$;

-- Replace admin_change_credentials to only change password
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
  UPDATE admin_settings SET password_hash = p_new_password, updated_at = now();
  RETURN true;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.check_admin_credentials(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_change_credentials(text, text, text, text) TO anon, authenticated, service_role;
