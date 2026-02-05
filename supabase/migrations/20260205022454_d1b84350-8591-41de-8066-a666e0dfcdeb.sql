-- Add vehicle_category column to car_models_3d table
ALTER TABLE public.car_models_3d 
ADD COLUMN vehicle_category text NOT NULL DEFAULT 'car';

-- Add a comment explaining valid values
COMMENT ON COLUMN public.car_models_3d.vehicle_category IS 'Vehicle category: car, suv, bike, truck, van';

-- Create index for faster filtering by category
CREATE INDEX idx_car_models_3d_category ON public.car_models_3d(vehicle_category);