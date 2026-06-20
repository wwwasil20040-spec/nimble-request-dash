CREATE TABLE public.service_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_out_of_stock boolean NOT NULL DEFAULT false,
  discount_percent int NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.service_options TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_options TO authenticated;
GRANT ALL ON public.service_options TO service_role;

ALTER TABLE public.service_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active service options"
  ON public.service_options FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert service options"
  ON public.service_options FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update service options"
  ON public.service_options FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete service options"
  ON public.service_options FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_service_options_updated_at
  BEFORE UPDATE ON public.service_options
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();