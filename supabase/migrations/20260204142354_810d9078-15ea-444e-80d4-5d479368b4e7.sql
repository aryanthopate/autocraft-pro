-- Create a function to check if a user is an admin (bypasses RLS)
-- This is needed because the admins table RLS requires being an admin to read it
CREATE OR REPLACE FUNCTION public.check_is_admin(p_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.admins WHERE user_id = p_user_id LIMIT 1;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_is_admin TO authenticated;