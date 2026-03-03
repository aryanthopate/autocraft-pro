
-- Job assignment requests table for mechanic pick-up & owner/staff approval
CREATE TABLE public.job_assignment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  denial_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.job_assignment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Studio members can view assignment requests"
  ON public.job_assignment_requests FOR SELECT
  USING (user_belongs_to_studio(auth.uid(), studio_id));

CREATE POLICY "Studio members can create assignment requests"
  ON public.job_assignment_requests FOR INSERT
  WITH CHECK (user_belongs_to_studio(auth.uid(), studio_id));

CREATE POLICY "Owners can update assignment requests"
  ON public.job_assignment_requests FOR UPDATE
  USING (is_studio_owner(auth.uid(), studio_id));

-- Notifications table for in-app notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  data jsonb DEFAULT '{}'::jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (recipient_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));

CREATE POLICY "Studio members can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (user_belongs_to_studio(auth.uid(), studio_id));

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (recipient_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));

-- Storage bucket for job intake media (images/videos)
INSERT INTO storage.buckets (id, name, public) VALUES ('job-media', 'job-media', true);

CREATE POLICY "Studio members can upload job media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'job-media');

CREATE POLICY "Anyone can view job media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'job-media');

CREATE POLICY "Uploaders can delete their job media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'job-media');
