# Lumora — online prodavnica

Statički sajt (Astro) sa korpom i porudžbinom koja stiže na mejl.
Bez online plaćanja — plaćanje pouzećem. Kupac dobija automatsku potvrdu na mejl.

- **32 proizvoda**, 4 kategorije (Vaze, Figure, Svećnjaci, Dom), svaki u 7 boja
- Korpa (localStorage) + „slide-in” drawer + strana `/korpa`
- Checkout `/kasa` → šalje 2 mejla preko [Resend](https://resend.com): tebi (porudžbina) i kupcu (potvrda)
- SEO: meta po strani, Open Graph, JSON-LD (Organization, Product, BreadcrumbList, FAQ), `sitemap-index.xml`, `robots.txt`
- Slike proizvoda su preuzete sa Shopify-ja i optimizovane u `public/images/products/` (sajt je nezavisan od Shopify-ja)
- Svetla i tamna tema

---

## 1. Pokretanje lokalno

```bash
npm install
npm run dev
```

Sajt: <http://localhost:4321>

Ostale komande:

| Komanda | Šta radi |
|---|---|
| `npm run build` | Napravi produkcionu verziju u `dist/` |
| `npm run preview` | Lokalno pregleda build |
| `npm run images` | Ponovo skine/optimizuje slike proizvoda (preskače postojeće; `-- --force` za sve) |

---

## 2. Podešavanje mejlova (Resend) — OBAVEZNO za porudžbine

Bez ovog koraka checkout radi, ali umesto mejla vraća poruku „slanje nije podešeno”
(porudžbina se i dalje beleži u logovima Vercel-a).

1. Napravi besplatan nalog na <https://resend.com> (3.000 mejlova/mes, 100/dan).
2. **Dodaj domen**: Resend → *Domains* → *Add Domain* → unesi `lumora.rs` (ili tvoj domen).
   Resend će dati 3 DNS zapisa (SPF, DKIM, DMARC) — dodaj ih kod registrara domena.
   Kada status postane *Verified*, možeš da šalješ sa `porudzbine@lumora.rs`.
3. **API ključ**: Resend → *API Keys* → *Create* → kopiraj (počinje sa `re_...`).
4. Unesi vrednosti u environment varijable (lokalno u `.env`, na Vercel-u u *Settings → Environment Variables*):

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
ORDER_FROM="Lumora <porudzbine@lumora.rs>"
ORDER_TO=tvoj-licni-email@gmail.com
PUBLIC_SITE_URL=https://www.lumora.rs
```

> `ORDER_TO` sme da bude i više adresa, odvojenih zarezom.
> Dok domen nije verifikovan, za test možeš privremeno da koristiš
> `ORDER_FROM="Lumora <onboarding@resend.dev>"` — ali tada Resend šalje samo na
> adresu vlasnika naloga.

Kopiraj `.env.example` u `.env` i popuni:

```bash
cp .env.example .env
```

---

## 3. Objavljivanje na internet (Vercel)

1. Napravi nalog na <https://vercel.com> (besplatan „Hobby” plan je dovoljan).
2. Stavi kod na GitHub (`git init` je već urađen):

   ```bash
   git add -A
   git commit -m "Lumora sajt"
   gh repo create lumora --private --source=. --push
   ```

   (ili napravi repo ručno na github.com i `git push`)
3. Vercel → *Add New → Project* → izaberi taj GitHub repo.
   Astro se prepoznaje automatski — ne diraj Build/Output podešavanja.
4. U *Environment Variables* nalepi 4 varijable iz koraka 2. → *Deploy*.
5. Dobićeš adresu tipa `lumora.vercel.app`. Za pravi domen:
   Vercel → projekat → *Settings → Domains* → dodaj `lumora.rs` i `www.lumora.rs`
   i podesi DNS kod registrara po Vercel-ovim uputstvima.

Nakon što je domen aktivan, promeni ga na jednom mestu:
`src/data/site.ts` → `rawUrl` fallback (ili samo drži `PUBLIC_SITE_URL` na Vercel-u),
pa i u `public/robots.txt` (`Sitemap:` linija).

---

## 4. Kako menjati sadržaj

### Brend, kontakt, cena dostave, boje, meni
`src/data/site.ts` — sve na jednom mestu: naziv, email, telefon, Instagram,
prag za besplatnu dostavu (`freeShippingThreshold`), cena dostave (`shippingFee`),
rok isporuke, lista boja.

### Proizvodi (ime, cena, kategorija, opis, „za koga je”)
Ne menja se `src/data/products.ts` ručno — on je generisan.
Menja se `scripts/gen-products.mjs`:

- `NAME` — prikazani naziv po proizvodu
- `CATEGORY` — u koju kategoriju ide (`vaze` / `figure` / `svecnjaci` / `dom`)
- `COPY` — jedinstven uvod (`lead`) i „za koga je” (`forWhom`)
- `FEATURED` / `BESTSELLER` — šta se ističe na naslovnoj
- cene, boje i SEO tekstovi dolaze iz Shopify izvoza

Zatim:

```bash
node scripts/gen-products.mjs "<putanja do products.json>"
```

`products.json` je parsiran Shopify izvoz. Ako dobiješ nov CSV izvoz sa Shopify-ja,
prvo ga ponovo parsiraj (skripta `scripts/` u pomoćnom folderu) pa pokreni gornju komandu,
onda `npm run images` da povučeš nove slike.

### Nove/izmenjene slike
Slike stoje u `public/images/products/<slug>/1.webp` (i `-lg.webp` za zoom).
Zameni fajl istim imenom ili pokreni `npm run images`.

### Tekstovi info-strana
`src/pages/o-nama.astro`, `dostava-i-povracaj.astro`, `cesta-pitanja.astro`, `kontakt.astro`.

### ⚠️ Pravni tekstovi
`src/pages/uslovi-koriscenja.astro` i `politika-privatnosti.astro` su **šabloni**.
Dopuni ih podacima o pravnom licu (naziv, matični broj, PIB, adresa) i uskladi sa
Zakonom o zaštiti potrošača / podataka o ličnosti RS pre nego što sajt ide uživo.

---

## 5. Šta još treba (preporuke, nisu blokada)

- [ ] Ubaci pravi telefon i email u `src/data/site.ts` (sad su placeholder)
- [ ] Popuni pravne strane
- [ ] Google Search Console — dodaj domen i pošalji `sitemap-index.xml`
- [ ] Google Analytics ili Plausible (ako želiš statistiku posete)
- [ ] Newsletter: forma sad samo potvrđuje u pregledaču; poveži sa Resend Audiences
      ili Mailchimp ako želiš pravu listu (`src/pages/index.astro`, `data-newsletter`)
- [ ] Recenzije kupaca (za sad ih nema — ne prikazujemo lažne)

---

## Struktura

```
src/
  data/       site.ts (brend), products.ts (generisano)
  layouts/    Base.astro (head, SEO, JSON-LD, header/footer/korpa)
  components/ Header, Footer, CartDrawer, ProductCard, Breadcrumbs, Seo
  lib/        cart.ts (korpa), format.ts (cene)
  pages/
    index.astro
    prodavnica/            svi proizvodi
    kategorija/[slug]      vaze | figure | svecnjaci | dom
    proizvod/[slug]        stranica proizvoda
    korpa · kasa · hvala
    o-nama · kontakt · dostava-i-povracaj · cesta-pitanja
    uslovi-koriscenja · politika-privatnosti · 404
    api/order.ts           prima porudžbinu, šalje 2 mejla (Resend)
scripts/
  gen-products.mjs   Shopify izvoz -> products.ts
  fetch-images.mjs   skida + optimizuje slike
  gen-assets.mjs     favicon PNG + OG slika
public/
  images/products/   optimizovane slike (WebP)
  icon.svg robots.txt og-default.jpg
```
