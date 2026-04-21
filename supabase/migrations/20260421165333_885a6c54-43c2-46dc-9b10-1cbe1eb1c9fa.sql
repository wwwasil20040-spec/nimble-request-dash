
-- Fix function search path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Replace overly-permissive INSERT policy on service_requests with field validation
DROP POLICY IF EXISTS "Anyone can submit a service request" ON public.service_requests;

CREATE POLICY "Anyone can submit valid service request"
  ON public.service_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(full_name)) BETWEEN 1 AND 200
    AND length(trim(phone)) BETWEEN 5 AND 50
    AND length(trim(details)) BETWEEN 1 AND 5000
    AND (service_type IS NULL OR length(service_type) <= 200)
    AND (file_name IS NULL OR length(file_name) <= 300)
    AND (file_path IS NULL OR length(file_path) <= 500)
    AND status = 'new'
    AND received_by IS NULL
    AND received_by_email IS NULL
  );

-- Tighten storage upload policy to request-files bucket with size & path constraints
DROP POLICY IF EXISTS "Anyone can upload request files" ON storage.objects;

CREATE POLICY "Anyone can upload to request-files"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'request-files'
    AND length(name) BETWEEN 1 AND 500
    AND (metadata->>'size')::bigint <= 52428800
  );
