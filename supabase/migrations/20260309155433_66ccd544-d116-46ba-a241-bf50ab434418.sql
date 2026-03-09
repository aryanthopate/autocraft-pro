
-- Estimates table
CREATE TABLE public.estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  car_id uuid NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft',
  total_amount numeric DEFAULT 0,
  gst_percentage numeric DEFAULT 0,
  gst_amount numeric DEFAULT 0,
  grand_total numeric DEFAULT 0,
  notes text,
  valid_until date,
  converted_job_id uuid REFERENCES public.jobs(id),
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Estimate items table
CREATE TABLE public.estimate_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id uuid NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  description text NOT NULL,
  zone_name text,
  quantity integer DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Inventory items table
CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  sku text,
  quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'pcs',
  min_stock_level numeric DEFAULT 5,
  cost_per_unit numeric DEFAULT 0,
  supplier text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Inventory transactions table
CREATE TABLE public.inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  type text NOT NULL,
  quantity numeric NOT NULL,
  job_id uuid REFERENCES public.jobs(id),
  notes text,
  performed_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Activity logs table
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  user_name text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for estimates
CREATE POLICY "Studio members can view estimates" ON public.estimates FOR SELECT USING (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Studio members can create estimates" ON public.estimates FOR INSERT WITH CHECK (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Studio members can update estimates" ON public.estimates FOR UPDATE USING (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Owners can delete estimates" ON public.estimates FOR DELETE USING (is_studio_owner(auth.uid(), studio_id));

-- RLS Policies for estimate_items
CREATE POLICY "View estimate items" ON public.estimate_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.estimates WHERE estimates.id = estimate_items.estimate_id AND user_belongs_to_studio(auth.uid(), estimates.studio_id)));
CREATE POLICY "Create estimate items" ON public.estimate_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.estimates WHERE estimates.id = estimate_items.estimate_id AND user_belongs_to_studio(auth.uid(), estimates.studio_id)));
CREATE POLICY "Update estimate items" ON public.estimate_items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.estimates WHERE estimates.id = estimate_items.estimate_id AND user_belongs_to_studio(auth.uid(), estimates.studio_id)));
CREATE POLICY "Delete estimate items" ON public.estimate_items FOR DELETE USING (EXISTS (SELECT 1 FROM public.estimates WHERE estimates.id = estimate_items.estimate_id AND is_studio_owner(auth.uid(), estimates.studio_id)));

-- RLS Policies for inventory_items
CREATE POLICY "Studio members can view inventory" ON public.inventory_items FOR SELECT USING (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Studio members can create inventory" ON public.inventory_items FOR INSERT WITH CHECK (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Studio members can update inventory" ON public.inventory_items FOR UPDATE USING (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Owners can delete inventory" ON public.inventory_items FOR DELETE USING (is_studio_owner(auth.uid(), studio_id));

-- RLS Policies for inventory_transactions
CREATE POLICY "Studio members can view transactions" ON public.inventory_transactions FOR SELECT USING (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Studio members can create transactions" ON public.inventory_transactions FOR INSERT WITH CHECK (user_belongs_to_studio(auth.uid(), studio_id));

-- RLS Policies for activity_logs
CREATE POLICY "Studio members can view activity logs" ON public.activity_logs FOR SELECT USING (user_belongs_to_studio(auth.uid(), studio_id));
CREATE POLICY "Studio members can create activity logs" ON public.activity_logs FOR INSERT WITH CHECK (user_belongs_to_studio(auth.uid(), studio_id));

-- Triggers for updated_at
CREATE TRIGGER set_estimates_updated_at BEFORE UPDATE ON public.estimates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for activity_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
