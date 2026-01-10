-- Add video_list column to messages table for storing account analysis video data
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS video_list JSONB DEFAULT NULL;
