-- Add status column to feedback table for admin management
ALTER TABLE public.feedback
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add processed_by and processed_at for audit trail
ALTER TABLE public.feedback
ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.feedback
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- Add improvement_note for admin notes
ALTER TABLE public.feedback
ADD COLUMN IF NOT EXISTS improvement_note TEXT;

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);

-- Admin RLS policies (allow admin to read/update all feedback)
DROP POLICY IF EXISTS "Admin can read all feedback" ON public.feedback;
CREATE POLICY "Admin can read all feedback"
  ON public.feedback FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'takumi@anymindgroup.com'
  );

DROP POLICY IF EXISTS "Admin can update all feedback" ON public.feedback;
CREATE POLICY "Admin can update all feedback"
  ON public.feedback FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'takumi@anymindgroup.com'
  );
