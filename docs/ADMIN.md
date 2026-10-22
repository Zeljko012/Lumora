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

## 6. Poseta sajta i „uživo na sajtu"

Sajt sam broji posete (anonimno: bez kolačića, bez IP adresa i bez ličnih podataka) i upisuje ih u istu Supabase bazu.
1. Jednokratno u Supabase-u: **SQL Editor → New query** → nalepi sadržaj fajla `docs/supabase-visits.sql` → **Run**.
2. U aplikaciji (mora biti povezana, v. 6b): na **Početnoj** se pojavi kartica „X posetilaca je sada na sajtu" (koje stranice gledaju), a u **Analitici → Pregled → Poseta sajta**: posetioci, pregledi, koliko ih je kupilo, najgledanije stranice i odakle dolaze (Instagram, Google…).
3. Tvoje posete se ne broje: dok si prijavljen u aplikaciju u tom pregledaču, ili ako jednom otvoriš sajt sa `?notrack` na kraju adrese.
4. (Opciono) Cloudflare Web Analytics ili Umami i dalje mogu da se dodaju za dublju statistiku: `PUBLIC_CF_BEACON` / `PUBLIC_UMAMI_ID` u Vercel-u, pa adresu u Podešavanja → Poseta sajta.

## 6b. Automatski prijem porudžbina, zvuk i lista kontakata (Supabase, besplatno)

Šta dobijaš kad se ovo podesi:
- Porudžbina sa sajta **sama uđe u listu** u aplikaciji (bez kopiranja linka), uz **zvuk** i traku „Nova porudžbina".
- **Mejl** sa porudžbinom i dalje stiže — to je rezerva ako aplikacija ili baza ne rade.
- Svaki mejl/telefon koji neko ostavi (porudžbina ili prijava na sajtu) ulazi u **Više → Kupci i kontakti**.
- Porudžbine sa društvenih mreža i dalje unosiš ručno (dugme **+**); mejl i telefon kupca se upišu u kontakte.

Podešavanje (jednom, ~15 minuta):
1. Napravi besplatan nalog na **supabase.com**, pa **New project** (region: Frankfurt).
2. **SQL Editor → New query** → nalepi ceo sadržaj fajla `docs/supabase.sql` → **Run**.
3. **Authentication → Users → Add user**: mejl `homedecorlumora@gmail.com` i lozinka koju izabereš (čekiraj „Auto confirm"). 
   Zatim **Authentication → Sign In / Providers → isključi „Allow new users to sign up"** (da se niko drugi ne može registrovati).
4. **Project Settings → API Keys** — trebaju ti tri stvari:
   - *Project URL*,
   - *publishable (anon)* ključ — ide u aplikaciju,
   - *secret* ključ — ide **samo** u Vercel (nikad u aplikaciju ni u kod).
5. Vercel → Settings → Environment Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, plus tri `VAPID_*` vrednosti iz fajla `VAPID-kljucevi.txt` (za obaveštenja na telefonu). Pa **Redeploy**.
6. U aplikaciji: **Više → Podešavanja → Povezivanje sa sajtom** → upiši Project URL, publishable ključ, mejl i lozinku → **Poveži**.
7. Isto mesto: **Uključi obaveštenja na ovom telefonu** (iPhone: prvo „Dodaj na početni ekran").

Zvuk: dok je aplikacija otvorena svira melodija (prvi dodir ekrana posle otvaranja uključuje zvuk, to traži pregledač) i telefon vibrira.
Kad je aplikacija zatvorena, obaveštenje dolazi kao push i oglasi se **zvuk telefona** (ne mora biti isti kao u aplikaciji).

### Sinhronizacija telefon ↔ računar
Sve što radiš (porudžbine, statusi, troškovi, katalog, kontakti, podešavanja) se u roku od par sekundi prenosi na ostale uređaje na kojima si prijavljen.
- Jednokratno u Supabase-u: **SQL Editor → New query** → nalepi sadržaj fajla `docs/supabase-sync.sql` → **Run** (ako si ceo `supabase.sql` pustio posle ovog dodatka, već je uključeno).
- Na svakom uređaju: Podešavanja → Povezivanje sa sajtom (ista adresa baze, ključ, mejl i lozinka).
- Prvi put poveži **jedan uređaj, sačekaj minut**, pa tek onda drugi. Probne porudžbine koje si ručno pravio odvojeno na oba uređaja će se na kraju pojaviti na oba — obriši ih pre povezivanja.
- Statusi i unosi se ne gube: ako dva uređaja imaju isti broj porudžbine, kasnija dobija novi broj.

### Mejling lista i Viber
- **Više → Kupci i kontakti** → **Pripremi akciju**: kopiraš mejlove (u „Bcc" svog mejla) ili preuzimaš CSV; za one **bez mejla** dobijaš brojeve u +381 obliku za Viber.
- Podrazumevano se uzimaju samo kontakti koji su **pristali** (kvačica pri porudžbini, prijava na sajtu, ili ručno uključeno u kontaktu). Ostali ostaju u listi, ali ne ulaze u izvoz za akcije.
- Svaka poruka treba da ima jasnu mogućnost odjave (napiši „odgovori STOP", pa takvog kupca u kontaktu označi „Odjavljen").
- Napomena (nije pravni savet): za marketinške poruke treba saglasnost kupca; kvačica na kasi i prijava na sajtu to pokrivaju.

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

- Sinhronizacija radi samo uz vezu sa Supabase-om (6b). Bez interneta izmene se čuvaju na uređaju i šalju čim se veza vrati.
- Ako istu porudžbinu istovremeno izmeniš na dva uređaja, pobeđuje poslednja izmena.
- Trajno brisanje (ne „obriši porudžbinu“, već brisanje probnih podataka) se ne prenosi na druge uređaje.
- Ne šalje poruke kupcima — samo priprema mejlove i brojeve za Viber.

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
