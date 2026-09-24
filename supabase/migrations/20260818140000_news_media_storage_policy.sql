-- Allow news images in the existing model-media bucket under `news/<news_post_id>/`.
-- Extends the Phase 2 Storage policies to accept the `news` folder prefix for editors/admins.

-- Select: authenticated with viewer/editor/admin can read news media
create policy news_media_authenticated_select
on storage.objects
for select to authenticated
using (
  bucket_id = 'model-media'
  and (storage.foldername(name))[1] = 'news'
  and public.current_app_role() in ('viewer', 'editor', 'admin')
);

-- Insert: editor/admin can upload news images
create policy news_media_editor_insert
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'model-media'
  and (storage.foldername(name))[1] = 'news'
  and public.current_app_role() in ('editor', 'admin')
);

-- Update: editor/admin can replace news images
create policy news_media_editor_update
on storage.objects
for update to authenticated
using (
  bucket_id = 'model-media'
  and (storage.foldername(name))[1] = 'news'
  and public.current_app_role() in ('editor', 'admin')
)
with check (
  bucket_id = 'model-media'
  and (storage.foldername(name))[1] = 'news'
  and public.current_app_role() in ('editor', 'admin')
);

-- Delete: admin only
create policy news_media_admin_delete
on storage.objects
for delete to authenticated
using (
  bucket_id = 'model-media'
  and (storage.foldername(name))[1] = 'news'
  and public.current_app_role() = 'admin'
);

-- Allow anonymous read of published news images (bucket is already public for model media)
create policy news_media_public_read
on storage.objects
for select to anon
using (
  bucket_id = 'model-media'
  and (storage.foldername(name))[1] = 'news'
);

-- Add body_blocks column to news_posts for block-based content
alter table public.news_posts
  add column if not exists body_blocks jsonb not null default '[]'::jsonb;

comment on column public.news_posts.body_blocks is
  'Block-based body content: array of {type:"text"|"image", content:string, caption?:string}';
