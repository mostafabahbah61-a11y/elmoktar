/*
# Remove public execution from admin functions

1. Purpose
- Remove inherited PUBLIC execution privileges left by the original admin functions.

2. Security
- Credential checks, admin bootstrap, admin checks, credential updates, and user listing cannot be called by anonymous visitors.
- Only authenticated sessions receive the exact function execution grants they need.
*/

REVOKE ALL ON FUNCTION public.check_admin_credentials(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_admin_access(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_admin_access(text, text) TO authenticated;
REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
REVOKE ALL ON FUNCTION public.update_admin_credentials(text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_admin_credentials(text, text, text, text) TO authenticated;
REVOKE ALL ON FUNCTION public.list_registered_users(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_registered_users(text, text) TO authenticated;

REVOKE INSERT, UPDATE, DELETE ON storage.objects FROM anon;
