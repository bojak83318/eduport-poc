-- Users table (managed by Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  monthly_usage INTEGER DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Conversions audit log
CREATE TABLE public.conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  wordwall_url TEXT NOT NULL,
  wordwall_id TEXT,
  template_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'success', 'failed')),
  error_message TEXT,
  h5p_package_url TEXT,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversions"
  ON public.conversions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role can insert conversions"
  ON public.conversions FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_conversions_user ON public.conversions(user_id);
CREATE INDEX idx_conversions_status ON public.conversions(status);
CREATE INDEX idx_conversions_created ON public.conversions(created_at DESC);

-- Activity cache (24h TTL)
CREATE TABLE public.activity_cache (
  activity_id TEXT PRIMARY KEY,
  wordwall_url TEXT NOT NULL,
  template_type TEXT,
  payload JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_cache_expiry ON public.activity_cache(expires_at);

-- Auto-cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.activity_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Rate limiting
CREATE TABLE public.rate_limits (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  ip_address INET,
  requests_count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits"
  ON public.rate_limits FOR SELECT
  USING (auth.uid() = user_id);

-- Storage bucket for H5P packages
INSERT INTO storage.buckets (id, name, public)
VALUES ('h5p-packages', 'h5p-packages', false)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload H5P packages"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'h5p-packages' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view own H5P packages"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'h5p-packages' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Cleanup function for old H5P packages (30 days)
CREATE OR REPLACE FUNCTION cleanup_old_h5p_packages()
RETURNS void AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'h5p-packages'
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
