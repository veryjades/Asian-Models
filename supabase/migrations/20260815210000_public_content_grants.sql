-- Public content reads are intentionally limited to published/active records.
-- The application uses the publishable browser key on public routes, so grants
-- and RLS policies must exist together; a policy without a table grant still
-- produces a 42501 permission error and makes the repository fall back to seed.

grant select on table public.models to anon, authenticated;
drop policy if exists models_public_active_read on public.models;
drop policy if exists models_authenticated_read on public.models;
create policy models_public_active_read
on public.models
for select
to anon
using (status = 'active');
create policy models_authenticated_read
on public.models
for select
to authenticated
using (status = 'active' or public.current_app_role() in ('editor', 'admin', 'viewer'));

grant select on table public.model_video_links, public.model_social_links to anon, authenticated;

drop policy if exists model_video_links_public_select on public.model_video_links;
create policy model_video_links_public_select
on public.model_video_links
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.models
    where public.models.id = model_video_links.model_id
      and public.models.status = 'active'
  )
);

drop policy if exists model_social_links_public_select on public.model_social_links;
create policy model_social_links_public_select
on public.model_social_links
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.models
    where public.models.id = model_social_links.model_id
      and public.models.status = 'active'
  )
);

comment on table public.models is
  'Active model profiles are public-readable; editor/admin/viewer roles can also read inactive records.';

grant select on table public.media_assets to anon, authenticated;
drop policy if exists media_assets_public_read on public.media_assets;
drop policy if exists media_assets_public_read_anon on public.media_assets;
drop policy if exists media_assets_authenticated_read on public.media_assets;
create policy media_assets_public_read_anon
on public.media_assets
for select
to anon
using (visibility = 'public');
create policy media_assets_authenticated_read
on public.media_assets
for select
to authenticated
using (visibility = 'public' or public.current_app_role() in ('editor', 'admin', 'viewer'));

update storage.buckets set public = true where id = 'model-media';

comment on table public.media_assets is
  'Published model media uses the public model-media bucket; visibility controls public row exposure.';
