-- Remove foreign key constraint from feedback.message_id
-- The message_id is now stored as TEXT to support local message IDs

-- Drop the existing foreign key constraint
ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS feedback_message_id_fkey;

-- Change message_id from UUID to TEXT
ALTER TABLE public.feedback ALTER COLUMN message_id TYPE TEXT USING message_id::TEXT;

-- Make message_id NOT NULL
ALTER TABLE public.feedback ALTER COLUMN message_id SET NOT NULL;
