# Lumora Admin — uputstvo

Aplikacija za vođenje posla: porudžbine sa sajta, pakovanje, predaja kuriru, naplata i analitika prodaje.
Radi kao obična aplikacija na telefonu (instalira se iz pregledača), bez naloga i bez mesečnih troškova.

**Adresa:** `https://zeljko012.github.io/Lumora/admin/` (kad sajt dobije pravi domen: `https://tvoj-domen/admin/`)

---

## 1. Instalacija na telefon (jednom, 1 minut)

**Android (Chrome):** otvori adresu → meni ⋮ → **Instaliraj aplikaciju** (ili „Dodaj na početni ekran").
**iPhone (Safari):** otvori adresu → dugme **Podeli** → **Dodaj na početni ekran**.

Na računaru je ista adresa; u Chrome-u se pojavi ikonica za instalaciju u adresnoj traci.

## 2. Prvo podešavanje (5 minuta)

**Više → Podešavanja:**
- **Moji podaci (pošiljalac)**: ime, adresa, telefon, račun za otkupninu. Štampaju se na nalepnicama.
- **Kurirske službe**: ostavi koje koristiš i upiši cenu dostave kad je ti plaćaš.
- **Poseta sajta**: (opciono) adresa statistike posete, v. odeljak 6.

## 3. Svakodnevni tok: od porudžbine do naplate

Početna strana ti pokazuje **šta je na redu** — četiri koraka, a prvi koji ima posla je označen kao „Sledeći korak":

1. **Porudžbina stiže** — kupac poruči na sajtu, a tebi na mejl stiže poruka sa dugmetom **📲 Otvori u aplikaciji**.
   Dodirni ga na telefonu, proveri podatke i dodirni **Dodaj u porudžbine**. Stavke se same povezuju sa katalogom.
   *Ako se dugme ne otvori u aplikaciji (npr. na iPhone-u): kopiraj link iz mejla, u aplikaciji otvori Početna → „Stigla porudžbina sa sajta?" i nalepi ga.*
2. **Pakovanje** — čeklista: crveno dok nešto nije spakovano, zeleno kad je sve spremno.
3. **Predaja kuriru** — spisak za kurira sa otkupninama i nalepnicama (PDF). Označi kao **Poslato**.
4. **Naplata** — kad kurir uplati otkupninu, označi **Naplaćeno**. Povrat se beleži sa razlogom i troškom.

Porudžbine možeš da uneseš i ručno (dugme **+**): telefon, Instagram, Viber…

## 4. Analitika

**Analitika** (donji meni) ima isto što i Shopify Analytics, a prilagođeno tvom poslu:
- **Pregled**: ukupna prodaja, porudžbine, prosečna porudžbina, kupci, povratni kupci, stopa povrata, zarada;
  grafikon prodaje kroz vreme sa poređenjem sa prethodnim periodom; najprodavaniji proizvodi, kategorije, boje, kanali prodaje;
  mapa „kada kupci poručuju" (dan × sat); gradovi.
- **Finansije** (naplaćeno, troškovi dostave, povrati, ostali troškovi, čista zarada), **Porudžbine**, **Proizvodi** (zaliha), **Kupci**, **Kuriri**.
- Periodi: Danas, Juče, 7 dana, 30 dana, ova nedelja, ovaj mesec, prošli mesec, godina, proizvoljan opseg.
- Izvoz u **CSV** (Excel) i **PDF** izveštaj.

**Prava zarada posle materijala:** u **Više → Katalog → proizvod** upiši *Trošak izrade* (materijal, struja…). Pregled tada prikazuje „Zarada posle izrade".

## 5. Katalog

Katalog (32 proizvoda × 7 boja) dolazi sa sajta, zajedno sa cenama i slikama. Kad promenimo cenu ili dodamo proizvod na sajtu,
u aplikaciji dodirni **Više → Osveži katalog sa sajta** (zaliha i trošak izrade koje si upisao ostaju).

Proizvodi se prave po porudžbini, pa se zaliha podrazumevano **ne vodi**. Uključi je u Podešavanjima ako želiš.

## 6. Poseta sajta (opciono, besplatno)

Analitika prodaje se računa iz porudžbina. Broj posetilaca i konverzija se mere na samom sajtu:
1. Napravi besplatan nalog na **Cloudflare Web Analytics** (ili **Umami Cloud**) — radi bez kolačića, pa nije potreban baner.
2. Token upiši u Vercel → Settings → Environment Variables: `PUBLIC_CF_BEACON` (ili `PUBLIC_UMAMI_ID`), pa Redeploy.
3. Adresu statistike nalepi u **Podešavanja → Poseta sajta** — u Analitici se pojavi dugme „Otvori statistiku posete".

## 7. Rezervna kopija i prelazak sa stare aplikacije „Porudžbine"

Podaci se čuvaju **na uređaju** (u pregledaču) i ne šalju se nigde.
- **Podešavanja → Sačuvaj rezervnu kopiju (JSON)** — povremeno (aplikacija te podseti na svakih 14 dana).
- **Prenos sa stare aplikacije:** u staroj → Podešavanja → Sačuvaj rezervnu kopiju → u ovoj → Podešavanja → Vrati iz rezervne kopije.
- **Važno:** podaci su vezani za adresu aplikacije. Kad sajt predješ na pravi domen, prvo sačuvaj kopiju, pa je vrati na novoj adresi.
  Zato je najbolje da prave porudžbine počneš da vodiš tek na konačnoj adresi.

## 8. Probni podaci

**Podešavanja → Probni podaci** dodaje ~75 dana izmišljenih porudžbina da vidiš kako izgledaju početna i analitika.
Brišu se jednim dodirom (i na početnoj strani, dok su uključeni); prave porudžbine se ne diraju.

## 9. Šta aplikacija (još) ne radi

- Ne šalje obaveštenja na telefon — obaveštenje je mejl sa dugmetom.
- Telefon i računar nisu sinhronizovani (svaki ima svoje podatke). Automatska sinhronizacija zahteva besplatan Supabase nalog;
  može da se doda kasnije, a podaci su već pripremljeni za to.

---

## Za razvoj

```bash
npm run dev:admin        # aplikacija u razvoju (vite)
npm run build            # gradi admin u public/admin, pa sajt
node scripts/gen-products.mjs scripts/products-source.json   # osvežava i katalog za aplikaciju (admin/src/data/catalog.json)
```

- Kod: `admin/` (React + Vite + Dexie, PWA). Početna: `admin/src/pages/HomePage.tsx`, analitika: `admin/src/lib/stats.ts` + `components/Overview.tsx`.
- Uvoz porudžbine sa sajta: `admin/src/lib/siteOrderCodec.ts` (isti oblik koristi `src/pages/api/order.ts` za link u mejlu).
- Katalog: `admin/src/lib/catalog.ts`. Probni podaci: `admin/src/lib/demo.ts`.
- Adresa aplikacije u mejlu: `ADMIN_URL` (ili `PUBLIC_SITE_URL` + `/admin/`).
