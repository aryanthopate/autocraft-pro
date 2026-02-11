-- ============================================================
-- DetailFlow Pro - Complete Supabase Schema
-- Generated: 2026-02-11
-- Copy & paste this into any Supabase SQL Editor to deploy
-- ============================================================

-- 1. ENUMS
-- ============================================================
CREATE TYPE public.job_status AS ENUM (
  'pending', 'scheduled', 'in_progress', 'awaiting_review', 'completed', 'cancelled'
);

CREATE TYPE public.staff_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE public.transport_type AS ENUM ('pickup', 'drop', 'both', 'none');

CREATE TYPE public.user_role AS ENUM ('owner', 'staff', 'admin', 'mechanic');


-- 2. TABLES
-- ============================================================

-- Admins (platform-level superusers)
CREATE TABLE public.admins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  email text NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Studios (tenants / vendors)
CREATE TABLE public.studios (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL,
  name text NOT NULL,
  join_key text NOT NULL,
  email text,
  phone text,
  address text,
  gstin text,
  whatsapp_api_key text,
  whatsapp_phone_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Profiles (all users: owners, staff, mechanics)
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  studio_id uuid REFERENCES public.studios(id),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  avatar_url text,
  role public.user_role NOT NULL DEFAULT 'staff',
  status public.staff_status NOT NULL DEFAULT 'pending',
  permissions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Customers
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id uuid NOT NULL REFERENCES public.studios(id),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  notes text,
  gstn text,
  whatsapp_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Cars (vehicles)
CREATE TABLE public.cars (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id uuid NOT NULL REFERENCES public.studios(id),
  customer_id uuid NOT NULL REFERENCES public.customers(id),
  make text NOT NULL,
  model text NOT NULL,
  year integer,
  color text,
  vehicle_type text DEFAULT 'sedan',
  vin text,
  license_plate text,
  registration_number text,
  mileage integer,
  condition_notes text,
  existing_modifications text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Jobs
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id uuid NOT NULL REFERENCES public.studios(id),
  customer_id uuid NOT NULL REFERENCES public.customers(id),
  car_id uuid NOT NULL REFERENCES public.cars(id),
  assigned_to uuid REFERENCES public.profiles(id),
  status public.job_status NOT NULL DEFAULT 'pending',
  transport public.transport_type NOT NULL DEFAULT 'none',
  scheduled_date date,
  scheduled_time time,
  estimated_completion date,
  total_price numeric,
  notes text,
  customer_view_token text DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Job Zones
CREATE TABLE public.job_zones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  zone_name text NOT NULL,
  zone_type text NOT NULL,
  services jsonb DEFAULT '[]'::jsonb,
  price numeric DEFAULT 0,
  labor_time_minutes integer DEFAULT 0,
  color_change text,
  expected_result text,
  notes text,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Job Submissions (review workflow)
CREATE TABLE public.job_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  submitted_by uuid NOT NULL REFERENCES public.profiles(id),
  approved boolean,
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  notes text,
  issues_found text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Job Media (before/after photos)
CREATE TABLE public.job_media (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  zone_id uuid REFERENCES public.job_zones(id),
  uploaded_by uuid REFERENCES public.profiles(id),
  url text NOT NULL,
  type text NOT NULL,
  stage text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Job Condition Media
CREATE TABLE public.job_condition_media (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  uploaded_by uuid REFERENCES public.profiles(id),
  url text NOT NULL,
  media_type text NOT NULL,
  stage text NOT NULL,
  zone_id text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Work Logs
CREATE TABLE public.work_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  performed_by uuid NOT NULL REFERENCES public.profiles(id),
  zone_id uuid REFERENCES public.job_zones(id),
  action text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Transport Records
CREATE TABLE public.transport_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  recorded_by uuid REFERENCES public.profiles(id),
  type text NOT NULL,
  condition_notes text,
  existing_damage text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3D Car Models
CREATE TABLE public.car_models_3d (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  make text NOT NULL,
  model text NOT NULL,
  year integer,
  vehicle_category text NOT NULL DEFAULT 'car',
  model_url text NOT NULL,
  thumbnail_url text,
  default_color text DEFAULT '#FF6600',
  is_active boolean DEFAULT true,
  uploaded_by uuid REFERENCES public.admins(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Invoices
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id uuid NOT NULL REFERENCES public.studios(id),
  customer_id uuid NOT NULL REFERENCES public.customers(id),
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  invoice_number text NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  due_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_condition_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_models_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;


-- 4. SECURITY DEFINER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admins WHERE user_id = p_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_studio(p_user_id uuid, p_studio_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = p_user_id AND studio_id = p_studio_id AND status = 'approved'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_studio_owner(p_user_id uuid, p_studio_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = p_user_id AND studio_id = p_studio_id AND role = 'owner'
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_studio_id(p_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT studio_id FROM public.profiles WHERE user_id = p_user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.generate_join_key()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.check_is_admin(p_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM public.admins WHERE user_id = p_user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.create_admin_on_signup(p_user_id uuid, p_email text, p_full_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'You can only create an admin record for yourself';
  END IF;
  IF EXISTS (SELECT 1 FROM public.admins WHERE user_id = p_user_id) THEN
    RETURN true;
  END IF;
  INSERT INTO public.admins (user_id, email, full_name) VALUES (p_user_id, p_email, p_full_name);
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- 5. RLS POLICIES
-- ============================================================

-- ADMINS
CREATE POLICY "Admins can view admins" ON public.admins FOR SELECT USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));
CREATE POLICY "Admins can add admins" ON public.admins FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));
CREATE POLICY "Admins can update admins" ON public.admins FOR UPDATE USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- STUDIOS
CREATE POLICY "Users can lookup studios by join_key" ON public.studios FOR SELECT USING (true);
CREATE POLICY "Users can view their own studio" ON public.studios FOR SELECT USING (user_belongs_to_studio(auth.uid(), id) OR owner_id = auth.uid());
CREATE POLICY "Admins can view all studios" ON public.studios FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "New studios can be created by authenticated users" ON public.studios FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their studio" ON public.studios FOR UPDATE USING (is_studio_owner(auth.uid(), id));

-- PROFILES
CREATE POLICY "Users can view profiles in their studio" ON public.profiles FOR SELECT USING ((studio_id IS NULL) OR user_belongs_to_studio(auth.uid(), studio_id) OR (user_id = auth.uid()));
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can update profiles in their studio" ON public.profiles FOR UPDATE USING (is_studio_owner(auth.uid(), studio_id));

-- CUSTOMERS
CREATE POLICY "Studio members can view customers" ON public.customers FOR SELECT USING (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Admins can view all customers" ON public.customers FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Studio members can create customers" ON public.customers FOR INSERT WITH CHECK (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Studio members can update customers" ON public.customers FOR UPDATE USING (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Owners can delete customers" ON public.customers FOR DELETE USING (is_studio_owner(auth.uid(), studio_id));

-- CARS
CREATE POLICY "Studio members can view cars" ON public.cars FOR SELECT USING (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Admins can view all cars" ON public.cars FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Studio members can create cars" ON public.cars FOR INSERT WITH CHECK (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Studio members can update cars" ON public.cars FOR UPDATE USING (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Owners can delete cars" ON public.cars FOR DELETE USING (is_studio_owner(auth.uid(), studio_id));

-- JOBS
CREATE POLICY "Studio members can view jobs" ON public.jobs FOR SELECT USING (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Admins can view all jobs" ON public.jobs FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Users can view jobs in their studio" ON public.jobs FOR SELECT USING ((studio_id = (SELECT studio_id FROM profiles WHERE user_id = auth.uid())) OR (assigned_to = (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Studio members can create jobs" ON public.jobs FOR INSERT WITH CHECK (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Studio members can update jobs" ON public.jobs FOR UPDATE USING (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Users can update jobs in their studio" ON public.jobs FOR UPDATE USING ((studio_id = (SELECT studio_id FROM profiles WHERE user_id = auth.uid())) OR (assigned_to = (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Owners can delete jobs" ON public.jobs FOR DELETE USING (is_studio_owner(auth.uid(), studio_id));

-- JOB_ZONES
CREATE POLICY "Studio members can view job zones" ON public.job_zones FOR SELECT USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_zones.job_id AND user_belongs_to_studio(auth.uid(), jobs.studio_id)));
CREATE POLICY "Studio members can create job zones" ON public.job_zones FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_zones.job_id AND user_belongs_to_studio(auth.uid(), jobs.studio_id)));
CREATE POLICY "Studio members can update job zones" ON public.job_zones FOR UPDATE USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_zones.job_id AND user_belongs_to_studio(auth.uid(), jobs.studio_id)));
CREATE POLICY "Owners can delete job zones" ON public.job_zones FOR DELETE USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_zones.job_id AND is_studio_owner(auth.uid(), jobs.studio_id)));

-- JOB_SUBMISSIONS
CREATE POLICY "Studio members can view submissions" ON public.job_submissions FOR SELECT USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_submissions.job_id AND user_belongs_to_studio(auth.uid(), jobs.studio_id)));
CREATE POLICY "Workers can create submissions" ON public.job_submissions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_submissions.job_id AND user_belongs_to_studio(auth.uid(), jobs.studio_id)));
CREATE POLICY "Owners can update submissions (approve/reject)" ON public.job_submissions FOR UPDATE USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_submissions.job_id AND is_studio_owner(auth.uid(), jobs.studio_id)));

-- JOB_MEDIA
CREATE POLICY "Studio members can view job media" ON public.job_media FOR SELECT USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_media.job_id AND user_belongs_to_studio(auth.uid(), jobs.studio_id)));
CREATE POLICY "Studio members can upload job media" ON public.job_media FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_media.job_id AND user_belongs_to_studio(auth.uid(), jobs.studio_id)));
CREATE POLICY "Media uploaders can delete their media" ON public.job_media FOR DELETE USING (uploaded_by = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- JOB_CONDITION_MEDIA
CREATE POLICY "Studio members can view job condition media" ON public.job_condition_media FOR SELECT USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_condition_media.job_id AND user_belongs_to_studio(auth.uid(), jobs.studio_id)));
CREATE POLICY "Studio members can upload job condition media" ON public.job_condition_media FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_condition_media.job_id AND user_belongs_to_studio(auth.uid(), jobs.studio_id)));
CREATE POLICY "Media uploaders can delete their media" ON public.job_condition_media FOR DELETE USING (uploaded_by = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- WORK_LOGS
CREATE POLICY "Studio members can view work logs" ON public.work_logs FOR SELECT USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = work_logs.job_id AND user_belongs_to_studio(auth.uid(), jobs.studio_id)));
CREATE POLICY "Studio members can create work logs" ON public.work_logs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = work_logs.job_id AND user_belongs_to_studio(auth.uid(), jobs.studio_id)));

-- TRANSPORT_RECORDS
CREATE POLICY "Studio members can view transport records" ON public.transport_records FOR SELECT USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = transport_records.job_id AND user_belongs_to_studio(auth.uid(), jobs.studio_id)));
CREATE POLICY "Studio members can create transport records" ON public.transport_records FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = transport_records.job_id AND user_belongs_to_studio(auth.uid(), jobs.studio_id)));

-- CAR_MODELS_3D
CREATE POLICY "Anyone can view active 3D models" ON public.car_models_3d FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all 3D models" ON public.car_models_3d FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can create 3D models" ON public.car_models_3d FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update 3D models" ON public.car_models_3d FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete 3D models" ON public.car_models_3d FOR DELETE USING (is_admin(auth.uid()));

-- INVOICES
CREATE POLICY "Studio members can view invoices" ON public.invoices FOR SELECT USING (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Owners can create invoices" ON public.invoices FOR INSERT WITH CHECK (is_studio_owner(auth.uid(), studio_id));
CREATE POLICY "Owners can update invoices" ON public.invoices FOR UPDATE USING (is_studio_owner(auth.uid(), studio_id));
CREATE POLICY "Owners can delete invoices" ON public.invoices FOR DELETE USING (is_studio_owner(auth.uid(), studio_id));


-- 6. STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('car-models', 'car-models', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('job-media', 'job-media', true);

-- Storage policies for car-models
CREATE POLICY "Anyone can view car models" ON storage.objects FOR SELECT USING (bucket_id = 'car-models');
CREATE POLICY "Admins can upload car models" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'car-models' AND public.is_admin(auth.uid()));

-- Storage policies for job-media
CREATE POLICY "Studio members can view job media files" ON storage.objects FOR SELECT USING (bucket_id = 'job-media');
CREATE POLICY "Authenticated users can upload job media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'job-media' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own job media" ON storage.objects FOR DELETE USING (bucket_id = 'job-media' AND auth.uid()::text = (storage.foldername(name))[1]);


-- 7. DONE!
-- ============================================================
-- Your DetailFlow Pro schema is ready. 
-- Next steps:
-- 1. Create your first admin user via the /admin-signup page
-- 2. Create a studio owner account via /signup
-- 3. Upload 3D models via /admin/models
-- 4. Start creating jobs!
