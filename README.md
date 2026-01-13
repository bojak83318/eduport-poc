# EduPort POC - Tracer Bullet Architecture

Vercel + Supabase serverless POC for Wordwall → H5P conversion.

## Architecture

```
User → Next.js Form → /api/convert → Wordwall Scraping → H5P Mapping → Supabase Storage → Download Link
```

## Quick Start

### 1. Supabase Setup

Run this SQL in your Supabase project:

```sql
create table conversions (
  id uuid default gen_random_uuid() primary key,
  wordwall_url text not null,
  download_url text,
  created_at timestamp with time zone default now()
);
```

Create a public storage bucket named `h5p-files`.

### 2. Environment Variables

Copy `env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

### 4. Deploy to Vercel

```bash
# Connect repo to Vercel
vercel
```

Add environment variables in Vercel dashboard under Settings → Environment Variables.

## Tech Stack

- **Frontend**: Next.js 16 + React + Tailwind CSS
- **API**: Next.js API Routes (serverless functions)
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Packaging**: adm-zip for H5P archive creation

## Limitations (POC)

- Only supports Wordwall Match-Up activities
- 10-second Vercel timeout (free tier)
- No authentication/rate limiting
- No asset downloading (images)

## Next: Production Migration

See `/docs/TDD_V1.0.md` for C# + Ryzen 9950X production architecture.
