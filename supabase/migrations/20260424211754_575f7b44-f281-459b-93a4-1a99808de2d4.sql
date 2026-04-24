DROP POLICY IF EXISTS "Anyone can upload to request-files" ON storage.objects;

CREATE POLICY "Anyone can upload to request-files"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'request-files'
  AND length(name) BETWEEN 1 AND 500
);

UPDATE storage.buckets
SET file_size_limit = 52428800
WHERE id = 'request-files';