-- Performance indexes for conversions table
CREATE INDEX IF NOT EXISTS idx_conversions_user_id 
ON conversions(user_id);

CREATE INDEX IF NOT EXISTS idx_conversions_created_at 
ON conversions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversions_status 
ON conversions(status);

CREATE INDEX IF NOT EXISTS idx_conversions_user_status 
ON conversions(user_id, status);

-- Composite index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_conversions_user_created 
ON conversions(user_id, created_at DESC);

-- Job queue indexes
CREATE INDEX IF NOT EXISTS idx_job_queue_status 
ON job_queue(status);

CREATE INDEX IF NOT EXISTS idx_job_queue_user_id 
ON job_queue(user_id);

CREATE INDEX IF NOT EXISTS idx_job_queue_created_at 
ON job_queue(created_at DESC);

-- API keys index
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id 
ON api_keys(user_id);

CREATE INDEX IF NOT EXISTS idx_api_keys_key 
ON api_keys(key);

-- Analyze tables after index creation
ANALYZE conversions;
ANALYZE job_queue;
ANALYZE api_keys;
