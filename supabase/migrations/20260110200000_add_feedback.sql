-- Feedback table for storing user feedback on AI responses
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  creators TEXT[] NOT NULL,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  message_content TEXT,
  message_type TEXT DEFAULT 'chat' CHECK (message_type IN ('chat', 'analysis')),
  synced_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_message_id ON public.feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_creators ON public.feedback USING GIN(creators);
CREATE INDEX IF NOT EXISTS idx_feedback_synced_at ON public.feedback(synced_at);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- RLS Policies
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
CREATE POLICY "Users can view own feedback"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create feedback" ON public.feedback;
CREATE POLICY "Users can create feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own feedback" ON public.feedback;
CREATE POLICY "Users can update own feedback"
  ON public.feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can read all (for sync script)
DROP POLICY IF EXISTS "Service can read all feedback" ON public.feedback;
CREATE POLICY "Service can read all feedback"
  ON public.feedback FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service can update feedback" ON public.feedback;
CREATE POLICY "Service can update feedback"
  ON public.feedback FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'service_role');
