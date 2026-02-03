-- DetailFlow Pro Multi-Tenant Database Schema
-- Core architecture for car detailing studio SaaS

-- ============================================
-- ENUMS
-- ============================================

-- User roles within a studio
CREATE TYPE public.user_role AS ENUM ('owner', 'staff');

-- Staff approval status
CREATE TYPE public.staff_status AS ENUM ('pending', 'approved', 'rejected');

-- Job status workflow
CREATE TYPE public.job_status AS ENUM (
  'pending',
  'scheduled',
  'in_progress',
  'awaiting_review',
  'completed',
  'cancelled'
);

-- Pickup/drop options
CREATE TYPE public.transport_type AS ENUM ('pickup', 'drop', 'both', 'none');

-- ============================================
-- STUDIOS (TENANTS)
-- ============================================

CREATE TABLE public.studios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  join_key TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES (USER ACCOUNTS)
-- ============================================

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'staff',
  status staff_status NOT NULL DEFAULT 'pending',
  permissions JSONB DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CUSTOMERS
-- ============================================

CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(studio_id, phone)
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CARS
-- ============================================

CREATE TABLE public.cars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  color TEXT,
  license_plate TEXT,
  vin TEXT,
  existing_modifications TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

-- ============================================
-- JOBS
-- ============================================

CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id),
  status job_status NOT NULL DEFAULT 'pending',
  transport transport_type NOT NULL DEFAULT 'none',
  scheduled_date DATE,
  scheduled_time TIME,
  estimated_completion DATE,
  total_price DECIMAL(10, 2),
  notes TEXT,
  customer_view_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- JOB CUSTOMIZATION ZONES
-- ============================================

CREATE TABLE public.job_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  zone_type TEXT NOT NULL, -- e.g., 'exterior', 'interior'
  zone_name TEXT NOT NULL, -- e.g., 'hood', 'driver_door', 'dashboard'
  services JSONB DEFAULT '[]', -- Array of service items
  color_change TEXT,
  expected_result TEXT,
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_zones ENABLE ROW LEVEL SECURITY;

-- ============================================
-- JOB MEDIA
-- ============================================

CREATE TABLE public.job_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES public.job_zones(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'image', 'video', 'voice_note'
  stage TEXT NOT NULL, -- 'before', 'after', 'during', 'pickup', 'drop'
  url TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_media ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PICKUP/DROP RECORDS
-- ============================================

CREATE TABLE public.transport_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'pickup' or 'drop'
  condition_notes TEXT,
  existing_damage TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transport_records ENABLE ROW LEVEL SECURITY;

-- ============================================
-- JOB SUBMISSIONS (Worker Completion Reports)
-- ============================================

CREATE TABLE public.job_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES public.profiles(id),
  notes TEXT,
  issues_found TEXT,
  approved BOOLEAN,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INVOICES (Basic)
-- ============================================

CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  invoice_number TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'paid'
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Generate unique join key for studios
CREATE OR REPLACE FUNCTION public.generate_join_key()
RETURNS TEXT AS $$
DECLARE
  key TEXT;
  key_exists BOOLEAN;
BEGIN
  LOOP
    key := upper(substring(encode(gen_random_bytes(4), 'hex') from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM public.studios WHERE join_key = key) INTO key_exists;
    EXIT WHEN NOT key_exists;
  END LOOP;
  RETURN key;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Check if user belongs to studio (security definer)
CREATE OR REPLACE FUNCTION public.user_belongs_to_studio(p_user_id UUID, p_studio_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = p_user_id
      AND studio_id = p_studio_id
      AND status = 'approved'
  )
$$;

-- Check if user is studio owner (security definer)
CREATE OR REPLACE FUNCTION public.is_studio_owner(p_user_id UUID, p_studio_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = p_user_id
      AND studio_id = p_studio_id
      AND role = 'owner'
  )
$$;

-- Get user's studio_id (security definer)
CREATE OR REPLACE FUNCTION public.get_user_studio_id(p_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT studio_id
  FROM public.profiles
  WHERE user_id = p_user_id
  LIMIT 1
$$;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_studios_updated_at
  BEFORE UPDATE ON public.studios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_zones_updated_at
  BEFORE UPDATE ON public.job_zones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================

-- STUDIOS policies
CREATE POLICY "Users can view their own studio"
  ON public.studios FOR SELECT
  USING (public.user_belongs_to_studio(auth.uid(), id) OR owner_id = auth.uid());

CREATE POLICY "Owners can update their studio"
  ON public.studios FOR UPDATE
  USING (public.is_studio_owner(auth.uid(), id));

CREATE POLICY "New studios can be created by authenticated users"
  ON public.studios FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- PROFILES policies
CREATE POLICY "Users can view profiles in their studio"
  ON public.profiles FOR SELECT
  USING (
    studio_id IS NULL 
    OR public.user_belongs_to_studio(auth.uid(), studio_id)
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can update profiles in their studio"
  ON public.profiles FOR UPDATE
  USING (public.is_studio_owner(auth.uid(), studio_id));

-- CUSTOMERS policies
CREATE POLICY "Studio members can view customers"
  ON public.customers FOR SELECT
  USING (public.user_belongs_to_studio(auth.uid(), studio_id));

CREATE POLICY "Studio members can create customers"
  ON public.customers FOR INSERT
  WITH CHECK (public.user_belongs_to_studio(auth.uid(), studio_id));

CREATE POLICY "Studio members can update customers"
  ON public.customers FOR UPDATE
  USING (public.user_belongs_to_studio(auth.uid(), studio_id));

CREATE POLICY "Owners can delete customers"
  ON public.customers FOR DELETE
  USING (public.is_studio_owner(auth.uid(), studio_id));

-- CARS policies
CREATE POLICY "Studio members can view cars"
  ON public.cars FOR SELECT
  USING (public.user_belongs_to_studio(auth.uid(), studio_id));

CREATE POLICY "Studio members can create cars"
  ON public.cars FOR INSERT
  WITH CHECK (public.user_belongs_to_studio(auth.uid(), studio_id));

CREATE POLICY "Studio members can update cars"
  ON public.cars FOR UPDATE
  USING (public.user_belongs_to_studio(auth.uid(), studio_id));

CREATE POLICY "Owners can delete cars"
  ON public.cars FOR DELETE
  USING (public.is_studio_owner(auth.uid(), studio_id));

-- JOBS policies
CREATE POLICY "Studio members can view jobs"
  ON public.jobs FOR SELECT
  USING (public.user_belongs_to_studio(auth.uid(), studio_id));

CREATE POLICY "Studio members can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (public.user_belongs_to_studio(auth.uid(), studio_id));

CREATE POLICY "Studio members can update jobs"
  ON public.jobs FOR UPDATE
  USING (public.user_belongs_to_studio(auth.uid(), studio_id));

CREATE POLICY "Owners can delete jobs"
  ON public.jobs FOR DELETE
  USING (public.is_studio_owner(auth.uid(), studio_id));

-- JOB_ZONES policies
CREATE POLICY "Studio members can view job zones"
  ON public.job_zones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_zones.job_id
      AND public.user_belongs_to_studio(auth.uid(), jobs.studio_id)
    )
  );

CREATE POLICY "Studio members can create job zones"
  ON public.job_zones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_zones.job_id
      AND public.user_belongs_to_studio(auth.uid(), jobs.studio_id)
    )
  );

CREATE POLICY "Studio members can update job zones"
  ON public.job_zones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_zones.job_id
      AND public.user_belongs_to_studio(auth.uid(), jobs.studio_id)
    )
  );

CREATE POLICY "Owners can delete job zones"
  ON public.job_zones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_zones.job_id
      AND public.is_studio_owner(auth.uid(), jobs.studio_id)
    )
  );

-- JOB_MEDIA policies
CREATE POLICY "Studio members can view job media"
  ON public.job_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_media.job_id
      AND public.user_belongs_to_studio(auth.uid(), jobs.studio_id)
    )
  );

CREATE POLICY "Studio members can upload job media"
  ON public.job_media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_media.job_id
      AND public.user_belongs_to_studio(auth.uid(), jobs.studio_id)
    )
  );

CREATE POLICY "Media uploaders can delete their media"
  ON public.job_media FOR DELETE
  USING (uploaded_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- TRANSPORT_RECORDS policies
CREATE POLICY "Studio members can view transport records"
  ON public.transport_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = transport_records.job_id
      AND public.user_belongs_to_studio(auth.uid(), jobs.studio_id)
    )
  );

CREATE POLICY "Studio members can create transport records"
  ON public.transport_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = transport_records.job_id
      AND public.user_belongs_to_studio(auth.uid(), jobs.studio_id)
    )
  );

-- JOB_SUBMISSIONS policies
CREATE POLICY "Studio members can view submissions"
  ON public.job_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_submissions.job_id
      AND public.user_belongs_to_studio(auth.uid(), jobs.studio_id)
    )
  );

CREATE POLICY "Workers can create submissions"
  ON public.job_submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_submissions.job_id
      AND public.user_belongs_to_studio(auth.uid(), jobs.studio_id)
    )
  );

CREATE POLICY "Owners can update submissions (approve/reject)"
  ON public.job_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_submissions.job_id
      AND public.is_studio_owner(auth.uid(), jobs.studio_id)
    )
  );

-- INVOICES policies
CREATE POLICY "Studio members can view invoices"
  ON public.invoices FOR SELECT
  USING (public.user_belongs_to_studio(auth.uid(), studio_id));

CREATE POLICY "Owners can create invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (public.is_studio_owner(auth.uid(), studio_id));

CREATE POLICY "Owners can update invoices"
  ON public.invoices FOR UPDATE
  USING (public.is_studio_owner(auth.uid(), studio_id));

CREATE POLICY "Owners can delete invoices"
  ON public.invoices FOR DELETE
  USING (public.is_studio_owner(auth.uid(), studio_id));

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_studio_id ON public.profiles(studio_id);
CREATE INDEX idx_customers_studio_id ON public.customers(studio_id);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_cars_studio_id ON public.cars(studio_id);
CREATE INDEX idx_cars_customer_id ON public.cars(customer_id);
CREATE INDEX idx_jobs_studio_id ON public.jobs(studio_id);
CREATE INDEX idx_jobs_customer_id ON public.jobs(customer_id);
CREATE INDEX idx_jobs_car_id ON public.jobs(car_id);
CREATE INDEX idx_jobs_assigned_to ON public.jobs(assigned_to);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_customer_view_token ON public.jobs(customer_view_token);
CREATE INDEX idx_job_zones_job_id ON public.job_zones(job_id);
CREATE INDEX idx_job_media_job_id ON public.job_media(job_id);
CREATE INDEX idx_invoices_studio_id ON public.invoices(studio_id);
CREATE INDEX idx_invoices_job_id ON public.invoices(job_id);