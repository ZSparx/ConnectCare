/*
  # Deny-by-default for unauthenticated callers

  1. Security
     - Revoke every table privilege in `public` from `anon`, and stop future
       tables inheriting them via default privileges.
     - Re-grant only the column-scoped INSERT the public enquiry form needs,
       which also prevents an anonymous submitter from setting the internal
       `status` column on a lead.
*/

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon;

GRANT INSERT (company_name, contact_name, email, phone, service_interest, message)
  ON public.client_inquiries TO anon;

REVOKE UPDATE ON public.client_inquiries FROM authenticated;
GRANT UPDATE (company_name, contact_name, email, phone, service_interest, message, status)
  ON public.client_inquiries TO authenticated;
