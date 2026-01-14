-- Dashboard query (should use idx_conversions_user_created)
EXPLAIN ANALYZE
SELECT * FROM conversions
WHERE user_id = 'test-user-id'
ORDER BY created_at DESC
LIMIT 10;

-- Status filter query (should use idx_conversions_user_status)
EXPLAIN ANALYZE
SELECT * FROM conversions
WHERE user_id = 'test-user-id'
  AND status = 'success'
ORDER BY created_at DESC
LIMIT 10;

-- Job queue polling (should use idx_job_queue_status)
EXPLAIN ANALYZE
SELECT * FROM job_queue
WHERE status = 'queued'
ORDER BY created_at ASC
LIMIT 5;

-- Monthly count for quota (no index needed, small dataset)
EXPLAIN ANALYZE
SELECT COUNT(*) FROM conversions
WHERE user_id = 'test-user-id'
  AND created_at >= date_trunc('month', CURRENT_DATE);
