-- Add WhatsApp API settings to studios table
ALTER TABLE public.studios 
ADD COLUMN IF NOT EXISTS whatsapp_api_key TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_phone_number TEXT;

-- Add GST fields to customers  
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS gstn TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Add vehicle type field to cars for different models (sedan, suv, bike)
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS vehicle_type TEXT DEFAULT 'sedan',
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS condition_notes TEXT,
ADD COLUMN IF NOT EXISTS mileage INTEGER;

-- Create table for before/after media with voice notes
CREATE TABLE IF NOT EXISTS public.job_condition_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL, -- 'image', 'video', 'voice_note'
  stage TEXT NOT NULL, -- 'before', 'after', 'during'
  url TEXT NOT NULL,
  notes TEXT,
  zone_id TEXT, -- optional link to specific zone
  created_at TIMESTAMPTZ DEFAULT now(),
  uploaded_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS on job_condition_media
ALTER TABLE public.job_condition_media ENABLE ROW LEVEL SECURITY;

-- RLS policies for job_condition_media
CREATE POLICY "Studio members can view job condition media"
ON public.job_condition_media
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = job_condition_media.job_id 
    AND user_belongs_to_studio(auth.uid(), jobs.studio_id)
  )
);

CREATE POLICY "Studio members can upload job condition media"
ON public.job_condition_media
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = job_condition_media.job_id 
    AND user_belongs_to_studio(auth.uid(), jobs.studio_id)
  )
);

CREATE POLICY "Media uploaders can delete their media"
ON public.job_condition_media
FOR DELETE
USING (
  uploaded_by = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Create table to track mechanic work history
CREATE TABLE IF NOT EXISTS public.work_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES public.job_zones(id),
  action TEXT NOT NULL, -- 'started', 'completed', 'paused', 'resumed'
  performed_by UUID NOT NULL REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on work_logs
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for work_logs
CREATE POLICY "Studio members can view work logs"
ON public.work_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = work_logs.job_id 
    AND user_belongs_to_studio(auth.uid(), jobs.studio_id)
  )
);

CREATE POLICY "Studio members can create work logs"
ON public.work_logs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = work_logs.job_id 
    AND user_belongs_to_studio(auth.uid(), jobs.studio_id)
  )
);

-- Add pricing fields to job_zones
ALTER TABLE public.job_zones
ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS labor_time_minutes INTEGER DEFAULT 0;