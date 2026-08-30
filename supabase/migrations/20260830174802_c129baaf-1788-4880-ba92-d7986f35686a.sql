CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION private.is_admin_email()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_emails
    WHERE email = lower(coalesce((auth.jwt() ->> 'email'), ''))
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_admin_email() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_admin_email() TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins and staff can read leads" ON public.leads;
CREATE POLICY "Admins and staff can read leads"
ON public.leads FOR SELECT TO authenticated
USING (
  private.has_role(auth.uid(), 'admin')
  OR private.has_role(auth.uid(), 'staff')
  OR private.is_admin_email()
);

DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
CREATE POLICY "Admins can update leads"
ON public.leads FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin') OR private.is_admin_email())
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.is_admin_email());

DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
CREATE POLICY "Admins can delete leads"
ON public.leads FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'admin') OR private.is_admin_email());

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_admin_email();