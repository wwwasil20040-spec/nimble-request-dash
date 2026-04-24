-- Notes table
CREATE TABLE public.request_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  author_email text NOT NULL,
  note text NOT NULL CHECK (length(trim(note)) BETWEEN 1 AND 5000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_request_notes_request_id ON public.request_notes(request_id, created_at DESC);
ALTER TABLE public.request_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read notes" ON public.request_notes
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert notes" ON public.request_notes
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') AND auth.uid() = author_id);
CREATE POLICY "Admins delete notes" ON public.request_notes
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Activity log table
CREATE TABLE public.request_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  from_value text,
  to_value text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_request_activity_request_id ON public.request_activity_log(request_id, created_at DESC);
ALTER TABLE public.request_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read activity" ON public.request_activity_log
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert activity" ON public.request_activity_log
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

-- Trigger to auto-log status changes
CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.request_activity_log (request_id, actor_id, actor_email, action, from_value, to_value)
    VALUES (NEW.id, auth.uid(), NEW.received_by_email, 'status_change', OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_status_change
AFTER UPDATE OF status ON public.service_requests
FOR EACH ROW EXECUTE FUNCTION public.log_status_change();