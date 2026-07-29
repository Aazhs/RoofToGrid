-- RoofToGrid — one-time Supabase setup.
-- Run in the Supabase SQL editor after creating the project, before the first API deploy.
--
-- The database schema itself is owned by Prisma migrations (backend/prisma/migrations), so this file
-- only sets up object storage and a couple of operational conveniences.

-- ---------------------------------------------------------------- storage
-- Private bucket for the document vault (NFR-S9, AC-E4).
-- `public = false` is the important part: every read is mediated by the API's ownership check and a
-- short-lived signed URL.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'rooftogrid-documents',
  'rooftogrid-documents',
  false,
  10485760, -- 10 MB, matches MAX_UPLOAD_MB
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- No RLS policies are added for anon/authenticated roles on purpose: the API talks to storage with the
-- service-role key, and browsers never touch the bucket directly. Adding a public read policy here would
-- defeat AC-E4.

-- ---------------------------------------------------------------- housekeeping
-- Optional: expired refresh tokens are harmless but pile up. Schedule this with pg_cron if enabled.
-- select cron.schedule(
--   'rooftogrid-prune-refresh-tokens',
--   '0 3 * * *',
--   $$delete from refresh_tokens where "expiresAt" < now() - interval '30 days'$$
-- );
