-- BuzzTeacher Database Schema
-- Run this in Supabase SQL Editor

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  creators TEXT[] DEFAULT ARRAY['doshirouto'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration: Add creators column to existing table
-- Run this if table already exists:
-- ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS creators TEXT[] DEFAULT ARRAY['doshirouto'];

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  creators TEXT[] DEFAULT NULL,
  video_list JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration: Add creators column to existing table
-- Run this if table already exists:
-- ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS creators TEXT[] DEFAULT NULL;

-- Migration: Add video_list column to existing table
-- Run this if table already exists:
-- ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS video_list JSONB DEFAULT NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for conversations
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own conversations" ON public.conversations;
CREATE POLICY "Users can create own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own conversations" ON public.conversations;
CREATE POLICY "Users can delete own conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for messages
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.messages;
CREATE POLICY "Users can view messages in own conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create messages in own conversations" ON public.messages;
CREATE POLICY "Users can create messages in own conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
