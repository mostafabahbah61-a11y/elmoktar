-- Simplify to absolute minimum: one function, password-only
-- Drop old functions and recreate with minimal signature

CREATE OR REPLACE FUNCTION public.admin_change_password(p_old_password text, p_new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_settings WHERE password_hash = p_old_password) THEN
    RETURN false;
  END IF;
  UPDATE admin_settings SET password_hash = p_new_password, updated_at = now();
  RETURN true;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.admin_change_password(text, text) TO anon, authenticated, service_role;
