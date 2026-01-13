# EduPort POC - Quick Deployment Guide

## ✅ Step 1: Environment Configuration (DONE)
`.env.local` has been created with qalamcolab Supabase credentials.

## 📝 Step 2: Run SQL Migration

Since `psql` is not installed, run this SQL in **Supabase Dashboard → SQL Editor**:

```sql
-- Create conversions table
create table if not exists conversions (
  id uuid default gen_random_uuid() primary key,
  wordwall_url text not null,
  download_url text,
  created_at timestamp with time zone default now()
);

-- Create storage bucket (or via UI: Storage → Create Bucket)
insert into storage.buckets (id, name, public)
values ('h5p-files', 'h5p-files', true)
on conflict (id) do nothing;

-- Allow public reads
create policy "Public Access"
on storage.objects for select
using (bucket_id = 'h5p-files');

-- Allow service role uploads
create policy "Service role upload"
on storage.objects for insert
with check (bucket_id = 'h5p-files');
```

**Alternative:** Create bucket via UI at: https://supabase.com/dashboard/project/stnfuetmrzxuyjtwfyoh/storage/buckets

## 🚀 Step 3: Deploy to Vercel

```bash
# Install Vercel CLI locally (npx avoids permission issues)
npx vercel login

# Deploy (will prompt for project settings)
npx vercel

# Set environment variables for production
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy to production
npx vercel --prod
```

**Values to paste when prompted:**
- `NEXT_PUBLIC_SUPABASE_URL`: `https://stnfuetmrzxuyjtwfyoh.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: (from .env.local)

## 🧪 Step 4: Test Locally First

```bash
npm run dev
# Visit http://localhost:3000
# Paste a Wordwall URL to test
```

## 📦 What's Already Set Up
- ✅ GitHub repo created: https://github.com/bojak83318/eduport-poc
- ✅ .env.local configured with Supabase credentials
- ✅ SQL migration file created: `supabase/migrations/001_init.sql`
