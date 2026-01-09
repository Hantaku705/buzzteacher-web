ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS creators TEXT[] DEFAULT ARRAY['doshirouto'];
