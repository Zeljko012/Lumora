-- Lumora: baza za automatski prijem porudžbina i listu kontakata (Supabase, besplatan plan).
-- Kako se koristi: Supabase → SQL Editor → New query → nalepi CEO ovaj fajl → Run.
-- Sigurno je pokrenuti više puta.

-- 1) Porudžbine sa sajta (upisuje ih server, aplikacija ih preuzima)
create table if not exists public.site_orders (
  id          uuid primary key default gen_random_uuid(),
  external_id text unique not null,           -- broj porudžbine, npr. LUM-20261021-AB12
  created_at  timestamptz not null default now(),
  payload     jsonb not null,                 -- kompletna porudžbina (kupac, stavke, iznosi)
  status      text not null default 'new',    -- new = čeka da je aplikacija preuzme, imported = preuzeta
  imported_at timestamptz
);
create index if not exists site_orders_status_idx on public.site_orders (status, created_at);

-- 2) Kontakti (kupci + prijave na obaveštenja)
create table if not exists public.contacts (
  id                uuid primary key default gen_random_uuid(),
  contact_key       text unique not null,     -- mejl (malim slovima) ili "tel:0641234567" kad nema mejla
  email             text,
  phone             text,
  name              text,
  city              text,
  sources           text[] not null default '{}',
  marketing_consent boolean not null default false,  -- true = pristao na obaveštenja o akcijama
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 3) Pretplate za obaveštenja na telefonu (Web Push) — opciono
create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  endpoint     text unique not null,
  subscription jsonb not null,
  created_at   timestamptz not null default now()
);

-- Zaštita: niko osim vlasnika ne sme da čita ni piše.
-- (Server sa tajnim ključem preskače ova pravila; sajt nikad ne sme da dobije taj ključ.)
alter table public.site_orders        enable row level security;
alter table public.contacts           enable row level security;
alter table public.push_subscriptions enable row level security;

drop policy if exists owner_all on public.site_orders;
create policy owner_all on public.site_orders
  for all to authenticated
  using      ((auth.jwt() ->> 'email') = 'homedecorlumora@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'homedecorlumora@gmail.com');

drop policy if exists owner_all on public.contacts;
create policy owner_all on public.contacts
  for all to authenticated
  using      ((auth.jwt() ->> 'email') = 'homedecorlumora@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'homedecorlumora@gmail.com');

drop policy if exists owner_all on public.push_subscriptions;
create policy owner_all on public.push_subscriptions
  for all to authenticated
  using      ((auth.jwt() ->> 'email') = 'homedecorlumora@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'homedecorlumora@gmail.com');

-- Uživo obaveštenje u aplikaciji kad stigne nova porudžbina
do $$
begin
  begin alter publication supabase_realtime add table public.site_orders; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.contacts;    exception when duplicate_object then null; end;
end $$;
