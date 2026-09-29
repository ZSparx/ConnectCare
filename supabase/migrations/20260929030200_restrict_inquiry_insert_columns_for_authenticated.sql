/*
  # Lock the enquiry handling status

  1. Security
     - The public enquiry policy applies to `anon` and `authenticated`. The
       anon INSERT grant is already column-scoped; do the same for
       `authenticated` so no caller can pre-set the internal `status` column
       and hide a lead from the admin queue. Admins still change `status`
       through the UPDATE grant.
*/

REVOKE INSERT ON public.client_inquiries FROM authenticated;
GRANT INSERT (company_name, contact_name, email, phone, service_interest, message)
  ON public.client_inquiries TO authenticated;
