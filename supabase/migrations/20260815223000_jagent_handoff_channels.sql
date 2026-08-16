-- D-020: public specialist deep-link URLs on the About singleton.
-- Reversal: revoke the extra column grant, then drop messenger_url and line_oa_url.

alter table public.site_settings
  add column if not exists messenger_url text,
  add column if not exists line_oa_url text;

grant select (
  id,
  about_title_en,
  about_title_zh,
  about_body_en,
  about_body_zh,
  offices,
  messenger_url,
  line_oa_url
) on public.site_settings to anon;

grant select, insert, update, delete on table public.site_settings to authenticated;

notify pgrst, 'reload schema';
