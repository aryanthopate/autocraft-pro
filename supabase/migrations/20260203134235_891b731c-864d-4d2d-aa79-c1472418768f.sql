-- Create storage bucket for 3D car models
INSERT INTO storage.buckets (id, name, public) 
VALUES ('car-models', 'car-models', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to car models
CREATE POLICY "Car models are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'car-models');

-- Allow admins to upload car models
CREATE POLICY "Admins can upload car models" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'car-models' AND is_admin(auth.uid()));

-- Allow admins to update car models
CREATE POLICY "Admins can update car models" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'car-models' AND is_admin(auth.uid()));

-- Allow admins to delete car models
CREATE POLICY "Admins can delete car models" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'car-models' AND is_admin(auth.uid()));

-- Create table for 3D car model metadata
CREATE TABLE public.car_models_3d (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  model_url TEXT NOT NULL,
  thumbnail_url TEXT,
  default_color TEXT DEFAULT '#FF6600',
  is_active BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES public.admins(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.car_models_3d ENABLE ROW LEVEL SECURITY;

-- Everyone can view active 3D models
CREATE POLICY "Anyone can view active 3D models" 
ON public.car_models_3d 
FOR SELECT 
USING (is_active = true);

-- Admins can view all 3D models
CREATE POLICY "Admins can view all 3D models" 
ON public.car_models_3d 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Admins can create 3D models
CREATE POLICY "Admins can create 3D models" 
ON public.car_models_3d 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Admins can update 3D models
CREATE POLICY "Admins can update 3D models" 
ON public.car_models_3d 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Admins can delete 3D models
CREATE POLICY "Admins can delete 3D models" 
ON public.car_models_3d 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_car_models_3d_updated_at
BEFORE UPDATE ON public.car_models_3d
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();