-- Portfolio items table
CREATE TABLE public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  field text,
  year text,
  description text,
  file_path text NOT NULL,
  file_name text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_by uuid,
  created_by_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view portfolio (public showcase)
CREATE POLICY "Anyone can view portfolio"
  ON public.portfolio_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert portfolio"
  ON public.portfolio_items FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update portfolio"
  ON public.portfolio_items FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete portfolio"
  ON public.portfolio_items FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_portfolio_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Public storage bucket for portfolio PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-files', 'portfolio-files', true);

-- Storage policies
CREATE POLICY "Public can read portfolio files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-files');

CREATE POLICY "Admins can upload portfolio files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update portfolio files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete portfolio files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio-files' AND has_role(auth.uid(), 'admin'::app_role));