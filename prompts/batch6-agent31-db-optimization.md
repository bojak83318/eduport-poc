# Agent 31: DevOps Engineer - Database Optimization

**Agent Role:** @eduport/devops-engineer  
**Task ID:** DEVOPS-004  
**Batch:** 6  
**Priority:** Medium  
**Deadline:** Jan 14, 11:30 PM

---

## Context

Database performance is critical for handling production load. We need to add indexes, optimize queries, and configure connection pooling.

---

## Task

Optimize database queries and add performance indexes.

---

## Implementation

### 1. Create Migration for Indexes

**File:** `/supabase/migrations/20260114_performance_indexes.sql`

```sql
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
```

### 2. Run EXPLAIN ANALYZE

Create a script to verify index usage:

**File:** `/scripts/check-query-performance.sql`

```sql
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
```

### 3. Configure Connection Pooling (Supavisor)

Document the configuration steps:

**File:** `/docs/database-setup.md`

```markdown
# Database Performance Configuration

## Connection Pooling

Supabase uses Supavisor for connection pooling. The connection string format:

### Transaction Mode (Recommended for API routes)
```
postgresql://postgres.[project-ref]:[password]@[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Session Mode (For migrations and long-running queries)
```
postgresql://postgres.[project-ref]:[password]@[region].pooler.supabase.com:5432/postgres
```

## Environment Variables

```bash
# Use pooler URL for API routes
DATABASE_URL="postgresql://...@pooler.supabase.com:6543/postgres?pgbouncer=true"

# Use direct URL for migrations
DIRECT_URL="postgresql://...@db.[ref].supabase.co:5432/postgres"
```

## Prisma Configuration

```prisma
datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")
  directUrl         = env("DIRECT_URL")
}
```
```

### 4. Add Query Caching Headers

**Update:** Prisma client initialization

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

---

## Acceptance Criteria

1. ✅ Migration created at `/supabase/migrations/20260114_performance_indexes.sql`
2. ✅ Migration runs successfully: `supabase db push`
3. ✅ EXPLAIN ANALYZE shows index usage (no Seq Scan on indexed columns)
4. ✅ Connection pooling documented
5. ✅ Query performance improved ≥50%

---

## Verification

```bash
# Apply migration
cd /home/kasm-user/workspace/dspy/eduport-poc
npx supabase db push

# Verify indexes created
psql $DATABASE_URL -c "\di+ conversions*"

# Run performance check
psql $DATABASE_URL -f scripts/check-query-performance.sql
```

---

## Deadline

**Jan 14, 11:30 PM**
