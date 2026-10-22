-- Dodatak: brojač porudžbina od #1000. Nalepi ceo fajl u Supabase → SQL Editor → Run. Sigurno je pokrenuti više puta.

-- 5) Zajednički brojač porudžbina: #1000, #1001… (koriste ga i sajt i aplikacija, pa se brojevi ne sudaraju)
create sequence if not exists public.order_number_seq start with 1000 minvalue 1000;

create or replace function public.next_order_number() returns bigint
language sql security definer set search_path = public as $$
  select nextval('public.order_number_seq')
$$;
revoke all on function public.next_order_number() from public, anon;
grant execute on function public.next_order_number() to authenticated, service_role;
