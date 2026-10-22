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

-- 4) Sinhronizacija svih podataka između uređaja (porudžbine, troškovi, katalog, kontakti, podešavanja)
create table if not exists public.sync_docs (
  kind       text   not null,                  -- orders | expenses | products | contacts | settings
  id         text   not null,
  data       jsonb  not null,
  updated_at bigint not null,                  -- vreme poslednje izmene (ms) — pobeđuje novija
  server_ts  timestamptz not null default clock_timestamp(),
  primary key (kind, id)
);
create index if not exists sync_docs_server_ts_idx on public.sync_docs (server_ts);

-- Starija verzija nikad ne pregazi noviju; svaka prihvaćena izmena dobija novo serversko vreme (po njemu uređaji povlače)
create or replace function public.sync_docs_guard() returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' then
    if new.updated_at <= old.updated_at then
      return null;
    end if;
  end if;
  new.server_ts := clock_timestamp();
  return new;
end $$;
drop trigger if exists sync_docs_guard on public.sync_docs;
create trigger sync_docs_guard before insert or update on public.sync_docs
  for each row execute function public.sync_docs_guard();

alter table public.sync_docs enable row level security;
drop policy if exists owner_all on public.sync_docs;
create policy owner_all on public.sync_docs
  for all to authenticated
  using      ((auth.jwt() ->> 'email') = 'homedecorlumora@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'homedecorlumora@gmail.com');

do $$
begin
  begin alter publication supabase_realtime add table public.sync_docs; exception when duplicate_object then null; end;
end $$;

-- 5) Zajednički brojač porudžbina: #1000, #1001… (koriste ga i sajt i aplikacija, pa se brojevi ne sudaraju)
create sequence if not exists public.order_number_seq start with 1000 minvalue 1000;

create or replace function public.next_order_number() returns bigint
language sql security definer set search_path = public as $$
  select nextval('public.order_number_seq')
$$;
revoke all on function public.next_order_number() from public, anon;
grant execute on function public.next_order_number() to authenticated, service_role;
