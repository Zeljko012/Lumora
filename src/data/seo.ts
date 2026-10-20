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
          "3D štampa omogućava forme koje se teško pravi klasičnom proizvodnjom: otvoreni krugovi, spiralne teksture, rebra i mehurići. Svaka vaza se štampa po porudžbini, sloj po sloj, od eko PLA materijala, u boji koju izabereš — bela, bež, siva, crna, roze, maslinasto zelena ili crvena.",
        ],
      },
      {
        h2: "Važna napomena o upotrebi",
        p: [
          "Vaze su namenjene suvom cveću, pampas travi i samostalnoj dekoraciji i nisu vodootporne. Čiste se suvom ili blago vlažnom krpom; izbegavaj direktno sunce i izvore toplote.",
        ],
      },
    ],
    faqs: [
      {
        q: "Da li se u ove vaze stavlja voda?",
        a: "Ne. Vaze su namenjene suvom cveću, pampas travi i dekoraciji i nisu vodootporne.",
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
    ],
    related: [
      { label: "Kako izabrati vazu za suvo cveće", href: "/vodic/kako-izabrati-vazu-za-suvo-cvece" },
      { label: "Poklon za useljenje u novi stan", href: "/pokloni/poklon-za-useljenje" },
      { label: "Kako ukrasiti policu i komodu", href: "/vodic/kako-ukrasiti-policu-i-komodu" },
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
          "Svaka figura se štampa po porudžbini od eko PLA materijala u boji po izboru (7 boja). Crna figura daje jak kontrast na svetlim policama, dok se bela i bež tiho uklapaju u minimalistički enterijer.",
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
    ],
    related: [
      { label: "Poklon za ljubitelje mačaka", href: "/pokloni/poklon-za-ljubitelje-macaka" },
      { label: "Poklon za godišnjicu", href: "/pokloni/poklon-za-godisnjicu" },
      { label: "Pokloni do 2.000 dinara", href: "/pokloni/pokloni-do-2000-dinara" },
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
    title: "Dekorativni svećnjaci – moderni 3D štampani svećnjaci",
    h1: "Dekorativni svećnjaci za toplu atmosferu",
    description:
      "{count} modernih 3D štampanih svećnjaka — Bubble, Rebrasti, Spiralni, Srce i Hvatač svetlosti. 7 boja, od {from}. Plaćanje pouzećem, dostava po Srbiji.",
    sections: [
      {
        h2: "Svećnjaci koji oblikuju svetlo",
        p: [
          "Dobar svećnjak radi i kada sveća ne gori. Mehurići, rebra, spirale i srce bacaju na zid zanimljive senke i odsjaje, a Hvatač svetlosti lomi plamen u desetine sitnih tačaka. Savršeni su za dnevni boravak, trpezarijski sto i večernju atmosferu.",
        ],
      },
      {
        h2: "Bezbedno korišćenje",
        p: [
          "Svećnjaci su štampani od PLA materijala, koji ne podnosi visoku temperaturu. Koristi čajne ili LED svećice u njihovom držaču i nikada ne ostavljaj upaljenu sveću bez nadzora.",
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
        a: "Preporučujemo čajne ili LED svećice u njihovom držaču. Plamen ne sme dugo da bude u direktnom kontaktu sa materijalom, a upaljenu sveću ne treba ostavljati bez nadzora.",
      },
      {
        q: "Da li svećnjaci dolaze u više boja?",
        a: "Da, u 7 boja: bela, bež, siva, crna, roze, maslinasto zelena i crvena.",
      },
      {
        q: "Koji svećnjak je dobar poklon?",
        a: "Srce Svećnjak je popularan izbor za godišnjicu i Dan zaljubljenih, a Bubble Svećnjak je najpristupačniji — idealan kao mali poklon.",
      },
    ],
    related: [
      { label: "Poklon za godišnjicu i zaljubljene", href: "/pokloni/poklon-za-godisnjicu" },
      { label: "Kako održavati 3D štampane dekoracije", href: "/vodic/kako-odrzavati-3d-stampane-dekoracije" },
    ],
    keywords: [
      "svećnjak",
      "dekorativni svećnjak",
      "moderni svećnjak",
      "svećnjak za čajne svećice",
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
    ],
    related: [
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

export const GIFT_PAGES: GiftPage[] = [
  {
    slug: "poklon-za-useljenje",
    title: "Poklon za useljenje u novi stan – ideje i dekoracije",
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
    title: "Poklon za godišnjicu i Dan zaljubljenih",
    h1: "Poklon za godišnjicu i zaljubljene",
    description:
      "Romantični pokloni za godišnjicu i Dan zaljubljenih: parovi u zagrljaju, figura sa srcem, svećnjak u obliku srca. 3D štampano u Srbiji, od {from}.",
    intro: [
      "Za godišnjicu, Dan zaljubljenih ili bez posebnog razloga, mala skulptura o bliskosti poklanja se lako i ostaje dugo. Ne vene, ne zahteva negu i svaki put kad prođeš pored polica podseća na osobu koja ti ju je poklonila.",
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
      "Kako da očuvaš 3D štampane vaze, figure i svećnjake: čišćenje, temperatura, sunce, voda i bezbedno korišćenje sveća.",
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
          "Koristi čajne ili LED svećice u njihovom držaču, a upaljenu sveću nikada ne ostavljaj bez nadzora. Plamen ne sme dugo da bude u direktnom kontaktu sa materijalom.",
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
];

export const getGiftPage = (slug: string) => GIFT_PAGES.find((g) => g.slug === slug);
export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
