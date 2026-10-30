-- Briše probne porudžbine sa brojem 1004 i većim i vraća brojač tako da sledeća porudžbina dobije #1004.
-- Porudžbine #1000–#1003 se NE diraju. Ako želiš drugi broj, zameni 1004 (na 3 mesta) i 1003 (jedno mesto, uvek za 1 manje).
-- Supabase → SQL Editor → New query → nalepi → Run.

delete from public.site_orders
where (payload ->> 'number')::int >= 1004;

delete from public.sync_docs
where kind = 'orders' and (data ->> 'number')::int >= 1004;

-- sledeći broj iz brojača je 1004
select setval('public.order_number_seq', 1003);
