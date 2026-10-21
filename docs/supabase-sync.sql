-- Dodatak: sinhronizacija između uređaja. Nalepi ceo fajl u Supabase → SQL Editor → Run.
-- Sigurno je pokrenuti više puta.

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
