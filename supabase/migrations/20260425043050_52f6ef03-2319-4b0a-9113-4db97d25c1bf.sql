-- Add tracking_code column
ALTER TABLE public.service_requests
ADD COLUMN tracking_code text UNIQUE;

-- Function to generate short tracking code: 3 letters + 4 digits
CREATE OR REPLACE FUNCTION public.generate_tracking_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  digits text := '23456789';
  code text;
  exists_count int;
BEGIN
  LOOP
    code := substr(chars, 1+floor(random()*length(chars))::int, 1)
         || substr(chars, 1+floor(random()*length(chars))::int, 1)
         || substr(chars, 1+floor(random()*length(chars))::int, 1)
         || '-'
         || substr(digits, 1+floor(random()*length(digits))::int, 1)
         || substr(digits, 1+floor(random()*length(digits))::int, 1)
         || substr(digits, 1+floor(random()*length(digits))::int, 1)
         || substr(digits, 1+floor(random()*length(digits))::int, 1);
    SELECT count(*) INTO exists_count FROM public.service_requests WHERE tracking_code = code;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN code;
END;
$$;

-- Trigger to auto-assign tracking_code
CREATE OR REPLACE FUNCTION public.set_tracking_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.tracking_code IS NULL THEN
    NEW.tracking_code := public.generate_tracking_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_tracking_code
BEFORE INSERT ON public.service_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_tracking_code();

-- Backfill existing rows
UPDATE public.service_requests
SET tracking_code = public.generate_tracking_code()
WHERE tracking_code IS NULL;

-- Make NOT NULL
ALTER TABLE public.service_requests
ALTER COLUMN tracking_code SET NOT NULL;

-- Public RPC: anyone can look up their request by code + phone (last 4 digits match)
CREATE OR REPLACE FUNCTION public.track_request(_code text, _phone text)
RETURNS TABLE (
  tracking_code text,
  full_name text,
  service_type text,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sr.tracking_code, sr.full_name, sr.service_type, sr.status, sr.created_at, sr.updated_at
  FROM public.service_requests sr
  WHERE upper(sr.tracking_code) = upper(trim(_code))
    AND right(regexp_replace(sr.phone, '\D', '', 'g'), 4) = right(regexp_replace(_phone, '\D', '', 'g'), 4)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.track_request(text, text) TO anon, authenticated;