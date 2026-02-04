-- Add 'mechanic' to user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'mechanic';

-- Create index for faster profile lookups by role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Create index for faster job assignments
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_to ON public.jobs(assigned_to);

-- Update RLS policy to allow mechanics to see their assigned jobs
DROP POLICY IF EXISTS "Users can view jobs in their studio" ON public.jobs;
CREATE POLICY "Users can view jobs in their studio"
  ON public.jobs
  FOR SELECT
  USING (
    studio_id = (SELECT studio_id FROM public.profiles WHERE user_id = auth.uid())
    OR assigned_to = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Allow mechanics to update job status
DROP POLICY IF EXISTS "Users can update jobs in their studio" ON public.jobs;
CREATE POLICY "Users can update jobs in their studio"
  ON public.jobs
  FOR UPDATE
  USING (
    studio_id = (SELECT studio_id FROM public.profiles WHERE user_id = auth.uid())
    OR assigned_to = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );