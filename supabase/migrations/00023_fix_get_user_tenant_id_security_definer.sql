-- Fix: get_user_tenant_id() must be SECURITY DEFINER to bypass RLS
-- Without this, the function queries user_profiles which has RLS
-- that calls get_user_tenant_id(), creating a circular dependency.
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id
  FROM public.user_profiles
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;
