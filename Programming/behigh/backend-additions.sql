-- ============================================
-- BACKEND ADDITIONS - Post Analytics, Content Moderation
-- ============================================
-- Run this in Supabase SQL Editor after main schema

-- ============================================
-- POST ANALYTICS (Views Tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS public.post_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON public.post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON public.post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON public.post_views(viewed_at);

ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own views" ON public.post_views 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own views" ON public.post_views 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view view counts for posts they can see (friends' posts)
CREATE POLICY "Users can view counts for visible posts" ON public.post_views 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_views.post_id
      AND (
        posts.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.friendships
          WHERE (user_id = auth.uid() AND friend_id = posts.user_id AND status = 'accepted')
          OR (friend_id = auth.uid() AND user_id = posts.user_id AND status = 'accepted')
        )
      )
    )
  );

-- ============================================
-- CONTENT MODERATION (Reports)
-- ============================================

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES public.users ON DELETE CASCADE,
  reported_post_id UUID REFERENCES public.posts ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.users ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (
    (reported_user_id IS NOT NULL) OR (reported_post_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON public.reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_post_id ON public.reports(reported_post_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create reports" ON public.reports 
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON public.reports 
  FOR SELECT USING (auth.uid() = reporter_id);

-- Admins can view all reports (you'll need to add admin role check)
-- For now, allow users to see reports they created
-- You can add admin role later

-- ============================================
-- ERROR LOGGING (Optional - for Sentry integration)
-- ============================================

CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  context JSONB,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON public.error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON public.error_logs(resolved);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own errors
CREATE POLICY "Users can view own errors" ON public.error_logs 
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- System can insert errors (via service role)
-- This would be done via Edge Function with service role key

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Backend additions (analytics, moderation, errors) created successfully!';
END $$;

