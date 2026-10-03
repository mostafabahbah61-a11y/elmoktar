/*
# Hide admin credentials from direct client reads

1. Purpose
- Prevent any authenticated client from reading the admin settings row or password field directly.

2. Security
- Admin settings have no direct SELECT policy or SELECT privilege for API roles.
- The protected admin functions continue to perform the required checks server-side.
- Public content and dashboard functionality are otherwise unchanged.
*/

DROP POLICY IF EXISTS "admin_read_settings" ON public.admin_settings;
REVOKE SELECT ON public.admin_settings FROM anon, authenticated;
