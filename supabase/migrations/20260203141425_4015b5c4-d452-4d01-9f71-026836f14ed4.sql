-- Create a secure function to add admin during signup
-- This bypasses RLS but only allows adding yourself as admin
CREATE OR REPLACE FUNCTION public.create_admin_on_signup(
  p_user_id uuid,
  p_email text,
  p_full_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow if the user_id matches the authenticated user
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'You can only create an admin record for yourself';
  END IF;
  
  -- Check if admin already exists for this user
  IF EXISTS (SELECT 1 FROM public.admins WHERE user_id = p_user_id) THEN
    RETURN true; -- Already exists, return success
  END IF;
  
  -- Insert the admin record
  INSERT INTO public.admins (user_id, email, full_name)
  VALUES (p_user_id, p_email, p_full_name);
  
  RETURN true;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_admin_on_signup TO authenticated;