DROP POLICY "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Public can submit a bounded lead" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(name) BETWEEN 1 AND 120
    AND length(email) BETWEEN 5 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (company IS NULL OR length(company) <= 200)
    AND (message IS NULL OR length(message) <= 5000)
    AND (source_path IS NULL OR length(source_path) <= 200)
  );