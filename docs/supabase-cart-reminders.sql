-- Podsetnici za napuštenu korpu: pamti koje su zakazane mejlove (Resend) dobili kupci koji su upisali mejl na kasi,
-- da bi se otkazali čim kupac završi porudžbinu.
-- Supabase → SQL Editor → New query → nalepi → Run. (Jednom.)

create table if not exists public.cart_reminders (
  cart_id    text primary key,
  email      text not null,
  resend_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists cart_reminders_email_idx on public.cart_reminders (lower(email));

-- Bez pravila: tabeli pristupa samo server (tajni ključ), nikad pregledač.
alter table public.cart_reminders enable row level security;

-- Stari zapisi (starije od 3 dana) više ne trebaju; briši ručno ili povremeno:
-- delete from public.cart_reminders where created_at < now() - interval '3 days';
