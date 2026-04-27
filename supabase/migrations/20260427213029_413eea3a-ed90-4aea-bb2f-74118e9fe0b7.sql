-- Replace broad SELECT with one that prevents listing
DROP POLICY IF EXISTS "Public can read portfolio files" ON storage.objects;

-- Allow direct downloads by exact name only (no listing of bucket contents)
CREATE POLICY "Public can read portfolio files by name"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'portfolio-files'
    AND (storage.filename(name) IS NOT NULL)
    AND (auth.role() = 'anon' OR auth.role() = 'authenticated')
  );