-- Add GSTIN to studios table for owner business info
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS gstin TEXT;

-- Add admin role to user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';

-- Create an admins table for platform-level admin management
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Admins can view all admin records
CREATE POLICY "Admins can view admins" ON public.admins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

-- Only existing admins can add new admins
CREATE POLICY "Admins can add admins" ON public.admins
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

-- Admins can update admin records
CREATE POLICY "Admins can update admins" ON public.admins
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admins WHERE user_id = p_user_id);
END;
$$;

-- Add RLS policy for admins to view all studios
CREATE POLICY "Admins can view all studios" ON public.studios
  FOR SELECT USING (is_admin(auth.uid()));

-- Add RLS policy for admins to view all profiles  
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin(auth.uid()));

-- Add RLS policy for admins to view all customers
CREATE POLICY "Admins can view all customers" ON public.customers
  FOR SELECT USING (is_admin(auth.uid()));

-- Add RLS policy for admins to view all jobs
CREATE POLICY "Admins can view all jobs" ON public.jobs
  FOR SELECT USING (is_admin(auth.uid()));

-- Add RLS policy for admins to view all cars
CREATE POLICY "Admins can view all cars" ON public.cars
  FOR SELECT USING (is_admin(auth.uid()));