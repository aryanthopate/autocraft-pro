-- Fix storage RLS policies for car-models bucket with proper TO clauses

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view car models" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload car models" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update car models" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete car models" ON storage.objects;

-- Recreate with explicit TO clauses
CREATE POLICY "Anyone can view car models"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'car-models');

CREATE POLICY "Admins can upload car models"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'car-models' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Admins can update car models"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'car-models' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Admins can delete car models"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'car-models' 
  AND is_admin(auth.uid())
);