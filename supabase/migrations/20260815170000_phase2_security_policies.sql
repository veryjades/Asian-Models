-- Phase 2 application-foundation access boundary.
-- Roles are read from trusted auth.app_metadata, never user_metadata.

create or replace function public.current_app_role()
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'viewer');
$$;

revoke all on function public.current_app_role() from public;
grant execute on function public.current_app_role() to authenticated;
grant usage on schema public to authenticated;

grant select, insert, update, delete on table
  public.models,
  public.portfolios,
  public.media_assets,
  public.clients,
  public.bookings
to authenticated;

create policy models_authenticated_select
on public.models
for select to authenticated
using (public.current_app_role() in ('viewer', 'editor', 'admin'));

create policy models_editor_insert
on public.models
for insert to authenticated
with check (public.current_app_role() in ('editor', 'admin'));

create policy models_editor_update
on public.models
for update to authenticated
using (public.current_app_role() in ('editor', 'admin'))
with check (public.current_app_role() in ('editor', 'admin'));

create policy models_admin_delete
on public.models
for delete to authenticated
using (public.current_app_role() = 'admin');

create policy portfolios_authenticated_select
on public.portfolios
for select to authenticated
using (public.current_app_role() in ('viewer', 'editor', 'admin'));

create policy portfolios_editor_insert
on public.portfolios
for insert to authenticated
with check (public.current_app_role() in ('editor', 'admin'));

create policy portfolios_editor_update
on public.portfolios
for update to authenticated
using (public.current_app_role() in ('editor', 'admin'))
with check (public.current_app_role() in ('editor', 'admin'));

create policy portfolios_admin_delete
on public.portfolios
for delete to authenticated
using (public.current_app_role() = 'admin');

create policy media_assets_authenticated_select
on public.media_assets
for select to authenticated
using (public.current_app_role() in ('viewer', 'editor', 'admin'));

create policy media_assets_editor_insert
on public.media_assets
for insert to authenticated
with check (public.current_app_role() in ('editor', 'admin'));

create policy media_assets_editor_update
on public.media_assets
for update to authenticated
using (public.current_app_role() in ('editor', 'admin'))
with check (public.current_app_role() in ('editor', 'admin'));

create policy media_assets_admin_delete
on public.media_assets
for delete to authenticated
using (public.current_app_role() = 'admin');

create policy clients_editor_select
on public.clients
for select to authenticated
using (public.current_app_role() in ('editor', 'admin'));

create policy clients_editor_insert
on public.clients
for insert to authenticated
with check (public.current_app_role() in ('editor', 'admin'));

create policy clients_editor_update
on public.clients
for update to authenticated
using (public.current_app_role() in ('editor', 'admin'))
with check (public.current_app_role() in ('editor', 'admin'));

create policy clients_admin_delete
on public.clients
for delete to authenticated
using (public.current_app_role() = 'admin');

create policy bookings_editor_select
on public.bookings
for select to authenticated
using (public.current_app_role() in ('editor', 'admin'));

create policy bookings_editor_insert
on public.bookings
for insert to authenticated
with check (public.current_app_role() in ('editor', 'admin'));

create policy bookings_editor_update
on public.bookings
for update to authenticated
using (public.current_app_role() in ('editor', 'admin'))
with check (public.current_app_role() in ('editor', 'admin'));

create policy bookings_admin_delete
on public.bookings
for delete to authenticated
using (public.current_app_role() = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'model-media',
  'model-media',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy model_media_authenticated_select
on storage.objects
for select to authenticated
using (
  bucket_id = 'model-media'
  and (storage.foldername(name))[1] in ('models', 'portfolios')
  and public.current_app_role() in ('viewer', 'editor', 'admin')
);

create policy model_media_editor_insert
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'model-media'
  and (storage.foldername(name))[1] in ('models', 'portfolios')
  and public.current_app_role() in ('editor', 'admin')
);

create policy model_media_editor_update
on storage.objects
for update to authenticated
using (
  bucket_id = 'model-media'
  and (storage.foldername(name))[1] in ('models', 'portfolios')
  and public.current_app_role() in ('editor', 'admin')
)
with check (
  bucket_id = 'model-media'
  and (storage.foldername(name))[1] in ('models', 'portfolios')
  and public.current_app_role() in ('editor', 'admin')
);

create policy model_media_admin_delete
on storage.objects
for delete to authenticated
using (
  bucket_id = 'model-media'
  and (storage.foldername(name))[1] in ('models', 'portfolios')
  and public.current_app_role() = 'admin'
);
