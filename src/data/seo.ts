/**
 * SEO sadržaj i ciljne ključne reči — kategorije, stranice za poklone i vodiči.
 *
 * NAPOMENA: ključne reči su izabrane prema tome kako ljudi u Srbiji realno
 * traže ovakve proizvode (latinica, i sa i bez dijakritika — Google ih
 * izjednačava), a NE prema izmerenim brojevima pretrage. Kad sajt dobije pravi
 * domen, proveriti u Google Search Console (Performance → Queries) koje se
 * fraze stvarno prikazuju i prilagoditi naslove/tekstove.
 *
 * Tokeni u tekstu: {from} najniža cena, {to} najviša cena, {count} broj komada.
 */
import type { Category } from "./products";
import { SITE } from "./site";
import { EXTRA_GIFT_PAGES, THEME_PAGES as THEME_PAGES_DATA } from "./seo-landing";

export interface Faq {
  q: string;
  a: string;
}
export interface Section {
  h2: string;
  p: string[];
}
export interface SeoLink {
  label: string;
  href: string;
}

export const fill = (s: string, v: Record<string, string | number>): string =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));

const DELIVERY = SITE.deliveryTime;

/* ============================== KATEGORIJE ============================== */

export interface CategorySeo {
  /** <title> (bez " | Lumora" — dodaje se automatski) */
  title: string;
  h1: string;
  description: string;
  sections: Section[];
  faqs: Faq[];
  related: SeoLink[];
  keywords: string[];
}

export const CATEGORY_SEO: Record<Category, CategorySeo> = {
  vaze: {
    title: "Vaze za suvo cveće i pampas travu – 3D štampane",
    h1: "Moderne vaze za suvo cveće i pampas travu",
    description:
      "{count} modernih dekorativnih vaza za suvo cveće i pampas travu — Donut, Arch, Bubble, Duo i druge. 3D štampano u Srbiji, 7 boja, od {from}. Plaćanje pouzećem.",
    sections: [
      {
        h2: "Kako izabrati vazu za suvo cveće i pampas travu",
        p: [
          "Za suvo cveće i pampas travu najbolje rade vaze sa užim grlom i stabilnom bazom: buket stoji uspravno i ne klati se. Šire vaze daju bujniji, razmaknut aranžman, dok oblici poput Donut Vaze ili Arch Vaze i sami izgledaju kao skulptura, pa im je dovoljna jedna ili dve grane.",
          "Aranžman je najskladniji kada je cveće oko jedan i po do dva puta više od same vaze. Ako ne znaš odakle da počneš, pročitaj naš kratak vodič o tome kako izabrati vazu za suvo cveće.",
        ],
      },
      {
        h2: "Zašto 3D štampane vaze",
        p: [
          "3D štampa omogućava forme koje se teško pravi klasičnom proizvodnjom: otvoreni krugovi, spiralne teksture, rebra i mehurići. Svaka vaza se štampa po porudžbini, sloj po sloj, od PLA materijala, u boji koju izabereš — bela, bež, siva, crna, roze, maslinasto zelena ili crvena.",
        ],
      },
      {
        h2: "Zašto su Lumora vaze samo za suvo cveće",
        p: [
          "Lumora vaze su ukrasne i ne pune se vodom. Namenjene su suvom cveću, pampas travi i grančicama, ili da stoje same kao skulptura. Zato su idealne za aranžmane koji traju mesecima, bez menjanja vode.",
          "Čiste se suvom ili blago vlažnom krpom; izbegavaj direktno sunce i izvore toplote.",
        ],
      },
    ],
    faqs: [
      {
        q: "Da li se u ove vaze stavlja voda?",
        a: "Ne. Lumora vaze su ukrasne i ne pune se vodom. Namenjene su suvom cveću, pampas travi i dekoraciji, ili da stoje same kao skulptura.",
      },
      {
        q: "Koja vaza je najbolja za pampas travu?",
        a: "Za pampas travu biraj vazu sa stabilnom bazom i užim otvorom, na primer Harmony Vazu, Donut Vazu ili Spiralnu Vazu. Pampas ostavlja vlakna, pa je dobro da je pre postavljanja protreseš napolju.",
      },
      {
        q: "Mogu li da izaberem boju vaze?",
        a: "Da. Svaka vaza se štampa u 7 boja: bela, bež, siva, crna, roze, maslinasto zelena i crvena. Boju biraš na stranici proizvoda.",
      },
      {
        q: "Kako se plaća i koliko traje dostava?",
        a: `Plaćanje je pouzećem, gotovinom kuriru. Dostava po celoj Srbiji traje ${DELIVERY} od potvrde porudžbine.`,
      },
      {
        q: "Gde mogu da kupim vazu za suvo cveće u Srbiji?",
        a: "Lumora vaze se naručuju direktno na sajtu i šalju na adresu u celoj Srbiji. Plaćanje je pouzećem.",
      },
      {
        q: "Koliko košta vaza za suvo cveće?",
        a: "Cene naših vaza su od {from} do {to}. Besplatna dostava važi za porudžbine preko 6.000 RSD.",
      },
      {
        q: "Šta je 3D štampana vaza?",
        a: "Vaza napravljena 3D štampom, sloj po sloj, od PLA materijala. Oblik je precizan, a boju biraš sam.",
      },
    ],
    related: [
      { label: "Kako izabrati vazu za suvo cveće", href: "/vodic/kako-izabrati-vazu-za-suvo-cvece" },
      { label: "Poklon za useljenje u novi stan", href: "/pokloni/poklon-za-useljenje" },
      { label: "Kako ukrasiti policu i komodu", href: "/vodic/kako-ukrasiti-policu-i-komodu" },
      { label: "Boho dekoracija za dom", href: "/dekoracija/boho-dekoracija-za-dom" },
      { label: "Minimalistička dekoracija za dom", href: "/dekoracija/minimalisticka-dekoracija-za-dom" },
    ],
    keywords: [
      "vaza za suvo cveće",
      "vaza za pampas travu",
      "moderne vaze",
      "dekorativne vaze",
      "3D štampana vaza",
      "vaza za dnevnu sobu",
      "skulpturalna vaza",
    ],
  },

  figure: {
    title: "Dekorativne figure i skulpture za dom – 3D štampane",
    h1: "Dekorativne figure i skulpture za dom",
    description:
      "{count} 3D štampanih figura i skulptura — mačke, labrador, parovi u zagrljaju, apstraktne forme. Odličan poklon, 7 boja, od {from}. Dostava po celoj Srbiji.",
    sections: [
      {
        h2: "Skulpture i figure za policu, komodu i radni sto",
        p: [
          "Mala skulptura je najlakši način da prostoru daš karakter: jedna figura na polici ili par figura na komodi menja utisak cele sobe. U ponudi su figure mačaka i labradora, parovi u zagrljaju, apstraktne forme poput Mislioca i Maske, kao i natpis HOME.",
        ],
      },
      {
        h2: "Figure kao poklon",
        p: [
          "Zbog cene i veličine figure su omiljen poklon: za godišnjicu, rođendan, useljenje ili za ljubitelje životinja. Ako tražiš ideju za konkretnu priliku, pogledaj naše predloge poklona.",
        ],
      },
      {
        h2: "Boja i materijal",
        p: [
          "Svaka figura se štampa po porudžbini od PLA materijala u boji po izboru (7 boja). Crna figura daje jak kontrast na svetlim policama, dok se bela i bež tiho uklapaju u minimalistički enterijer.",
        ],
      },
    ],
    faqs: [
      {
        q: "Koja figura je dobar poklon za ljubitelje mačaka?",
        a: "Maca Figura, Uspavana Maca, Maca Mreža i Zaljubljene Mace — sve četiri su dostupne u 7 boja.",
      },
      {
        q: "Da li mogu da izaberem boju figure?",
        a: "Da. Boju biraš na stranici proizvoda: bela, bež, siva, crna, roze, maslinasto zelena ili crvena.",
      },
      {
        q: "Kako se čiste figure?",
        a: "Suvom ili blago vlažnom krpom. Izbegavaj jaka sredstva za čišćenje, rastvarače, direktno sunce i izvore toplote.",
      },
      {
        q: "Koliko traje dostava?",
        a: `${DELIVERY} od potvrde porudžbine, kurirskom službom po celoj Srbiji. Plaćanje je pouzećem.`,
      },
      {
        q: "Koje figure su dobre za dnevnu sobu?",
        a: "Mislilac, Zaljubljeni Par i Maska su skulpture koje same drže policu ili komodu. Pogledaj i ideje za dekoraciju dnevne sobe.",
      },
    ],
    related: [
      { label: "Poklon za ljubitelje mačaka", href: "/pokloni/poklon-za-ljubitelje-macaka" },
      { label: "Poklon za godišnjicu", href: "/pokloni/poklon-za-godisnjicu" },
      { label: "Pokloni do 2.000 dinara", href: "/pokloni/pokloni-do-2000-dinara" },
      { label: "3D štampani pokloni", href: "/pokloni/3d-stampani-pokloni" },
      { label: "Dekoracija za dnevnu sobu", href: "/dekoracija/dekoracija-za-dnevnu-sobu" },
    ],
    keywords: [
      "dekorativne figure",
      "skulptura za dom",
      "figura mačke",
      "figura labrador",
      "skulptura zaljubljeni par",
      "apstraktna skulptura",
      "poklon za ljubitelje mačaka",
    ],
  },

  svecnjaci: {
    title: "Dekorativni svećnjaci – moderni 3D štampani",
    h1: "Dekorativni svećnjaci za toplu atmosferu",
    description:
      "{count} modernih 3D štampanih svećnjaka — Bubble, Rebrasti, Spiralni, Srce i Hvatač svetlosti. 7 boja, od {from}. Plaćanje pouzećem, dostava po Srbiji.",
    sections: [
      {
        h2: "Svećnjaci koji oblikuju svetlo",
        p: [
          "Dobar svećnjak radi i kada sveća ne gori. Mehurići, rebra, spirale i srce bacaju na zid zanimljive senke i odsjaje, a Hvatač svetlosti lomi svetlost LED svećice u desetine sitnih tačaka. Savršeni su za dnevni boravak, trpezarijski sto i večernju atmosferu.",
        ],
      },
      {
        h2: "Bezbedno korišćenje",
        p: [
          "Svećnjaci su štampani od PLA materijala, koji ne podnosi visoku temperaturu. Namenjeni su isključivo LED svećicama i ne smeju se koristiti sa otvorenim plamenom.",
        ],
      },
      {
        h2: "Boje i kombinovanje",
        p: [
          "Svaki svećnjak dolazi u 7 boja. Dva ili tri svećnjaka u istoj boji, a različitih oblika, deluju kao uigran set, a mogu se lepo kombinovati i sa našim vazama.",
        ],
      },
    ],
    faqs: [
      {
        q: "Koje sveće mogu da koristim?",
        a: "Samo LED svećice. Svećnjaci su štampani od PLA materijala koji ne podnosi toplotu, pa se ne smeju koristiti sa otvorenim plamenom (običnim ni čajnim svećicama).",
      },
      {
        q: "Da li svećnjaci dolaze u više boja?",
        a: "Da, u 7 boja: bela, bež, siva, crna, roze, maslinasto zelena i crvena.",
      },
      {
        q: "Koji svećnjak je dobar poklon?",
        a: "Srce Svećnjak je popularan izbor za godišnjicu i Dan zaljubljenih, a Bubble Svećnjak je najpristupačniji — idealan kao mali poklon.",
      },
      {
        q: "Mogu li da složim set svećnjaka?",
        a: "Da. Izaberi dva ili tri modela u istoj boji — na primer Bubble, Rebrasti i Spiralni — i dobijaš uigran set različitih oblika.",
      },
    ],
    related: [
      { label: "Poklon za godišnjicu i zaljubljene", href: "/pokloni/poklon-za-godisnjicu" },
      { label: "Kako održavati 3D štampane dekoracije", href: "/vodic/kako-odrzavati-3d-stampane-dekoracije" },
      { label: "Pokloni za Novu godinu i praznike", href: "/pokloni/pokloni-za-novu-godinu" },
    ],
    keywords: [
      "svećnjak",
      "dekorativni svećnjak",
      "moderni svećnjak",
      "svećnjak za LED svećice",
      "svećnjak u obliku srca",
      "3D štampani svećnjak",
    ],
  },

  dom: {
    title: "Dekoracije za dom: HOME natpis i saksije",
    h1: "Detalji za dom: natpisi i saksije",
    description:
      "{count} 3D štampana detalja za dom — HOME natpis za ulaz i vrata, saksije u obliku stabla, mačje šapice i papirne kese. 7 boja, od {from}. Dostava po Srbiji.",
    sections: [
      {
        h2: "Natpis HOME za ulaz i vrata",
        p: [
          "Prvo što vidiš kad uđeš u stan je ulazni prostor, pa je mali natpis Home Sweet Home jedan od najjednostavnijih načina da prostor deluje domaće. Dostupan je kao dekoracija za vrata, kao i u obliku slova koja stoje na polici ili komodi.",
        ],
      },
      {
        h2: "Saksije za male biljke i sukulente",
        p: [
          "Saksije u obliku stabla, mačje šapice i presavijene papirne kese donose karakter na radni sto ili prozor. Najsigurnije je da biljku držiš u lončiću unutar saksije, jer su 3D štampani predmeti dekorativni i nisu vodootporni.",
        ],
      },
    ],
    faqs: [
      {
        q: "Da li saksije mogu direktno da se zalivaju?",
        a: "Preporučujemo da biljku držiš u malom lončiću unutar saksije, a ne direktno u njoj. Saksije su dekorativne i nisu vodootporne.",
      },
      {
        q: "Mogu li da izaberem boju?",
        a: "Da, svaki proizvod dolazi u 7 boja. Boju biraš na stranici proizvoda.",
      },
      {
        q: "Koja saksija je dobra za sukulente?",
        a: "Drvo, Šapica i Papir Saksija su namenjene malim biljkama poput sukulenata. Biljku drži u lončiću unutar saksije.",
      },
    ],
    related: [
      { label: "Dekorativne saksije za sukulente", href: "/dekoracija/dekorativne-saksije" },
      { label: "Poklon za useljenje u novi stan", href: "/pokloni/poklon-za-useljenje" },
      { label: "Poklon za ljubitelje mačaka", href: "/pokloni/poklon-za-ljubitelje-macaka" },
    ],
    keywords: [
      "home sweet home dekoracija",
      "dekoracija za ulazna vrata",
      "saksija za sukulente",
      "saksija šapica",
      "dekoracije za dom",
    ],
  },
};

/* ======================== STRANICE ZA POKLONE ======================== */

export interface GiftPage {
  slug: string;
  title: string;
  h1: string;
  description: string;
  intro: string[];
  /** slug-ovi proizvoda (redosled se čuva) */
  products?: string[];
  /** ili: svi proizvodi do ove cene, sortirani po ceni */
  maxPrice?: number;
  tips: Section;
  faqs: Faq[];
  keywords: string[];
}

const BASE_GIFT_PAGES: GiftPage[] = [
  {
    slug: "poklon-za-useljenje",
    title: "Poklon za useljenje u novi stan – dekoracije",
    h1: "Poklon za useljenje u novi stan",
    description:
      "Ideje za poklon za useljenje: natpis HOME, moderne vaze, svećnjaci i saksije. 3D štampano u Srbiji, 7 boja, od {from}. Plaćanje pouzećem.",
    intro: [
      "Kad se neko useli u novi stan, poklon treba da bude lep, da ne zauzima mnogo mesta i da se uklopi u prostor koji tek dobija karakter. Dekorativni predmeti rade upravo to — ne traže održavanje i odmah čine prostor domaćim.",
      "U izboru su natpisi HOME za ulaz i policu, moderne vaze za suvo cveće, svećnjaci i saksije. Svaki komad se štampa u boji koju izabereš, pa se lako uklapa u stil onoga ko se useljava.",
    ],
    products: [
      "home-figura",
      "home-roze-figura",
      "home-za-vrata",
      "donut-vaza",
      "harmony-vaza",
      "arch-vaza",
      "duo-vaza",
      "rebrasti-svecnjak",
      "bubble-svecnjak",
      "drvo-saksija",
    ],
    tips: {
      h2: "Kako izabrati poklon za useljenje",
      p: [
        "Ako ne znaš stil stana, biraj neutralne boje — bela i bež se uklapaju gotovo svuda. Natpis HOME je siguran izbor jer direktno slavi priliku, a vaza i svećnjak u istoj boji čine lep, uigran set.",
        "Budžet je fleksibilan: sitniji komadi počinju od {from}, a veće vaze i setovi idu do {to}.",
      ],
    },
    faqs: [
      {
        q: "Koliko košta poklon za useljenje?",
        a: "Naši komadi za ovu priliku koštaju od {from} do {to}. Besplatna dostava važi za porudžbine preko 6.000 RSD.",
      },
      {
        q: "Mogu li da izaberem boju poklona?",
        a: "Da, svaki komad dolazi u 7 boja. Ako ne znaš koja se uklapa, bela i bež su najsigurniji izbor.",
      },
      {
        q: "Koliko brzo stiže porudžbina?",
        a: `${DELIVERY} od potvrde porudžbine, na adresu na koju želiš da stigne poklon. Plaćanje je pouzećem.`,
      },
    ],
    keywords: [
      "poklon za useljenje",
      "poklon za novi stan",
      "poklon za novi dom",
      "pokloni za novosel",
      "home sweet home dekoracija",
    ],
  },
  {
    slug: "poklon-za-ljubitelje-macaka",
    title: "Poklon za ljubitelje mačaka – figure i saksije",
    h1: "Poklon za ljubitelje mačaka",
    description:
      "Poklon za ljubitelje mačaka: figure mačaka i saksija u obliku šapice. 3D štampano u Srbiji, 7 boja, od {from}. Plaćanje pouzećem, dostava po Srbiji.",
    intro: [
      "Ako poznaješ nekoga ko obožava mačke, dekorativna figura je poklon koji se odmah prepozna: ne zahteva negu, a stoji na polici ili radnom stolu i svaki dan izaziva osmeh.",
      "Biraj između uspavane mace, istegnute mace od mreže, elegantne sede figure i dve zaljubljene mace — ili saksiju u obliku šapice za biljku koju vlasnik mačke već voli.",
    ],
    products: [
      "maca-figura",
      "uspavana-maca-figura",
      "maca-mreza-figura",
      "zaljubljene-mace-figura",
      "sapica-saksija",
    ],
    tips: {
      h2: "Koju mačju figuru izabrati",
      p: [
        "Crna figura je elegantna i izgleda skupo na svetlim policama; bela ili bež mekše deluje u spavaćoj sobi. Za parove ljubitelja mačaka dobar izbor su Zaljubljene Mace, a Uspavana Maca daje miran, opušten utisak.",
      ],
    },
    faqs: [
      {
        q: "Koja figura mačke je najbolji poklon?",
        a: "Zavisi od ukusa: Maca Figura je klasičan izbor, Uspavana Maca je mirna i simpatična, Maca Mreža je moderna i dizajnerska, a Zaljubljene Mace su za parove.",
      },
      {
        q: "Da li figure dolaze u više boja?",
        a: "Da, u 7 boja: bela, bež, siva, crna, roze, maslinasto zelena i crvena.",
      },
      {
        q: "Koliko košta figura mačke?",
        a: "Figure koštaju od {from} do {to}. Besplatna dostava važi za porudžbine preko 6.000 RSD.",
      },
    ],
    keywords: [
      "poklon za ljubitelje mačaka",
      "figura mačke",
      "skulptura mačke",
      "poklon za vlasnika mačke",
      "saksija šapica",
    ],
  },
  {
    slug: "poklon-za-godisnjicu",
    title: "Poklon za godišnjicu – romantične dekoracije za dom",
    h1: "Poklon za godišnjicu",
    description:
      "Romantičan poklon za godišnjicu veze: parovi u zagrljaju, figura sa srcem, svećnjak u obliku srca. 3D štampano u Srbiji, 7 boja, od {from}.",
    intro: [
      "Za godišnjicu veze ili bez posebnog razloga, mala skulptura o bliskosti poklanja se lako i ostaje dugo. Ne vene, ne zahteva negu i svaki put kad prođeš pored polica podseća na osobu koja ti ju je poklonila.",
      "U ponudi su apstraktni parovi u zagrljaju, figura sa srcem, dve zaljubljene mace i svećnjak u obliku srca — sve u 7 boja, po izboru.",
    ],
    products: [
      "zaljubljeni-par-figura",
      "zagrljaj-ljubavi-figura",
      "figura-sa-srcem",
      "zaljubljene-mace-figura",
      "srce-svecnjak",
      "hvatac-svetlosti-svecnjak",
    ],
    tips: {
      h2: "Kako izabrati romantičan poklon",
      p: [
        "Apstraktni parovi (Zaljubljeni Par, Zagrljaj Ljubavi) su elegantni i ne zavise od ukusa za pojedinosti. Srce Svećnjak je topao i pristupačan, a Figura sa Srcem poručuje pažnju bez mnogo reči. Za crveno srce biraj crvenu boju, a za diskretniji poklon belu ili bež.",
      ],
    },
    faqs: [
      {
        q: "Šta je dobar poklon za godišnjicu veze?",
        a: "Skulptura para u zagrljaju ili svećnjak u obliku srca. Oba se prave po porudžbini u boji koju izabereš.",
      },
      {
        q: "Koliko košta romantičan poklon?",
        a: "Od {from} do {to}. Besplatna dostava važi za porudžbine preko 6.000 RSD.",
      },
      {
        q: "Da li stiže na vreme za Dan zaljubljenih?",
        a: `Dostava traje ${DELIVERY} od potvrde porudžbine, pa porudžbinu ostavi bar nedelju dana ranije.`,
      },
    ],
    keywords: [
      "poklon za godišnjicu",
      "poklon za devojku",
      "poklon za Dan zaljubljenih",
      "romantični pokloni",
      "svećnjak u obliku srca",
    ],
  },
  {
    slug: "pokloni-do-2000-dinara",
    title: "Pokloni do 2.000 dinara – dekoracije za dom",
    h1: "Pokloni do 2.000 dinara",
    description:
      "{count} ideja za poklon do 2.000 dinara: figure, svećnjaci, vaze i natpisi, 3D štampani u Srbiji. 7 boja, plaćanje pouzećem, dostava po celoj Srbiji.",
    intro: [
      "Lep poklon ne mora da bude skup. U ovoj ponudi su dekoracije za dom do 2.000 dinara: figure, svećnjaci, natpis HOME i druge male skulpture koje se lako poklanjaju za rođendan, useljenje ili godišnjicu.",
      "Svaki komad se štampa po porudžbini u boji koju izabereš. Za porudžbine preko 6.000 RSD dostava je besplatna, pa je isplativo uzeti nekoliko komada odjednom.",
    ],
    maxPrice: 2000,
    tips: {
      h2: "Kako da poklon izgleda vredno za malo novca",
      p: [
        "Dva ili tri manja komada u istoj boji deluju kao pažljivo izabran set, a ukupna cena i dalje ostaje niska. Na primer, kombinuj svećnjak sa figurom, ili dva različita svećnjaka u istoj boji.",
      ],
    },
    faqs: [
      {
        q: "Koji je najjeftiniji poklon u ponudi?",
        a: "Bubble Svećnjak od 700 RSD je najpristupačniji, a Rebrasti Svećnjak košta 1.000 RSD.",
      },
      {
        q: "Da li je dostava besplatna?",
        a: "Dostava je besplatna za porudžbine preko 6.000 RSD. Za manje porudžbine se plaća po ceni kurirske službe.",
      },
      {
        q: "Kako se plaća?",
        a: "Plaćanje je pouzećem, gotovinom kuriru pri preuzimanju.",
      },
    ],
    keywords: [
      "poklon do 2000 dinara",
      "jeftini pokloni",
      "pokloni do 2000",
      "mali pokloni za dom",
      "povoljni pokloni",
    ],
  },
];

const GIFT_ORDER = [
  "3d-stampani-pokloni",
  "poklon-za-useljenje",
  "poklon-za-godisnjicu",
  "poklon-za-mladence",
  "poklon-za-dan-zaljubljenih",
  "poklon-za-8-mart",
  "poklon-za-mamu",
  "poklon-za-materice",
  "poklon-za-muskarca",
  "poklon-za-rodjendan",
  "pokloni-za-novu-godinu",
  "pokloni-za-bozic",
  "poklon-za-ljubitelje-macaka",
  "pokloni-do-2000-dinara",
];
export const GIFT_PAGES: GiftPage[] = [...BASE_GIFT_PAGES, ...EXTRA_GIFT_PAGES].sort(
  (a, b) => GIFT_ORDER.indexOf(a.slug) - GIFT_ORDER.indexOf(b.slug),
);

/** Stranice po stilu / prostoru: /dekoracija/<slug> */
export const THEME_PAGES: GiftPage[] = THEME_PAGES_DATA;
export const getThemePage = (slug: string) => THEME_PAGES.find((g) => g.slug === slug);

/* ================================ VODIČI ================================ */

export interface Guide {
  slug: string;
  title: string;
  description: string;
  intro: string;
  sections: Section[];
  related: SeoLink[];
  keywords: string[];
  published: string; // ISO datum
}

export const GUIDES: Guide[] = [
  {
    slug: "kako-izabrati-vazu-za-suvo-cvece",
    title: "Kako izabrati vazu za suvo cveće i pampas travu",
    description:
      "Praktičan vodič: oblik, proporcije, boja i materijal vaze za suvo cveće i pampas travu — i kako da aranžman izgleda skladno.",
    intro:
      "Suvo cveće i pampas trava su omiljen dekor jer traju mesecima i ne traže zalivanje. Ali isti buket može da izgleda potpuno drugačije u različitim vazama. Evo kako da izabereš pravu.",
    sections: [
      {
        h2: "Odluči: vaza kao nosač ili kao skulptura",
        p: [
          "Neke vaze su dovoljno upečatljive i bez cveća — Donut Vaza, Arch Vaza ili Duo Vaza deluju kao mala skulptura. Za njih je dovoljna jedna do tri grane. Jednostavnije forme, poput Harmony Vaze, dobro nose bujniji aranžman.",
        ],
      },
      {
        h2: "Proporcije: visina cveća prema vazi",
        p: [
          "Pravilo palca je da aranžman bude oko jedan i po do dva puta viši od vaze. Za pampas travu je bolje nekoliko dugačkih grana nego gust buket — trava dobija na vazdušnosti kada ima prostora.",
        ],
      },
      {
        h2: "Oblik grla i stabilnost",
        p: [
          "Uže grlo drži grane uspravno, dok se u široku vazu stavlja više stabljika. Pampas je lagan, ali ume da prevrne laku vazu, pa potraži stabilnu bazu.",
        ],
      },
      {
        h2: "Boja vaze",
        p: [
          "Tamna vaza (crna, maslinasto zelena) daje kontrast svetloj pampas travi. Bela, bež i siva vaza umiruju prostor i dobro idu uz tamne grane i prirodne tonove. Roze i crvena vaza su akcenat — biraj ih kad ostatak sobe ostaje neutralan.",
        ],
      },
      {
        h2: "Nega suvog cveća",
        p: [
          "Drži suvo cveće dalje od vlage i direktnog sunca. Pampas ostavlja vlakna, pa ga pre postavljanja protresi napolju. Vaze su dekorativne i nisu vodootporne, tako da im voda ne treba.",
        ],
      },
    ],
    related: [
      { label: "Sve vaze", href: "/kategorija/vaze" },
      { label: "Donut Vaza", href: "/proizvod/donut-vaza" },
      { label: "Harmony Vaza", href: "/proizvod/harmony-vaza" },
      { label: "Poklon za useljenje", href: "/pokloni/poklon-za-useljenje" },
    ],
    keywords: [
      "kako izabrati vazu",
      "vaza za suvo cveće",
      "vaza za pampas travu",
      "kako aranžirati suvo cveće",
    ],
    published: "2026-10-21",
  },
  {
    slug: "kako-odrzavati-3d-stampane-dekoracije",
    title: "Kako održavati 3D štampane dekoracije (PLA)",
    description:
      "Kako da očuvaš 3D štampane vaze, figure i svećnjake: čišćenje, temperatura, sunce, voda i bezbedno korišćenje LED svećica.",
    intro:
      "3D štampane dekoracije se lako održavaju, ali PLA materijal ima nekoliko osobina koje vredi znati. Evo kako da ti komadi dugo izgledaju kao prvog dana.",
    sections: [
      {
        h2: "Čišćenje",
        p: [
          "Prašinu briši suvom ili blago vlažnom krpom. Za teksture sa rebrima ili mehurićima koristi mekanu četkicu. Izbegavaj rastvarače i jaka sredstva za čišćenje, jer mogu oštetiti površinu.",
        ],
      },
      {
        h2: "Toplota i sunce",
        p: [
          "PLA omekšava na višim temperaturama, pa komade ne držimo u zatvorenom automobilu, pored radijatora ni pored peći. Dugotrajno direktno sunce, naročito iza stakla, može da izbledi boju.",
        ],
      },
      {
        h2: "Voda",
        p: [
          "Vaze i saksije su dekorativni predmeti i nisu vodootporni. Za suvo cveće i pampas travu je to savršeno; za žive biljke koristi lončić unutar saksije.",
        ],
      },
      {
        h2: "Svećnjaci",
        p: [
          "Svećnjaci su namenjeni isključivo LED svećicama i ne smeju se koristiti sa otvorenim plamenom. PLA ne podnosi toplotu.",
        ],
      },
      {
        h2: "Vidljivi slojevi su deo izgleda",
        p: [
          "Pošto se štampa sloj po sloj, na nekim komadima se vide fine linije slojeva ili tekstura. To je karakteristika 3D štampe i deo njihovog izgleda.",
        ],
      },
    ],
    related: [
      { label: "Česta pitanja", href: "/cesta-pitanja" },
      { label: "Svećnjaci", href: "/kategorija/svecnjaci" },
      { label: "Vaze", href: "/kategorija/vaze" },
    ],
    keywords: [
      "3D štampane dekoracije održavanje",
      "PLA materijal",
      "kako čistiti 3D štampane predmete",
    ],
    published: "2026-10-21",
  },
  {
    slug: "kako-ukrasiti-policu-i-komodu",
    title: "Kako ukrasiti policu i komodu dekoracijama",
    description:
      "Kako da urediš policu i komodu dekoracijama: neparan broj komada, razlika u visini, prazan prostor i kombinovanje vaza, figura i svećnjaka.",
    intro:
      "Dobro ukrašena polica ne izgleda kao gomila predmeta, nego kao kompozicija. Za to ti ne treba mnogo — dovoljno je nekoliko jednostavnih pravila.",
    sections: [
      {
        h2: "Neparan broj komada",
        p: [
          "Grupe od tri komada deluju prirodnije nego parne. Na komodi probaj vazu, figuru i svećnjak, i pomeraj ih dok ne dobiješ ravnotežu.",
        ],
      },
      {
        h2: "Variraj visinu i oblik",
        p: [
          "Kombinuj jedan viši, jedan srednji i jedan niži komad. Okrugle forme (Donut Vaza, Bubble Svećnjak) lepo se slažu sa ravnim linijama (Rebrasti Svećnjak, Arch Vaza).",
        ],
      },
      {
        h2: "Ostavi prazan prostor",
        p: [
          "Prazan prostor je deo kompozicije. Skulpturalni komadi najbolje izgledaju kada imaju prostora oko sebe, pa je bolje manje predmeta nego preterano pun raf.",
        ],
      },
      {
        h2: "Ponovi jednu boju",
        p: [
          "Ako su komadi različitih oblika, ujedini ih bojom: tri komada u beloj, beži ili crnoj boji deluju kao uigran set. Jedan akcenat (roze, maslinasto zelena ili crvena) daje živost.",
        ],
      },
      {
        h2: "Dodaj prirodni element",
        p: [
          "Grana suvog cveća ili pampas trava u vazi unosi teksturu i mekoću uz čvrste forme skulptura.",
        ],
      },
    ],
    related: [
      { label: "Vaze", href: "/kategorija/vaze" },
      { label: "Figure", href: "/kategorija/figure" },
      { label: "Svećnjaci", href: "/kategorija/svecnjaci" },
    ],
    keywords: [
      "kako ukrasiti policu",
      "dekoracija komode",
      "dekoracija za dnevnu sobu",
      "minimalistička dekoracija",
    ],
    published: "2026-10-21",
  },
  {
    slug: "pokloni-za-novu-godinu-do-2000-dinara",
    title: "Pokloni za Novu godinu do 2.000 dinara: 17 ideja",
    description:
      "17 ideja za poklon za Novu godinu do 2.000 dinara: svećnjaci, figure i vaze za dom. Šta izabrati za mamu, prijatelja, kolegu i partnera.",
    intro:
      "Novogodišnji pokloni ne moraju da budu skupi da bi bili lepi. Dekoracija za dom je siguran izbor: ne zavisi od uzrasta, ne zauzima mnogo mesta i ostaje na polici dugo posle praznika. Evo 17 ideja do 2.000 dinara, razvrstanih po tome kome poklanjaš.",
    sections: [
      {
        h2: "Za mamu, baku i drugaricu",
        p: [
          "Srce Svećnjak je mali gest sa velikim značenjem. Hvatač Svetlosti lomi svetlost LED svećice u sitne odsjaje po zidu i dobar je za one koje vole atmosferu. Vaza Luna ima oblik polumeseca i, uz granu suve trave, deluje kao gotov aranžman. Figura sa Srcem je za sentimentalne. To su četiri ideje.",
        ],
      },
      {
        h2: "Za partnera ili partnerku",
        p: [
          "Zaljubljeni Par i Zagrljaj Ljubavi su apstraktne figure o bliskosti, bez lica i detalja. Za parove koji vole mačke postoje Zaljubljene Mace. To su još tri ideje.",
        ],
      },
      {
        h2: "Za prijatelje, kolege i radni sto",
        p: [
          "Mislilac je sedeća figura u pozi razmišljanja i lepo stoji na radnom stolu ili polici sa knjigama. Maska je dekorativna skulptura za policu ili zid. Labrador je za vlasnike pasa. To su tri ideje za nekoga koga ne poznaješ previše, a želiš da mu poklon bude upečatljiv.",
        ],
      },
      {
        h2: "Za ljubitelje mačaka",
        p: [
          "Maca, Uspavana Maca i Maca Mreža su tri različite figure mačke, od uspravne do sklupčane. Za ljubitelje mačaka dovoljno je izabrati koja odgovara njihovoj mački.",
        ],
      },
      {
        h2: "Za novi dom i jeftinije komade",
        p: [
          "Natpis HOME je lep poklon za one koji se useljavaju ili tek uređuju stan. Bubble Svećnjak počinje od 700 dinara i staje na dlan, pa je odličan sitan poklon za više osoba odjednom. Rebrasti Svećnjak, od 1.000 dinara, ima vertikalna rebra koja bacaju pravilne senke. Spiralni Svećnjak je skulpturalan i kada nije upaljen.",
        ],
      },
      {
        h2: "Kada poručiti",
        p: [
          `Komadi se štampaju po porudžbini. Izrada i dostava obično traju ${DELIVERY}, a pred praznike ${SITE.deliveryTimeBusy}, pa porudžbinu ostavi do sredine decembra. Plaćanje je pouzećem, a besplatna dostava važi preko 6.000 dinara.`,
        ],
      },
    ],
    related: [
      { label: "Pokloni do 2.000 dinara", href: "/pokloni/pokloni-do-2000-dinara" },
      { label: "Pokloni za Novu godinu", href: "/pokloni/pokloni-za-novu-godinu" },
      { label: "Pokloni za Božić", href: "/pokloni/pokloni-za-bozic" },
      { label: "Svi svećnjaci", href: "/kategorija/svecnjaci" },
    ],
    keywords: [
      "pokloni za Novu godinu do 2000 dinara",
      "jeftini pokloni za Novu godinu",
      "ideje za poklon za Novu godinu",
    ],
    published: "2026-10-22",
  },
  {
    slug: "materice-i-oci-sta-pokloniti",
    title: "Materice i Oci: šta pokloniti mami i tati",
    description:
      "Materice 27. decembra 2026, Oci 3. januara 2027: šta pokloniti mami i tati, kako izabrati dekoraciju za dom i do kada poručiti da stigne na vreme.",
    intro:
      "Materice i Oci su tradicionalni dani majki i očeva u Srbiji, pred pravoslavni Božić. Poklon za roditelje najbolje je da bude nešto što će stajati na vidnom mestu.",
    sections: [
      {
        h2: "Kada su Detinjci, Materice i Oci",
        p: [
          "Detinjci, Materice i Oci su tri nedelje pred Božić: Detinjci treće, Materice druge, Oci poslednje nedelje pre praznika. Pravoslavni Božić je 7. januara, pa su ove godine Detinjci 20. decembra, Materice 27. decembra 2026, a Oci 3. januara 2027. U Srbiji upravo Materice imaju ulogu Dana majki.",
        ],
      },
      {
        h2: "Šta pokloniti mami",
        p: [
          "Mama obično dobije ono što je praktično, a retko nešto samo lepo. Vaza za suvo cveće, kao što je Harmony ili List, ne puni se vodom, pa stoji na polici i uz granu suve trave. Srce Svećnjak i Figura sa Srcem su sitan, topao gest. Ako voli biljke, Drvo Saksija je za sukulente i manje biljke.",
        ],
      },
      {
        h2: "Šta pokloniti tati",
        p: [
          "Za tatu su najbolje figure koje stoje na radnom stolu ili polici sa knjigama: Mislilac, Labrador za ljubitelje pasa ili Maska za one koji vole umetnost. Rebrasti i Spiralni Svećnjak su pogodni za dnevnu sobu.",
        ],
      },
      {
        h2: "Kako izabrati boju",
        p: [
          "Bela, bež i siva uklapaju se u većinu domova. Crna daje kontrast, a roze i maslinasto zelena su toplije i prirodnije. Ako ne znaš koja boja odgovara, pitaj nekoga ko često viđa dom roditelja ili izaberi neutralnu.",
        ],
      },
      {
        h2: "Do kada poručiti",
        p: [
          `Komadi se štampaju po porudžbini. Izrada i dostava obično traju ${DELIVERY}, a pred praznike ${SITE.deliveryTimeBusy}, pa porudžbinu ostavi do sredine decembra.`,
        ],
      },
    ],
    related: [
      { label: "Pokloni za Materice i Oce", href: "/pokloni/poklon-za-materice" },
      { label: "Poklon za mamu", href: "/pokloni/poklon-za-mamu" },
      { label: "Pokloni za Božić", href: "/pokloni/pokloni-za-bozic" },
      { label: "Sve figure", href: "/kategorija/figure" },
    ],
    keywords: ["šta pokloniti za Materice", "Materice 2026", "pokloni za Oce", "Oci 2027"],
    published: "2026-10-22",
  },
  {
    slug: "kako-ukrasiti-dom-za-novu-godinu-i-bozic",
    title: "Kako ukrasiti dom za praznike bez klasičnih ukrasa",
    description:
      "Kako ukrasiti dom za Novu godinu i Božić bez klasičnih ukrasa: svećnjaci, suve grane u vazi i toplo svetlo. Ideje za sto, policu i komodu.",
    intro:
      "Ne mora svaki praznik da znači lampice i kuglice. Dom može da izgleda svečano i sa nekoliko dobro odabranih detalja: toplim svetlom, jednom ili dve grane u vazi i stolom koji je uređen, a ne pretrpan.",
    sections: [
      {
        h2: "Počni od svetla",
        p: [
          "Svećnjaci su najbrži način da se prostor promeni. Hvatač Svetlosti lomi svetlost LED svećice u sitne odsjaje po zidu, pa najbolje deluje u zatamnjenoj sobi. Spiralni i Rebrasti Svećnjak su skulpturalni i kada svećica nije upaljena. Srce Svećnjak je za jednu LED svećicu.",
          "Svećnjaci su namenjeni isključivo LED svećicama i ne smeju se koristiti sa otvorenim plamenom.",
        ],
      },
      {
        h2: "Jedna grana u vazi",
        p: [
          "Umesto bujnog buketa, probaj jednu do tri suve grane u vazi na komodi ili stolu. Lumora vaze su ukrasne i ne pune se vodom, pa aranžman traje ceo praznik i duže. Arch, Donut i Spiralna vaza su skulpturalne i dobre za ovakav minimalistički pristup.",
        ],
      },
      {
        h2: "Izaberi paletu",
        p: [
          "Za praznično, a ne preterano, drži se dve ili tri boje: crvena i bela za jasnu poruku, bež i siva za mirniji izgled, ili crna za kontrast uz sveće. Komadi se štampaju u 7 boja, pa lako možeš da složiš paletu.",
        ],
      },
      {
        h2: "Raspored za sto i komodu",
        p: [
          "Na sredinu stola stavi dva ili tri svećnjaka različitih visina i jednu vazu sa granom. Na komodi dovoljna je grupa od tri predmeta: vaza, svećnjak i mala figura. Više o rasporedu pročitaj u vodiču o tome kako ukrasiti policu i komodu.",
        ],
      },
      {
        h2: "Poklon koji je i dekoracija",
        p: [
          `Ako tražiš i poklon i ukras u jednom, svećnjak ili vaza rade oba posla. Komadi se štampaju po porudžbini. Izrada i dostava obično traju ${DELIVERY}, a pred praznike ${SITE.deliveryTimeBusy}, pa porudžbinu ostavi do sredine decembra.`,
        ],
      },
    ],
    related: [
      { label: "Svi svećnjaci", href: "/kategorija/svecnjaci" },
      { label: "Sve vaze", href: "/kategorija/vaze" },
      { label: "Kako ukrasiti policu i komodu", href: "/vodic/kako-ukrasiti-policu-i-komodu" },
      { label: "Pokloni za Božić", href: "/pokloni/pokloni-za-bozic" },
    ],
    keywords: [
      "dekoracija za Novu godinu",
      "dekoracija za Božić",
      "kako ukrasiti dom za praznike",
      "svećnjaci za sto",
    ],
    published: "2026-10-22",
  },
  {
    slug: "da-li-se-3d-stampana-vaza-puni-vodom",
    title: "Da li se 3D štampana vaza puni vodom?",
    description:
      "Da li se 3D štampana vaza puni vodom? Ne: Lumora vaze su ukrasne, za suvo cveće i pampas travu. Šta staviti u vazu umesto vode i kako da aranžman traje.",
    intro:
      "Kratak odgovor: ne. Lumora vaze su ukrasne i ne pune se vodom. To nije mana, nego način da ih koristiš: suvo cveće i pampas trava traju mesecima i ne traže zalivanje, a vaza i prazna izgleda kao skulptura.",
    sections: [
      {
        h2: "Šta staviti u vazu umesto vode",
        p: [
          "Suvo cveće, pampas travu, klasje, suve grane ili grančice. Nekoliko vitkih grana izgleda elegantnije od gustog buketa, naročito u vazama sa upečatljivim oblikom, kao što su Arch, Donut ili Spiralna vaza.",
        ],
      },
      {
        h2: "Vaza i bez cveća",
        p: [
          "Mnoge Lumora vaze su napravljene da deluju i kada su prazne: lučni otvor, krug sa otvorenom sredinom, mehurići, spirala. Postavi ih na komodu, policu ili sto kao malu skulpturu.",
        ],
      },
      {
        h2: "Kako da aranžman traje",
        p: [
          "Drži suvo cveće dalje od vlage i direktnog sunca, koje može da izbledi boju. Pampas ostavlja vlakna, pa ga pre postavljanja protresi napolju. Vazu čisti suvom ili blago vlažnom krpom.",
        ],
      },
      {
        h2: "A ako želiš sveže cveće?",
        p: [
          "Za sveže cveće koristi običnu staklenu vazu, a Lumora vazu ostavi kao ukras pored nje. Tako dobijaš oba efekta, a vaza se ne dovodi u kontakt sa vodom.",
        ],
      },
    ],
    related: [
      { label: "Sve vaze", href: "/kategorija/vaze" },
      { label: "Kako izabrati vazu za suvo cveće", href: "/vodic/kako-izabrati-vazu-za-suvo-cvece" },
      { label: "Kako održavati 3D štampane dekoracije", href: "/vodic/kako-odrzavati-3d-stampane-dekoracije" },
    ],
    keywords: [
      "da li se 3D štampana vaza puni vodom",
      "vaza za suvo cveće",
      "šta staviti u vazu umesto vode",
    ],
    published: "2026-10-23",
  },
  {
    slug: "dekoracija-radnog-stola-ideje",
    title: "Dekoracija radnog stola: 8 ideja",
    description:
      "8 ideja za dekoraciju radnog stola: mala figura, vaza sa suvom granom, sukulent u saksiji i natpis. Kako da sto izgleda uređeno, a ostane funkcionalan.",
    intro:
      "Dobro uređen radni sto ne mora da bude prazan, ali ne sme da bude pretrpan. Dovoljno je dva ili tri predmeta koja ti prijaju svaki put kad podigneš pogled sa ekrana. Evo osam ideja koje se lako kombinuju.",
    sections: [
      {
        h2: "Figure koje daju karakter",
        p: [
          "Mislilac je sedeća figura u pozi razmišljanja i najčešći je izbor za radni sto i biblioteku. Za ljubitelje životinja tu su Maca, Uspavana Maca i Labrador. Maska je za one koji vole umetnost i etno detalje. To su četiri ideje.",
        ],
      },
      {
        h2: "Zelenilo",
        p: [
          "Drvo Saksija ima oblik stilizovanog stabla, otvor za drenažu i namenjena je sukulentima i manjim biljkama. Peta ideja za sto koji dobija malo prirode.",
        ],
      },
      {
        h2: "Vaza sa suvom granom",
        p: [
          "Jedna vitka suva grana u Harmony ili Donut vazi dovoljna je za mirniji sto. Vaza se ne puni vodom, pa nema zalivanja ni prosipanja. To je šesta ideja.",
        ],
      },
      {
        h2: "Natpis i svetlo",
        p: [
          "Natpis HOME unosi domaći osećaj i u kućnoj kancelariji. Rebrasti svećnjak sa LED svećicom daje toplo svetlo uvečer. To su sedma i osma ideja.",
        ],
      },
      {
        h2: "Pravila da sto ostane funkcionalan",
        p: [
          "Drži se najviše tri predmeta. Visine neka se razlikuju: niža figura ispred, vaza ili biljka pozadi. U neutralnim bojama dekoracija se stapa sa stolom, a crna ili maslinasto zelena daju kontrast.",
        ],
      },
    ],
    related: [
      { label: "Dekoracija za radnu sobu", href: "/dekoracija/dekoracija-za-radnu-sobu" },
      { label: "Sve figure", href: "/kategorija/figure" },
      { label: "Poklon za muškarca", href: "/pokloni/poklon-za-muskarca" },
    ],
    keywords: ["dekoracija radnog stola", "ukrasi za radni sto", "ideje za radni sto"],
    published: "2026-10-23",
  },
];

export const getGiftPage = (slug: string) => GIFT_PAGES.find((g) => g.slug === slug);
export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
