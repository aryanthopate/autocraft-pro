-- Allow authenticated users to look up studios by join_key for joining purposes
CREATE POLICY "Users can lookup studios by join_key"
ON public.studios
FOR SELECT
USING (true);

-- Drop the restrictive policy that's blocking this
DROP POLICY IF EXISTS "Users can view their own studio" ON public.studios;

-- Recreate the view policy but make it permissive for member access
CREATE POLICY "Users can view their own studio"
ON public.studios
FOR SELECT
USING (user_belongs_to_studio(auth.uid(), id) OR (owner_id = auth.uid()));