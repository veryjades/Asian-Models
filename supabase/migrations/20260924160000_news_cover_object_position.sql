-- Per-post news cover focal point (object-position). Slot geometry stays 3:2 cover (D-031).
alter table public.news_posts
  add column if not exists cover_object_position text not null default '50% 50%';

comment on column public.news_posts.cover_object_position is
  'CSS object-position for the cover crop, e.g. 50% 20%. Default center.';
