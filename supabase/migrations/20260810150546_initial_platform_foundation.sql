create extension if not exists pgcrypto with schema extensions;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.models (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_name text not null,
  gender text not null,
  category text not null,
  height smallint check (height is null or height between 1 and 300),
  measurements jsonb not null default '{}'::jsonb,
  bio text,
  nationality text,
  languages text[] not null default '{}'::text[],
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.models(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('model', 'portfolio')),
  owner_id uuid not null,
  file_url text not null,
  type text not null check (type in ('image', 'video', 'document')),
  sort_order integer not null default 0 check (sort_order >= 0),
  visibility text not null default 'private' check (visibility in ('public', 'private'))
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  model_id uuid not null references public.models(id) on delete restrict,
  event_type text not null,
  date date not null,
  location text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default timezone('utc', now())
);

create index portfolios_model_id_created_at_idx on public.portfolios (model_id, created_at desc);
create index media_assets_owner_sort_order_idx on public.media_assets (owner_type, owner_id, sort_order);
create index bookings_client_id_date_idx on public.bookings (client_id, date desc);
create index bookings_model_id_date_idx on public.bookings (model_id, date desc);

create trigger models_set_updated_at
before update on public.models
for each row
execute function public.set_updated_at();

alter table public.models enable row level security;
alter table public.portfolios enable row level security;
alter table public.media_assets enable row level security;
alter table public.clients enable row level security;
alter table public.bookings enable row level security;

revoke all on table public.models, public.portfolios, public.media_assets, public.clients, public.bookings from anon, authenticated;
