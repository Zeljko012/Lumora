-- PAŽNJA: briše SVE porudžbine u bazi (probne) i vraća brojanje na #1000.
-- Pusti ovo JEDNOM, pre prve prave prodaje. Kontakti i katalog se NE brišu.
-- Posle ovoga u aplikaciji na svakom uređaju: Podešavanja → "Obriši porudžbine i kreni od #1000".
delete from public.site_orders;
delete from public.sync_docs where kind = 'orders';
alter sequence public.order_number_seq restart with 1000;
