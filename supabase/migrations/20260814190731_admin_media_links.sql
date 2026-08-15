-- Admin media-manager extensions: unlimited model media, YouTube links, and
-- external social links. Public routes remain cloud-agnostic until Phase 3;
-- these tables use the same authenticated Admin/Editor/Viewer boundary.

create table public.model_video_links (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.models(id) on delete cascade,
  title text not null,
  youtube_url text not null check (
    youtube_url like 'https://youtube.com/%'
    or youtube_url like 'https://www.youtube.com/%'
    or youtube_url like 'https://youtu.be/%'
    or youtube_url like 'https://www.youtu.be/%'
  ),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.model_social_links (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.models(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'tiktok', 'youtube', 'facebook', 'x', 'website', 'other')),
  label text not null,
  url text not null check (url like 'https://%'),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index model_video_links_model_sort_idx
  on public.model_video_links (model_id, sort_order);
create index model_social_links_model_sort_idx
  on public.model_social_links (model_id, sort_order);

alter table public.model_video_links enable row level security;
alter table public.model_social_links enable row level security;

grant select, insert, update, delete on table
  public.model_video_links,
  public.model_social_links
to authenticated;

create policy model_video_links_authenticated_select
on public.model_video_links
for select to authenticated
using (public.current_app_role() in ('viewer', 'editor', 'admin'));

create policy model_video_links_editor_insert
on public.model_video_links
for insert to authenticated
with check (public.current_app_role() in ('editor', 'admin'));

create policy model_video_links_editor_update
on public.model_video_links
for update to authenticated
using (public.current_app_role() in ('editor', 'admin'))
with check (public.current_app_role() in ('editor', 'admin'));

create policy model_video_links_admin_delete
on public.model_video_links
for delete to authenticated
using (public.current_app_role() = 'admin');

create policy model_social_links_authenticated_select
on public.model_social_links
for select to authenticated
using (public.current_app_role() in ('viewer', 'editor', 'admin'));

create policy model_social_links_editor_insert
on public.model_social_links
for insert to authenticated
with check (public.current_app_role() in ('editor', 'admin'));

create policy model_social_links_editor_update
on public.model_social_links
for update to authenticated
using (public.current_app_role() in ('editor', 'admin'))
with check (public.current_app_role() in ('editor', 'admin'));

create policy model_social_links_admin_delete
on public.model_social_links
for delete to authenticated
using (public.current_app_role() = 'admin');
