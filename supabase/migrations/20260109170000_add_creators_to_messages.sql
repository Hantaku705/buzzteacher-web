-- Add creators column to messages table
-- This stores which creators were used to analyze each AI response

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS creators TEXT[] DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.messages.creators IS 'Array of creator IDs that analyzed this message';
