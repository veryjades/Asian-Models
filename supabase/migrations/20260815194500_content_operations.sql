-- Phase 2 content control plane, public enquiries and notification outbox.
-- The browser only receives the publishable key; all admin writes remain protected by app_metadata roles.

create schema if not exists private;

grant execute on function public.current_app_role() to anon;

create policy models_public_active_read
on public.models
for select to anon, authenticated
using (status = 'active' or public.current_app_role() in ('editor', 'admin', 'viewer'));

grant select on table public.media_assets to anon, authenticated;
create policy media_assets_public_read
on public.media_assets
for select to anon, authenticated
using (visibility = 'public' or public.current_app_role() in ('editor', 'admin', 'viewer'));

update storage.buckets set public = true where id = 'model-media';

create table if not exists public.site_settings (
  id text primary key default 'global',
  admin_email text not null default 'menscheck@gmail.com',
  about_title_en text not null default 'About',
  about_title_zh text not null default '關於我們',
  about_body_en text[] not null default '{}',
  about_body_zh text[] not null default '{}',
  offices jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  date date not null default current_date,
  title_en text not null,
  title_zh text not null,
  excerpt_en text not null default '',
  excerpt_zh text not null default '',
  body_en text[] not null default '{}',
  body_zh text[] not null default '{}',
  cover_url text,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  published_at timestamptz
);

create table if not exists public.assistant_knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_zh text not null,
  content_en text not null,
  content_zh text not null,
  source_type text not null default 'manual',
  source_url text,
  tags text[] not null default '{}',
  published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'contact' check (kind in ('contact', 'booking')),
  enquiry_type text not null default 'other',
  name text not null,
  company text,
  email text not null,
  phone text,
  subject text,
  budget text,
  message text not null,
  details jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'in_progress', 'replied', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.scout_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age smallint check (age is null or age between 13 and 100),
  city text not null,
  email text not null,
  phone text,
  height text,
  measurements text,
  instagram text,
  social_links text,
  message text,
  attachments jsonb not null default '[]'::jsonb,
  status text not null default 'new' check (status in ('new', 'reviewing', 'shortlisted', 'rejected', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('inquiry', 'application')),
  reference_id uuid not null,
  recipient_email text not null,
  subject text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  error text,
  created_at timestamptz not null default timezone('utc', now()),
  sent_at timestamptz
);

insert into public.site_settings (id, admin_email)
values ('global', 'menscheck@gmail.com')
on conflict (id) do nothing;

insert into public.news_posts (slug, date, title_en, title_zh, excerpt_en, excerpt_zh, body_en, body_zh, tags, status, published_at)
values
  ('spring-board-update', '2026-07-14', 'Spring board update', '春季分類更新',
   'Four new signings join the Women and New Faces boards ahead of the Taipei season.', '台北時裝季前夕，四位新簽約模特兒加入女模與新面孔分類。',
   array['Ahead of the Taipei season we have added four new faces across the Women and New Faces boards.'], array['在台北時裝季開始之前，我們於女模與新面孔分類新增四位面孔。'],
   array['women','new-faces','taipei','fashion-model','scouting','runway'], 'published', timezone('utc', now())),
  ('tokyo-showroom', '2026-06-02', 'Tokyo showroom, June', '六月東京展間',
   'A three-day showroom in Shibuya for casting directors and stylists working the autumn calendar.', '於澀谷舉辦為期三天的展間，面向秋季檔期的選角與造型團隊。',
   array['We hosted a three-day showroom in Shibuya for casting directors and stylists preparing the autumn calendar.'], array['我們於澀谷舉辦三天展間，接待籌備秋季檔期的選角與造型團隊。'],
   array['tokyo','editorial-model','fashion-model','commercial-model','runway'], 'published', timezone('utc', now())),
  ('on-scouting-in-asia', '2026-04-21', 'On scouting in Asia', '關於亞洲的星探工作',
   'Why we look outside the capitals, and what we actually want to see in an application.', '為什麼我們走出首都城市，以及一份申請中我們真正想看到的東西。',
   array['What we want in an application is simple: daylight, no retouching, no filter, and a plain background.'], array['我們希望在申請中看到的很簡單：日光、不修圖、不加濾鏡、素色背景。'],
   array['scouting','asia','new-faces','natural-test','beauty','print-model'], 'published', timezone('utc', now()))
on conflict (slug) do nothing;

create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create trigger news_posts_set_updated_at
before update on public.news_posts
for each row execute function public.set_updated_at();

create trigger assistant_knowledge_set_updated_at
before update on public.assistant_knowledge_documents
for each row execute function public.set_updated_at();

create trigger inquiries_set_updated_at
before update on public.inquiries
for each row execute function public.set_updated_at();

create trigger scout_applications_set_updated_at
before update on public.scout_applications
for each row execute function public.set_updated_at();

create or replace function private.enqueue_admin_notification()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  recipient text;
  notification_subject text;
  notification_kind text;
begin
  select admin_email into recipient from public.site_settings where id = 'global';
  recipient := coalesce(nullif(trim(recipient), ''), 'menscheck@gmail.com');
  notification_kind := case when tg_table_name = 'scout_applications' then 'application' else 'inquiry' end;
  notification_subject := case
    when notification_kind = 'application' then 'New model application: ' || new.name
    else 'New client enquiry: ' || new.name
  end;
  insert into public.admin_notifications (kind, reference_id, recipient_email, subject)
  values (notification_kind, new.id, recipient, notification_subject);
  return new;
end;
$$;

revoke all on function private.enqueue_admin_notification() from public;

create trigger inquiries_enqueue_notification
after insert on public.inquiries
for each row execute function private.enqueue_admin_notification();

create trigger applications_enqueue_notification
after insert on public.scout_applications
for each row execute function private.enqueue_admin_notification();

create index if not exists news_posts_status_date_idx on public.news_posts (status, date desc);
create index if not exists inquiries_status_created_at_idx on public.inquiries (status, created_at desc);
create index if not exists scout_applications_status_created_at_idx on public.scout_applications (status, created_at desc);
create index if not exists admin_notifications_status_created_at_idx on public.admin_notifications (status, created_at desc);

alter table public.site_settings enable row level security;
alter table public.news_posts enable row level security;
alter table public.assistant_knowledge_documents enable row level security;
alter table public.inquiries enable row level security;
alter table public.scout_applications enable row level security;
alter table public.admin_notifications enable row level security;

revoke all on table public.site_settings, public.news_posts, public.assistant_knowledge_documents,
  public.inquiries, public.scout_applications, public.admin_notifications from anon, authenticated;

grant select on table public.news_posts to anon, authenticated;
create policy news_public_read on public.news_posts for select to anon, authenticated
using (status = 'published' or public.current_app_role() in ('editor', 'admin'));

grant select on table public.assistant_knowledge_documents to anon, authenticated;
create policy assistant_knowledge_public_read on public.assistant_knowledge_documents
for select to anon, authenticated using (published or public.current_app_role() in ('editor', 'admin'));

grant select, insert, update, delete on table public.site_settings to authenticated;
create policy site_settings_editor_read on public.site_settings for select to authenticated
using (public.current_app_role() in ('editor', 'admin'));
create policy site_settings_editor_write on public.site_settings for all to authenticated
using (public.current_app_role() in ('editor', 'admin'))
with check (public.current_app_role() in ('editor', 'admin'));

grant insert, select, update, delete on table public.news_posts to authenticated;
create policy news_editor_write on public.news_posts for insert to authenticated
with check (public.current_app_role() in ('editor', 'admin'));
create policy news_editor_update on public.news_posts for update to authenticated
using (public.current_app_role() in ('editor', 'admin'))
with check (public.current_app_role() in ('editor', 'admin'));
create policy news_admin_delete on public.news_posts for delete to authenticated
using (public.current_app_role() = 'admin');

grant insert, update, delete on table public.assistant_knowledge_documents to authenticated;
create policy assistant_knowledge_editor_write on public.assistant_knowledge_documents for insert to authenticated
with check (public.current_app_role() in ('editor', 'admin'));
create policy assistant_knowledge_editor_update on public.assistant_knowledge_documents for update to authenticated
using (public.current_app_role() in ('editor', 'admin'))
with check (public.current_app_role() in ('editor', 'admin'));
create policy assistant_knowledge_admin_delete on public.assistant_knowledge_documents for delete to authenticated
using (public.current_app_role() = 'admin');

grant insert on table public.inquiries, public.scout_applications to anon, authenticated;
grant select, update, delete on table public.inquiries, public.scout_applications to authenticated;
create policy inquiries_public_insert on public.inquiries for insert to anon, authenticated
with check (length(trim(name)) between 1 and 200 and length(trim(email)) between 3 and 320 and length(trim(message)) between 1 and 5000);
create policy applications_public_insert on public.scout_applications for insert to anon, authenticated
with check (length(trim(name)) between 1 and 200 and length(trim(email)) between 3 and 320 and length(trim(city)) between 1 and 200);
create policy inquiries_editor_read on public.inquiries for select to authenticated
using (public.current_app_role() in ('editor', 'admin'));
create policy applications_editor_read on public.scout_applications for select to authenticated
using (public.current_app_role() in ('editor', 'admin'));
create policy inquiries_editor_update on public.inquiries for update to authenticated
using (public.current_app_role() in ('editor', 'admin')) with check (public.current_app_role() in ('editor', 'admin'));
create policy applications_editor_update on public.scout_applications for update to authenticated
using (public.current_app_role() in ('editor', 'admin')) with check (public.current_app_role() in ('editor', 'admin'));
create policy inquiries_admin_delete on public.inquiries for delete to authenticated using (public.current_app_role() = 'admin');
create policy applications_admin_delete on public.scout_applications for delete to authenticated using (public.current_app_role() = 'admin');

grant select, update on table public.admin_notifications to authenticated;
create policy notifications_editor_read on public.admin_notifications for select to authenticated
using (public.current_app_role() in ('editor', 'admin'));
create policy notifications_editor_update on public.admin_notifications for update to authenticated
using (public.current_app_role() in ('editor', 'admin'))
with check (public.current_app_role() in ('editor', 'admin'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('scout-submissions', 'scout-submissions', false, 20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy scout_submission_anon_insert on storage.objects for insert to anon, authenticated
with check (bucket_id = 'scout-submissions' and (storage.foldername(name))[1] = 'applications');
create policy scout_submission_editor_read on storage.objects for select to authenticated
using (bucket_id = 'scout-submissions' and public.current_app_role() in ('editor', 'admin'));
