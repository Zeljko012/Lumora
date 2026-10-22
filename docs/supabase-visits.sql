-- Dodatak: statistika posete sajta (anonimna, bez kolačića i bez IP adresa) + "uživo na sajtu".
-- Nalepi ceo fajl u Supabase → SQL Editor → Run. Sigurno je pokrenuti više puta.

create table if not exists public.visitors (
  sid        text primary key,                    -- nasumična oznaka posete (samo dok je kartica otvorena)
  first_seen timestamptz not null default now(),
  last_seen  timestamptz not null default now(),
  last_path  text,
  landing    text,
  referrer   text,                                -- samo domen sa kog je stigao (npr. instagram.com)
  device     text,                                -- mobile | desktop
  pages      int not null default 0
);
create index if not exists visitors_first_seen_idx on public.visitors (first_seen);
create index if not exists visitors_last_seen_idx  on public.visitors (last_seen);

create table if not exists public.page_views (
  id   bigint generated always as identity primary key,
  at   timestamptz not null default now(),
  sid  text not null,
  path text
);
create index if not exists page_views_at_idx on public.page_views (at);

alter table public.visitors   enable row level security;
alter table public.page_views enable row level security;
drop policy if exists owner_read on public.visitors;
create policy owner_read on public.visitors for select to authenticated
  using ((auth.jwt() ->> 'email') = 'homedecorlumora@gmail.com');
drop policy if exists owner_read on public.page_views;
create policy owner_read on public.page_views for select to authenticated
  using ((auth.jwt() ->> 'email') = 'homedecorlumora@gmail.com');

-- Upis jedne posete (zove ga samo server sajta)
create or replace function public.track_hit(p_sid text, p_path text, p_ref text, p_device text, p_kind text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into visitors (sid, last_path, landing, referrer, device, pages)
  values (p_sid, p_path, p_path, p_ref, p_device, case when p_kind = 'pv' then 1 else 0 end)
  on conflict (sid) do update
    set last_seen = now(),
        last_path = excluded.last_path,
        pages     = visitors.pages + (case when p_kind = 'pv' then 1 else 0 end);
  if p_kind = 'pv' then
    insert into page_views (sid, path) values (p_sid, p_path);
  end if;
  -- povremeno čišćenje starijeg od 120 dana (da baza ostane mala)
  if random() < 0.01 then
    delete from page_views where at        < now() - interval '120 days';
    delete from visitors   where last_seen < now() - interval '120 days';
  end if;
end $$;
revoke all on function public.track_hit(text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.track_hit(text, text, text, text, text) to service_role;

-- Brojevi za aplikaciju (samo vlasnik)
create or replace function public.visit_stats(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r jsonb;
begin
  if (auth.jwt() ->> 'email') is distinct from 'homedecorlumora@gmail.com' then
    raise exception 'not allowed';
  end if;
  select jsonb_build_object(
    'visitors', (select count(distinct sid) from page_views where at >= p_from and at < p_to),
    'views',    (select count(*) from page_views where at >= p_from and at < p_to),
    'live',     (select count(*) from visitors where last_seen > now() - interval '2 minutes'),
    'live_paths', coalesce((select jsonb_agg(jsonb_build_object('path', last_path, 'n', n))
        from (select last_path, count(*) n from visitors where last_seen > now() - interval '2 minutes'
              group by 1 order by 2 desc limit 5) x), '[]'::jsonb),
    'top_pages', coalesce((select jsonb_agg(jsonb_build_object('path', path, 'n', n))
        from (select path, count(*) n from page_views where at >= p_from and at < p_to
              group by 1 order by 2 desc limit 8) x), '[]'::jsonb),
    'sources', coalesce((select jsonb_agg(jsonb_build_object('src', src, 'n', n))
        from (select coalesce(nullif(referrer, ''), 'direktno') src, count(*) n from visitors
              where first_seen >= p_from and first_seen < p_to group by 1 order by 2 desc limit 6) x), '[]'::jsonb),
    'mobile',  (select count(*) from visitors where first_seen >= p_from and first_seen < p_to and device = 'mobile'),
    'desktop', (select count(*) from visitors where first_seen >= p_from and first_seen < p_to and device = 'desktop')
  ) into r;
  return r;
end $$;
revoke all on function public.visit_stats(timestamptz, timestamptz) from public, anon;
grant execute on function public.visit_stats(timestamptz, timestamptz) to authenticated;
