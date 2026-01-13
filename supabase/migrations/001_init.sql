-- EduPort POC: Conversions Audit Log Table
create table if not exists conversions (
  id uuid default gen_random_uuid() primary key,
  wordwall_url text not null,
  download_url text,
  created_at timestamp with time zone default now()
);

-- Create storage bucket policy for h5p-files (public access)
insert into storage.buckets (id, name, public)
values ('h5p-files', 'h5p-files', true)
on conflict (id) do nothing;

-- Allow public access to h5p-files bucket
create policy "Public Access"
on storage.objects for select
using (bucket_id = 'h5p-files');

create policy "Service role upload"
on storage.objects for insert
with check (bucket_id = 'h5p-files');
