-- D-015: expose only the published About singleton and its public columns.
-- Reversal: revoke the column grant, drop site_settings_public_read, then drop
-- about_published after the public route no longer depends on this boundary.

alter table public.site_settings
  add column if not exists about_published boolean not null default false;

update public.site_settings
set about_published = true
where id = 'global';

grant select (
  id,
  about_title_en,
  about_title_zh,
  about_body_en,
  about_body_zh,
  offices
) on public.site_settings to anon;

grant select, insert, update, delete on table public.site_settings to authenticated;

drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read
on public.site_settings
for select
to anon
using (id = 'global' and about_published);

notify pgrst, 'reload schema';
