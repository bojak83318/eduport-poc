-- Enable RLS
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Policies for conversions
DROP POLICY IF EXISTS "Users can only see their own conversions" ON public.conversions;
CREATE POLICY "Users can only see their own conversions" 
ON public.conversions FOR ALL 
USING (auth.uid() = user_id);

-- Policies for job_queue
DROP POLICY IF EXISTS "Users can only see their own jobs" ON public.job_queue;
CREATE POLICY "Users can only see their own jobs" 
ON public.job_queue FOR ALL 
USING (auth.uid() = user_id);

-- Policies for api_keys
DROP POLICY IF EXISTS "Users can only see their own api keys" ON public.api_keys;
CREATE POLICY "Users can only see their own api keys" 
ON public.api_keys FOR ALL 
USING (auth.uid() = user_id);
