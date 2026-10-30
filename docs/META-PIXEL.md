# Meta Pixel na Lumora sajtu

Pixel ID: `1593355432274921` (u `src/data/site.ts` → `metaPixelId`).

## Kako radi
- **Baner za kolačiće** pri prvom dolasku (Prihvatam / Odbijam). Pixel se učitava **tek posle „Prihvatam"**; ako posetilac odbije, ništa se ne učitava i ne šalje.
- Izbor se menja preko linka **„Podešavanje kolačića"** u podnožju.
- **Ne meri se:** vlasnik (dok je prijavljen u aplikaciju u istom pregledaču), adresa sa `?notrack`, GitHub Pages probna adresa, localhost i pregledači sa „Do Not Track".
- Događaji (kod: `src/lib/pixel.ts`):

| Događaj | Gde | Podaci |
|---|---|---|
| PageView | svaka stranica | — |
| ViewContent | stranica proizvoda | `content_ids: [slug]`, naziv, cena, RSD |
| AddToCart | „Dodaj u korpu" (proizvod i kartice) | `content_ids: [slug]`, vrednost = cena × količina |
| InitiateCheckout | `/kasa` kad ima stavki | `content_ids`, broj komada, vrednost |
| Purchase | `/hvala`, jednom po porudžbini | `content_ids`, vrednost, `eventID` = broj porudžbine (npr. `#1000`) |

- **Ne šalju se** ime, adresa, telefon ni mejl kupca.

## Važno
- **ID proizvoda je `slug`** (npr. `arch-vaza`), isti kao `sku` u šemi proizvoda. U Meta katalogu **ID mora da bude isti**, inače katalog oglasi ne povezuju kupovinu sa proizvodom.
- Vrednost u Purchase je **iznos proizvoda** bez poštarine (poštarina se plaća kuriru).
- Plaćanje je pouzećem, pa je Purchase = „porudžbina poslata", a ne naplaćeno.

## Katalog proizvoda (ID-jevi se poklapaju sami)
Sajt sam pravi katalog za Meta: **https://www.homedecorlumora.com/meta-katalog.csv** (32 proizvoda, `id` = slug).
- Meta: Commerce Manager → Katalog → **Data sources → Data feed → Scheduled feed** → nalepi gornju adresu, izaberi „svakog dana".
- Slike su JPEG (`public/images/meta/`), jer Meta garantuje samo JPEG/PNG. Posle novih proizvoda: `python scripts/gen-meta-images.py`.
- Dostupnost je uvek „in stock" (štampa se po porudžbini); cena = cena proizvoda u RSD.

## Provera
Dok si prijavljen u aplikaciju, sajt te namerno ne meri. Za proveru otvori sajt kao **https://www.homedecorlumora.com/?pxtest=1** (važi dok ne zatvoriš tu karticu).

Chrome ekstenzija **Meta Pixel Helper**: prihvati kolačiće, otvori proizvod, dodaj u korpu, otvori kasu i pošalji porudžbinu. Mora da se vide svih pet događaja.

## Conversions API (opciono, kasnije)
Pixel gubi deo događaja zbog blokatora i iPhone-a. Serverski Purchase poziv se dodaje u `src/pages/api/order.ts` sa istim `event_id` (broj porudžbine). Treba **Access Token** iz Events Manager-a (Settings → Conversions API) koji ide u Vercel kao `META_CAPI_TOKEN` (nikad u kod, ni u razgovor). Napomena: serverski događaj se sme poslati samo za kupce koji su prihvatili kolačiće, pa treba preneti saglasnost sa sajta.
