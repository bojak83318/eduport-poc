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
