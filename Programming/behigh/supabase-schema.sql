-- ============================================
-- BEHIGH APP - COMPLETE SUPABASE DATABASE SCHEMA
-- ============================================
-- Run this entire file in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  profile_picture_url TEXT,
  push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  front_camera_url TEXT NOT NULL,
  back_camera_url TEXT NOT NULL,
  posted_late BOOLEAN DEFAULT false,
  moment_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reactions table
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  duration TEXT NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily moments table (tracks notification times)
CREATE TABLE IF NOT EXISTS public.daily_moments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  notification_time TIMESTAMPTZ NOT NULL
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at);
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON public.reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver ON public.chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_moments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON public.users 
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Posts policies
CREATE POLICY "Users can view friends' posts" ON public.posts 
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE (user_id = auth.uid() AND friend_id = public.posts.user_id AND status = 'accepted')
      OR (friend_id = auth.uid() AND user_id = public.posts.user_id AND status = 'accepted')
    )
  );

CREATE POLICY "Users can insert own posts" ON public.posts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.posts 
  FOR DELETE USING (auth.uid() = user_id);

-- Reactions policies
CREATE POLICY "Users can view reactions on visible posts" ON public.reactions 
  FOR SELECT USING (true);

CREATE POLICY "Users can add reactions" ON public.reactions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions" ON public.reactions 
  FOR DELETE USING (auth.uid() = user_id);

-- Friendships policies
CREATE POLICY "Users can view own friendships" ON public.friendships 
  FOR SELECT USING (
    user_id = auth.uid() OR friend_id = auth.uid()
  );

CREATE POLICY "Users can create friendships" ON public.friendships 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships they're part of" ON public.friendships 
  FOR UPDATE USING (
    user_id = auth.uid() OR friend_id = auth.uid()
  );

CREATE POLICY "Users can delete friendships they're part of" ON public.friendships 
  FOR DELETE USING (
    user_id = auth.uid() OR friend_id = auth.uid()
  );

-- Chat messages policies
CREATE POLICY "Users can view their messages" ON public.chat_messages 
  FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );

CREATE POLICY "Users can send messages" ON public.chat_messages 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received messages" ON public.chat_messages 
  FOR UPDATE USING (receiver_id = auth.uid());

CREATE POLICY "Users can delete own messages" ON public.chat_messages 
  FOR DELETE USING (sender_id = auth.uid());

-- Journal entries policies
CREATE POLICY "Users can view own journal entries" ON public.journal_entries 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own journal entries" ON public.journal_entries 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON public.journal_entries 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON public.journal_entries 
  FOR DELETE USING (auth.uid() = user_id);

-- Daily moments policies (admin only - can be managed via functions)
CREATE POLICY "Anyone can view daily moments" ON public.daily_moments 
  FOR SELECT USING (true);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Create these in: Dashboard → Storage → New Bucket
-- 
-- Bucket names:
-- 1. "posts" - for post photos (public)
-- 2. "reactions" - for reaction selfies (public)
-- 3. "profiles" - for profile pictures (public)
-- 4. "journal" - for voice recordings (private)
-- 
-- All buckets should be set to public except "journal"

-- ============================================
-- FUNCTIONS (Optional - for advanced features)
-- ============================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ BeHigh database schema created successfully!';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '   1. Create storage buckets in Dashboard → Storage';
  RAISE NOTICE '   2. Update your app with Supabase credentials';
  RAISE NOTICE '   3. Test authentication and data flow';
END $$;

