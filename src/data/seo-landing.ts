/**
 * Dodatne SEO landing stranice izvedene iz istraživanja ključnih reči za Srbiju
 * (Perplexity, 21.10.2026.) — v. docs/seo-keyword-research.md.
 *
 * - EXTRA_GIFT_PAGES  -> /pokloni/<slug>
 * - THEME_PAGES       -> /dekoracija/<slug>
 *
 * Isti oblik kao GiftPage u seo.ts. Tokeni: {from} {to} {count}.
 */
import type { GiftPage } from "./seo";
import { SITE } from "./site";

const DELIVERY = SITE.deliveryTime;

export const EXTRA_GIFT_PAGES: GiftPage[] = [
  {
    slug: "3d-stampani-pokloni",
    title: "3D štampani pokloni – originalne dekoracije za dom",
    h1: "3D štampani pokloni",
    description:
      "3D štampani pokloni za svaku priliku: vaze, figure, svećnjaci i saksije. Izrađeno u Srbiji po porudžbini, 7 boja, od {from}. Plaćanje pouzećem.",
    intro: [
      "3D štampa omogućava poklone kakve teško nalaziš u klasičnim prodavnicama: skulpture sa otvorenim krugovima, spiralne teksture i apstraktne forme, štampane po tvojoj porudžbini u boji koju izabereš.",
      "Izdvojili smo komade koji se najlakše poklanjaju: vaze za suvo cveće, figure, svećnjake i saksije. Svaki je izrađen u Srbiji od PLA materijala.",
    ],
    products: [
      "donut-vaza",
      "spiralna-vaza",
      "maca-figura",
      "zaljubljeni-par-figura",
      "figura-sa-srcem",
      "srce-svecnjak",
      "bubble-svecnjak",
      "hvatac-svetlosti-svecnjak",
      "drvo-saksija",
      "home-figura",
      "labrador-figura",
      "mislilac-figura",
    ],
    tips: {
      h2: "Zašto je 3D štampan poklon dobar izbor",
      p: [
        "Originalan je jer su forme drugačije od masovne ponude, lagan je i ne zahteva negu, a boju biraš prema primaocu. Pošto se štampa po porudžbini, ne dobijaš komad sa police nego komad napravljen za tebe.",
      ],
    },
    faqs: [
      {
        q: "Šta je 3D štampani poklon?",
        a: "To je predmet napravljen 3D štampom, sloj po sloj, na osnovu digitalnog modela. Naši komadi se štampaju u Srbiji od PLA materijala.",
      },
      {
        q: "Da li se poklon štampa po porudžbini?",
        a: `Da. Komad se štampa u boji koju izabereš, a dostava traje ${DELIVERY} od potvrde porudžbine.`,
      },
      {
        q: "Koliko košta 3D štampani poklon?",
        a: "Od {from} do {to}. Besplatna dostava važi za porudžbine preko 6.000 RSD.",
      },
    ],
    keywords: [
      "3D štampani pokloni",
      "3D štampana dekoracija",
      "originalan poklon",
      "unikatan poklon za dom",
    ],
  },
  {
    slug: "poklon-za-dan-zaljubljenih",
    title: "Poklon za Dan zaljubljenih – romantični 3D pokloni",
    h1: "Poklon za Dan zaljubljenih",
    description:
      "Poklon za Dan zaljubljenih (Valentinovo): srce svećnjak, figura sa srcem, parovi u zagrljaju. 3D štampano u Srbiji, 7 boja, od {from}. Dostava po Srbiji.",
    intro: [
      "Dan zaljubljenih je 14. februara, a najbolji pokloni su oni koji ostaju i posle tog dana. Skulptura ili svećnjak u obliku srca stoji na polici ili noćnom ormariću i svaki dan podseća na osobu koja ga je poklonila.",
      "Srce Svećnjak je najpristupačniji izbor, dok apstraktni parovi u zagrljaju i Figura sa Srcem daju svečaniji utisak. Svaki komad se štampa u boji koju izabereš — crvena za jasnu poruku, bela ili bež za diskretniji poklon.",
    ],
    products: [
      "srce-svecnjak",
      "figura-sa-srcem",
      "zaljubljeni-par-figura",
      "zagrljaj-ljubavi-figura",
      "zaljubljene-mace-figura",
      "hvatac-svetlosti-svecnjak",
      "home-roze-figura",
    ],
    tips: {
      h2: "Kada da poručiš za 14. februar",
      p: [
        `Komadi se štampaju po porudžbini, a dostava traje ${DELIVERY}, pa porudžbinu ostavi bar nedelju do dve pre 14. februara da bi poklon stigao na vreme.`,
      ],
    },
    faqs: [
      {
        q: "Šta pokloniti za Dan zaljubljenih?",
        a: "Srce Svećnjak, Figuru sa Srcem ili skulpturu para u zagrljaju — sve u boji po izboru.",
      },
      {
        q: "Koliko košta poklon za Valentinovo?",
        a: "Od {from} do {to}. Besplatna dostava važi za porudžbine preko 6.000 RSD.",
      },
      {
        q: "Koja boja je najbolja za romantičan poklon?",
        a: "Crvena i roze su najdirektnije, a bela, bež i siva su elegantne i uklapaju se u svaki enterijer.",
      },
    ],
    keywords: [
      "poklon za Dan zaljubljenih",
      "poklon za Valentinovo",
      "romantičan poklon",
      "poklon za devojku",
    ],
  },
  {
    slug: "poklon-za-8-mart",
    title: "Poklon za 8. mart i za mamu – ideje i dekoracije",
    h1: "Poklon za 8. mart i za mamu",
    description:
      "Poklon za 8. mart i za mamu: moderne vaze, svećnjaci i figure sa srcem. 3D štampano u Srbiji, 7 boja, od {from}. Plaćanje pouzećem.",
    intro: [
      "Za 8. mart i Dan majki poklon ne mora da bude buket koji uvene za nekoliko dana. Vaza ili svećnjak koji ostaje u kući svaki dan podseća na pažnju — a uz njih se lako dodaje grana sušenog cveća ili pampas trava.",
      "U izboru su moderne vaze za suvo cveće, svećnjaci koji lepo oblikuju svetlo i figure koje poručuju pažnju bez mnogo reči. Boju biraš po ukusu mame, koleginice ili drugarice.",
    ],
    products: [
      "list-vaza",
      "harmony-vaza",
      "donut-vaza",
      "spiralna-vaza",
      "vaza-luna",
      "srce-svecnjak",
      "bubble-svecnjak",
      "hvatac-svetlosti-svecnjak",
      "figura-sa-srcem",
    ],
    tips: {
      h2: "Kako izabrati poklon za mamu",
      p: [
        "Ako ne znaš koji stil voli, biraj neutralnu boju (bela, bež) i vazu jednostavnog oblika. Za mamu koja voli biljke dobar je izbor List Vaza ili Spiralna Vaza, a za onu koja voli ambijent sveća — Hvatač Svetlosti Svećnjak.",
      ],
    },
    faqs: [
      {
        q: "Šta pokloniti mami za 8. mart?",
        a: "Vazu za suvo cveće ili svećnjak — dekoraciju koja traje i uklapa se u dom. Uz vazu možeš dodati sušeno cveće ili pampas travu.",
      },
      {
        q: "Koliko košta poklon za 8. mart?",
        a: "Od {from} do {to}. Besplatna dostava važi za porudžbine preko 6.000 RSD.",
      },
      {
        q: "Koliko ranije treba poručiti?",
        a: `Dostava traje ${DELIVERY} od potvrde porudžbine, pa poruči bar nedelju do dve ranije, jer su dani pred 8. mart najopterećeniji.`,
      },
    ],
    keywords: [
      "poklon za 8. mart",
      "pokloni za 8. mart",
      "poklon za mamu",
      "poklon za Dan majki",
    ],
  },
  {
    slug: "poklon-za-rodjendan",
    title: "Poklon za rođendan – originalne dekoracije za dom",
    h1: "Poklon za rođendan",
    description:
      "Originalan poklon za rođendan: figure, vaze, svećnjaci i saksije. 3D štampano u Srbiji, 7 boja, od {from}. Plaćanje pouzećem, dostava po Srbiji.",
    intro: [
      "Rođendanski poklon treba da bude lično pogođen, a ne generičan. Dekorativni predmet iz ove ponude to omogućava: biraš oblik koji odgovara ukusu slavljenika i boju koja se uklapa u njegov dom.",
      "Od sitnog Bubble Svećnjaka do veće vaze ili skulpture — ima izbora za svaki budžet i svaki karakter.",
    ],
    products: [
      "bubble-svecnjak",
      "rebrasti-svecnjak",
      "maca-figura",
      "labrador-figura",
      "mislilac-figura",
      "maska-figura",
      "donut-vaza",
      "drvo-saksija",
      "home-roze-figura",
    ],
    tips: {
      h2: "Kako izabrati poklon prema ukusu",
      p: [
        "Za ljubitelje životinja biraj figuru mačke ili labradora, za one koji vole biljke saksiju, a za ljubitelje umetnosti Mislioca ili Masku. Minimalistima odgovara Arch ili Donut Vaza u beloj ili beži boji.",
      ],
    },
    faqs: [
      {
        q: "Koji poklon za rođendan do 2.000 dinara?",
        a: "Figure, svećnjaci i natpis HOME koštaju do 2.000 dinara. Pogledaj kompletnu ponudu pokloni do 2.000 dinara.",
      },
      {
        q: "Da li mogu da izaberem boju?",
        a: "Da, svaki komad dolazi u 7 boja: bela, bež, siva, crna, roze, maslinasto zelena i crvena.",
      },
      {
        q: "Koliko košta rođendanski poklon?",
        a: "Od {from} do {to}. Plaćanje je pouzećem.",
      },
    ],
    keywords: ["poklon za rođendan", "unikatan poklon", "originalan poklon", "dekorativni poklon"],
  },
  {
    slug: "pokloni-za-novu-godinu",
    title: "Pokloni za Novu godinu – dekoracije za dom",
    h1: "Pokloni za Novu godinu i praznike",
    description:
      "Pokloni za Novu godinu i praznike: svećnjaci, vaze i figure za dom. 3D štampano u Srbiji, 7 boja, od {from}. Plaćanje pouzećem, dostava po Srbiji.",
    intro: [
      "Praznici su vreme za toplu atmosferu, a svećnjak je njen najjednostavniji simbol. Dekorativni svećnjaci, vaze i figure su pokloni koji ostaju u domu i posle praznika.",
      "Svaki komad se štampa u boji koju izabereš, pa se lako uklapa u praznični ili svakodnevni enterijer.",
    ],
    products: [
      "hvatac-svetlosti-svecnjak",
      "spiralni-svecnjak",
      "rebrasti-svecnjak",
      "bubble-svecnjak",
      "srce-svecnjak",
      "duo-vaza",
      "duet-vaza",
      "arch-vaza",
      "zaljubljeni-par-figura",
    ],
    tips: {
      h2: "Kada poručiti pred praznike",
      p: [
        `Praznici su period velike potražnje. Pošto se komadi štampaju po porudžbini, a dostava traje ${DELIVERY}, porudžbinu ostavi bar deset dana ranije.`,
      ],
    },
    faqs: [
      {
        q: "Koji je najbolji novogodišnji poklon za dom?",
        a: "Svećnjak ili vaza za suvo cveće — dekoracija koja stvara atmosferu i ne zahteva negu.",
      },
      {
        q: "Koliko košta?",
        a: "Od {from} do {to}. Besplatna dostava važi za porudžbine preko 6.000 RSD.",
      },
      {
        q: "Koje sveće mogu da koristim u svećnjacima?",
        a: "Samo LED svećice. Svećnjaci su štampani od PLA materijala koji ne podnosi toplotu, pa se ne smeju koristiti sa otvorenim plamenom.",
      },
    ],
    keywords: [
      "pokloni za Novu godinu",
      "novogodišnji pokloni",
      "poklon za Božić",
      "svećnjak za poklon",
    ],
  },
  {
    slug: "poklon-za-mamu",
    title: "Poklon za mamu – ideje za rođendan i Materice",
    h1: "Poklon za mamu",
    description:
      "Poklon za mamu: moderne vaze za suvo cveće, svećnjaci i figure sa srcem. 3D štampano u Srbiji, 7 boja, od {from}. Plaćanje pouzećem.",
    intro: [
      "Dobar poklon za mamu je onaj koji raduje svaki dan, a ne samo kada se uruči. Vaza, svećnjak ili mala figura stoje na polici ili komodi i dugo podsećaju na pažnju — bez održavanja i bez uvenuća.",
      "Za mame koje vole cveće tu su vaze za suvo cveće i pampas travu: ne pune se vodom, pa aranžman traje mesecima. Za one koje vole mir i svetlost, svećnjaci. Za sentimentalne, figura sa srcem. Boju biraš po njenom ukusu i domu.",
    ],
    products: [
      "list-vaza",
      "harmony-vaza",
      "vaza-luna",
      "donut-vaza",
      "drvo-saksija",
      "srce-svecnjak",
      "rebrasti-svecnjak",
      "hvatac-svetlosti-svecnjak",
      "figura-sa-srcem",
    ],
    tips: {
      h2: "Kako izabrati poklon za mamu",
      p: [
        "Ako mama voli biljke, izaberi Drvo saksiju ili vazu uz granu suve trave. Ako voli uređen dom i police, Harmony ili List vaza u neutralnoj boji uklopiće se uz sve. Ako voli atmosferu, tu su Srce i Rebrasti svećnjak. Za mamu koja ima sve, najbolja je sitna, lepa stvar koju još nema.",
        `Komadi se štampaju po porudžbini. Izrada i dostava obično traju ${DELIVERY}, a u vreme praznika ${SITE.deliveryTimeBusy}, pa porudžbinu ostavi bar dve nedelje pre rođendana ili praznika.`,
      ],
    },
    faqs: [
      {
        q: "Šta pokloniti mami koja ima sve?",
        a: "Sitnu dekoraciju koju još nema: svećnjak, malu figuru ili vazu u boji koja odgovara njenom domu. Najpristupačniji komad košta od {from}.",
      },
      {
        q: "Da li je vaza dobar poklon za mamu?",
        a: "Jeste. Lumora vaze su ukrasne i ne pune se vodom, pa stoje na polici i bez cveća, a uz granu suve trave su gotov aranžman koji ne treba menjati.",
      },
      {
        q: "Koja boja je najsigurnija za poklon?",
        a: "Bela, bež i siva uklapaju se u većinu domova, a roze i maslinasto zelena su toplije i prirodnije.",
      },
      {
        q: "Koliko košta poklon za mamu?",
        a: "Od {from} do {to}. Besplatna dostava važi za porudžbine preko 6.000 RSD.",
      },
    ],
    keywords: ["poklon za mamu", "šta pokloniti mami", "poklon za majku", "poklon za mamu za rođendan"],
  },
  {
    slug: "poklon-za-materice",
    title: "Pokloni za Materice i Oce – ideje i dekoracije",
    h1: "Pokloni za Materice i Oce",
    description:
      "Pokloni za Materice i Oce: vaze, svećnjaci i figure za mamu i tatu. 3D štampano u Srbiji, 7 boja, od {from}. Plaćanje pouzećem.",
    intro: [
      "Materice i Oci su tradicionalni dani majki i očeva u Srbiji. Slave se u nedelje pred pravoslavni Božić (7. januar): Detinjci treće, Materice druge, a Oci poslednje nedelje pred praznik. Ove godine Materice su 27. decembra 2026, a Oci 3. januara 2027.",
      "Poklon ne mora da bude veliki, ali treba da ostane: vaza, svećnjak ili figura koja stoji na vidnom mestu. U izboru su komadi za mame i za tate, u boji koju sam biraš.",
    ],
    products: [
      "harmony-vaza",
      "vaza-luna",
      "list-vaza",
      "srce-svecnjak",
      "figura-sa-srcem",
      "mislilac-figura",
      "labrador-figura",
      "rebrasti-svecnjak",
      "spiralni-svecnjak",
    ],
    tips: {
      h2: "Do kada poručiti za Materice i Oce",
      p: [
        `Komadi se štampaju po porudžbini. Izrada i dostava obično traju ${DELIVERY}, a pred praznike ${SITE.deliveryTimeBusy}, pa porudžbinu ostavi do sredine decembra.`,
        "Za mamu su pogodne vaze za suvo cveće, svećnjaci i figura sa srcem. Za tatu, Mislilac za radni sto, Labrador za ljubitelje pasa i svećnjaci čistih linija.",
      ],
    },
    faqs: [
      {
        q: "Kada su Materice 2026?",
        a: "Materice su druga nedelja pre Božića, što je 27. decembra 2026. Oci su 3. januara 2027, a Detinjci 20. decembra 2026.",
      },
      {
        q: "Šta pokloniti mami za Materice?",
        a: "Vazu za suvo cveće, svećnjak ili figuru sa srcem. Sve se štampa u boji koju izabereš, a najpristupačniji komad košta od {from}.",
      },
      {
        q: "Šta pokloniti tati za Oce?",
        a: "Figuru za radni sto kao što je Mislilac, Labrador za ljubitelje pasa ili svećnjak čistih linija.",
      },
      {
        q: "Do kada da poručim da poklon stigne na vreme?",
        a: "Najbolje do sredine decembra. Komadi se štampaju po porudžbini, a pred praznike izrada i dostava traju 5–7 radnih dana.",
      },
    ],
    keywords: ["pokloni za Materice", "šta pokloniti za Materice", "pokloni za Oce", "Materice poklon za mamu"],
  },
  {
    slug: "pokloni-za-bozic",
    title: "Pokloni za Božić – dekoracije za dom i porodicu",
    h1: "Pokloni za Božić",
    description:
      "Pokloni za Božić: svećnjaci, vaze i figure za porodicu i dom. 3D štampano u Srbiji, 7 boja, od {from}. Plaćanje pouzećem.",
    intro: [
      "Za Božić se okuplja cela porodica, pa je poklon za dom ili domaćina pogodan za sve: ne zavisi od uzrasta i ne zauzima mnogo mesta. Svećnjak sa toplim odsjajima ili vaza na stolu odmah menjaju atmosferu praznične sobe.",
      "U izboru su svećnjaci koji lepo oblikuju svetlost, vaze za suvo cveće i figure za komodu. Boju biraš po domu u koji poklon ide: crvena i bela su praznične, a bež i siva diskretne.",
    ],
    products: [
      "hvatac-svetlosti-svecnjak",
      "spiralni-svecnjak",
      "rebrasti-svecnjak",
      "srce-svecnjak",
      "bubble-svecnjak",
      "duo-vaza",
      "harmony-vaza",
      "home-figura",
      "home-za-vrata",
    ],
    tips: {
      h2: "Do kada poručiti za Božić",
      p: [
        `Komadi se štampaju po porudžbini. Izrada i dostava obično traju ${DELIVERY}, a pred praznike ${SITE.deliveryTimeBusy}, pa porudžbinu ostavi do 20. decembra.`,
        "Za domaćina najbolje rade svećnjaci i vaza uz granu suve trave. Za porodicu, Duo vaza je set od dve vaze, a natpis HOME je lep poklon za one koji tek uređuju dom.",
      ],
    },
    faqs: [
      {
        q: "Šta pokloniti za Božić?",
        a: "Svećnjak, vazu za suvo cveće ili malu figuru za dom. Sve se štampa u boji koju izabereš, a najpristupačniji komad košta od {from}.",
      },
      {
        q: "Da li prodajete božićne ukrase?",
        a: "Ne pravimo klasične božićne ukrase. Nudimo dekoracije za dom koje se često poklanjaju za praznike: svećnjake, vaze i figure.",
      },
      {
        q: "Koliko košta poklon za Božić?",
        a: "Od {from} do {to}. Besplatna dostava važi za porudžbine preko 6.000 RSD.",
      },
      {
        q: "Do kada poručiti da stigne pre Božića?",
        a: "Za pravoslavni Božić 7. januara najbolje do 20. decembra. Komadi se štampaju po porudžbini, a pred praznike izrada i dostava traju 5–7 radnih dana.",
      },
    ],
    keywords: ["pokloni za Božić", "božićni poklon", "poklon za domaćina", "šta pokloniti za Božić"],
  },
  {
    slug: "poklon-za-muskarca",
    title: "Poklon za muškarca – dekorativni pokloni za dom",
    h1: "Poklon za muškarca",
    description:
      "Poklon za muškarca: figure za radni sto, svećnjaci i vaze čistih linija. 3D štampano u Srbiji, 7 boja, od {from}. Plaćanje pouzećem.",
    intro: [
      "Muškarcima je često najteže birati poklon, jer kažu da im ništa ne treba. Dekoracija koja stoji na radnom stolu ili polici rešava to: ne zauzima mnogo mesta, ne traži održavanje i vidi se svaki dan.",
      "Za ljubitelje umetnosti tu je Mislilac, za vlasnike pasa Labrador, a za čiste linije Rebrasti i Spiralni svećnjak (za LED svećice). Sve se štampa u boji koju izabereš.",
    ],
    products: [
      "mislilac-figura",
      "labrador-figura",
      "maska-figura",
      "rebrasti-svecnjak",
      "spiralni-svecnjak",
      "hvatac-svetlosti-svecnjak",
      "home-figura",
      "harmony-vaza",
    ],
    tips: {
      h2: "Kako izabrati poklon za muškarca",
      p: [
        "Crna, siva i maslinasto zelena su sigurni izbori, a bela ili bež odgovaraju svetlijim prostorima. Ako ne znaš gde će poklon stajati, izaberi figuru: stoji na radnom stolu, polici ili komodi.",
        `Komadi se štampaju po porudžbini. Izrada i dostava obično traju ${DELIVERY}, a pred praznike ${SITE.deliveryTimeBusy}, pa porudžbinu ostavi bar dve nedelje ranije.`,
      ],
    },
    faqs: [
      {
        q: "Šta pokloniti muškarcu koji ima sve?",
        a: "Nešto malo i lepo što još nema: figuru za radni sto, svećnjak čistih linija ili vazu uz granu suve trave. Najpristupačniji komad košta od {from}.",
      },
      {
        q: "Koja boja je najbolja za poklon za muškarca?",
        a: "Crna, siva i maslinasto zelena su najčešći izbor. Bela i bež odgovaraju svetlijem enterijeru.",
      },
      {
        q: "Da li je ovo dobar poklon za kolegu ili šefa?",
        a: "Da. Male figure za radni sto, kao što je Mislilac, su neutralne i uklapaju se u svaku kancelariju.",
      },
      {
        q: "Koliko košta poklon za muškarca?",
        a: "Od {from} do {to}. Besplatna dostava važi za porudžbine preko 6.000 RSD.",
      },
    ],
    keywords: ["poklon za muškarca", "šta pokloniti muškarcu", "poklon za tatu", "poklon za kolegu"],
  },
  {
    slug: "poklon-za-mladence",
    title: "Poklon za mladence – dekoracije za novi dom",
    h1: "Poklon za mladence",
    description:
      "Poklon za mladence i venčanje: figure Zaljubljeni par i Zagrljaj ljubavi, vaze i svećnjaci. 3D štampano u Srbiji, od {from}. Plaćanje pouzećem.",
    intro: [
      "Poklon za mladence treba da ostane i kada prođe slavlje. Dekoracija za dom je siguran izbor: ne dupliraju se kao uređaji, ne zauzimaju mnogo mesta i vezuju se za prvi zajednički dom.",
      "Zaljubljeni Par i Zagrljaj Ljubavi su apstraktne figure o bliskosti, Duet Vaza je jedan komad sa dva otvora, a Duo je set od dve vaze. Boju biraš po domu mladenaca ili boji venčanja.",
    ],
    products: [
      "zaljubljeni-par-figura",
      "zagrljaj-ljubavi-figura",
      "duet-vaza",
      "duo-vaza",
      "srce-svecnjak",
      "figura-sa-srcem",
      "home-figura",
      "harmony-vaza",
    ],
    tips: {
      h2: "Kada poručiti za venčanje",
      p: [
        `Komadi se štampaju po porudžbini. Izrada i dostava obično traju ${DELIVERY}, a u sezoni venčanja i pred praznike ${SITE.deliveryTimeBusy}, pa porudžbinu ostavi bar dve do tri nedelje pre venčanja.`,
        "Za kumove i goste koji se udružuju u poklon, Duo set i figura para su pogodni jer deluju zaokruženo.",
      ],
    },
    faqs: [
      {
        q: "Šta pokloniti mladencima?",
        a: "Figuru para u zagrljaju, set vaza ili svećnjak. Sve se štampa u boji koju izabereš, a najpristupačniji komad košta od {from}.",
      },
      {
        q: "Da li je Zaljubljeni par dobar poklon za venčanje?",
        a: "Da, to je apstraktna figura bez lica i detalja, pa se uklapa u svaki dom. Često se bira za venčanje, veridbu i godišnjicu.",
      },
      {
        q: "Koja boja je najbolja za poklon za mladence?",
        a: "Bela, bež i siva se uklapaju u većinu domova; roze i crvena su romantičnije. Ako znaš boju venčanja, možeš da je ponoviš.",
      },
      {
        q: "Koliko košta poklon za mladence?",
        a: "Od {from} do {to}. Besplatna dostava važi za porudžbine preko 6.000 RSD.",
      },
    ],
    keywords: ["poklon za mladence", "poklon za venčanje", "poklon za veridbu", "poklon za kumove"],
  },
];

export const THEME_PAGES: GiftPage[] = [
  {
    slug: "minimalisticka-dekoracija-za-dom",
    title: "Minimalistička dekoracija za dom – vaze i figure",
    h1: "Minimalistička dekoracija za dom",
    description:
      "Minimalistička dekoracija za dom: skulpturalne vaze, apstraktne figure i čiste forme. 3D štampano u Srbiji, 7 boja, od {from}. Plaćanje pouzećem.",
    intro: [
      "Minimalizam ne znači prazan prostor, nego malo komada sa jasnim oblikom. Skulpturalne vaze i apstraktne figure rade upravo to: jedan komad na polici ili komodi dovoljan je da prostor dobije karakter.",
      "Biraj čiste forme i neutralne boje — belu, bež ili sivu — a jedan komad u crnoj boji daje kontrast.",
    ],
    products: [
      "arch-vaza",
      "harmony-vaza",
      "donut-vaza",
      "split-vaza",
      "mislilac-figura",
      "zagrljaj-ljubavi-figura",
      "zaljubljeni-par-figura",
      "figura-sa-srcem",
      "rebrasti-svecnjak",
      "spiralni-svecnjak",
    ],
    tips: {
      h2: "Kako da minimalizam deluje toplo",
      p: [
        "Ostavi prazan prostor oko komada, ponovi jednu boju kroz više predmeta i dodaj prirodni element — granu suvog cveća ili pampas travu u vazi.",
      ],
    },
    faqs: [
      {
        q: "Koje boje su najbolje za minimalistički enterijer?",
        a: "Bela, bež i siva. Crna daje jak kontrast, a maslinasto zelena unosi prirodan akcenat.",
      },
      {
        q: "Koliko komada je dovoljno za policu?",
        a: "Najčešće tri: jedna vaza, jedna figura i jedan svećnjak različitih visina, u istoj boji ili dve boje koje se slažu.",
      },
    ],
    keywords: [
      "minimalistička dekoracija",
      "minimalistička dekoracija za dom",
      "moderne figure za dom",
      "skulpturalna vaza",
    ],
  },
  {
    slug: "boho-dekoracija-za-dom",
    title: "Boho dekoracija za dom: vaze za pampas travu",
    h1: "Boho dekoracija za dom",
    description:
      "Boho dekoracija za dom: vaze za pampas travu i suvo cveće, saksije i prirodni tonovi. 3D štampano u Srbiji, 7 boja, od {from}. Plaćanje pouzećem.",
    intro: [
      "Boho stil počiva na prirodnim tonovima i teksturama: pampas trava, suvo cveće, bež i maslinasto zelena. Vaze zaobljenih formi i teksture dobro nose takav aranžman.",
      "Birani su komadi mekih oblika — Vrećica, List i Spiralna Vaza, Bubble Vaza i saksije — koji se uklapaju uz prirodne materijale.",
    ],
    products: [
      "vrecica-vaza",
      "list-vaza",
      "spiralna-vaza",
      "vaza-luna",
      "bubble-vaza",
      "harmony-vaza",
      "duet-vaza",
      "drvo-saksija",
      "papir-saksija",
    ],
    tips: {
      h2: "Boje za boho enterijer",
      p: [
        "Bež, bela i maslinasto zelena su prirodan izbor, a roze unosi mekoću. Kombinuj vazu u toplom tonu sa suvim travama i pampasom.",
      ],
    },
    faqs: [
      {
        q: "Koja vaza je najbolja za pampas travu u boho stilu?",
        a: "Vrećica Vaza i Harmony Vaza su stabilne i meke forme koje lepo nose pampas. Pre postavljanja protresi pampas napolju da se smanji osipanje vlakana.",
      },
      {
        q: "Da li se u vaze stavlja voda?",
        a: "Ne. Vaze su dekorativne i nisu vodootporne — namenjene su suvom cveću i pampas travi.",
      },
    ],
    keywords: [
      "boho dekoracija za dom",
      "boho vaza",
      "vaza za pampas travu",
      "dekoracija sa suvim cvećem",
    ],
  },
  {
    slug: "dekoracija-za-dnevnu-sobu",
    title: "Dekoracija za dnevnu sobu: vaze, figure, svećnjaci",
    h1: "Dekoracija za dnevnu sobu",
    description:
      "Dekoracija za dnevnu sobu: moderne vaze, figure i svećnjaci za policu, komodu i klub sto. 3D štampano u Srbiji, 7 boja, od {from}. Dostava po Srbiji.",
    intro: [
      "Dnevna soba je prostor gde se dekoracija najviše vidi: polica, komoda, klub sto i prozorska daska. Nekoliko dobro izabranih komada menja utisak cele sobe.",
      "Kombinuj vazu, figuru i svećnjak različitih visina u istoj boji, i dobićeš uigranu kompoziciju bez mnogo truda.",
    ],
    products: [
      "arch-vaza",
      "donut-vaza",
      "duo-vaza",
      "harmony-vaza",
      "mislilac-figura",
      "zaljubljeni-par-figura",
      "maska-figura",
      "hvatac-svetlosti-svecnjak",
      "spiralni-svecnjak",
      "rebrasti-svecnjak",
    ],
    tips: {
      h2: "Kako da složiš dekoraciju u dnevnoj sobi",
      p: [
        "Slaži u grupama od tri komada, varijaj visine i ostavi prazan prostor. Detaljniji saveti su u vodiču o tome kako ukrasiti policu i komodu.",
      ],
    },
    faqs: [
      {
        q: "Koje dekoracije su najbolje za dnevnu sobu?",
        a: "Vaza za suvo cveće, jedna skulptura i svećnjak čine osnovnu kompoziciju koja radi na polici, komodi i klub stolu.",
      },
      {
        q: "Koliko košta dekoracija za dnevnu sobu?",
        a: "Pojedinačni komadi koštaju od {from} do {to}. Besplatna dostava važi za porudžbine preko 6.000 RSD.",
      },
    ],
    keywords: [
      "dekoracija za dnevnu sobu",
      "dekoracija za policu",
      "dekoracija za komodu",
      "moderni svećnjaci za dnevnu sobu",
    ],
  },
  {
    slug: "dekorativne-saksije",
    title: "Dekorativne saksije za sukulente – 3D štampane",
    h1: "Dekorativne saksije za sukulente i male biljke",
    description:
      "Dekorativne saksije za sukulente i male biljke: Drvo, Šapica i Papir Saksija. 3D štampano u Srbiji, 7 boja, od {from}. Plaćanje pouzećem.",
    intro: [
      "Dekorativna saksija je mala skulptura koja nosi biljku: stoji na prozoru, radnom stolu ili polici i daje karakter čak i najjednostavnijem sukulentu.",
      "Biraj između Drvo Saksije, Šapica Saksije za ljubitelje mačaka i Papir Saksije u obliku presavijene kese — sve u 7 boja.",
    ],
    products: ["drvo-saksija", "sapica-saksija", "papir-saksija"],
    tips: {
      h2: "Kako koristiti dekorativnu saksiju",
      p: [
        "Najsigurnije je da biljku držiš u malom lončiću unutar saksije, jer su 3D štampani predmeti dekorativni i nisu vodootporni. Lončić možeš lako da izvadiš radi zalivanja.",
      ],
    },
    faqs: [
      {
        q: "Da li saksija može direktno da se zaliva?",
        a: "Preporučujemo lončić unutar saksije, a ne zalivanje direktno u njoj, jer saksije nisu vodootporne.",
      },
      {
        q: "Koja saksija je dobar poklon za ljubitelje mačaka?",
        a: "Šapica Saksija u obliku mačje šapice — dostupna u 7 boja.",
      },
    ],
    keywords: [
      "dekorativna saksija",
      "dekorativne saksije",
      "saksija za sukulente",
      "moderna saksija",
    ],
  },
  {
    slug: "dekoracija-za-radnu-sobu",
    title: "Dekoracija za radnu sobu – ideje za radni sto",
    h1: "Dekoracija za radnu sobu",
    description:
      "Dekoracija za radnu sobu i radni sto: male figure, vaza sa suvom granom i svećnjak. 3D štampano u Srbiji, 7 boja, od {from}. Plaćanje pouzećem.",
    intro: [
      "Radni sto je mesto na kojem provodiš dosta sati, pa mali dekorativni detalji mnogo znače. Ne treba ti puno: jedna figura, jedna biljka ili vaza sa granom suve trave dovoljni su da prostor izgleda uređeno i da ti ne smeta pri radu.",
      "Mislilac se sam nameće za radnu sobu, Maca i Labrador unose toplinu, a Drvo Saksija je dom za mali sukulent. Boje biraš tako da se slažu sa stolom i zidom.",
    ],
    products: [
      "mislilac-figura",
      "maca-figura",
      "labrador-figura",
      "drvo-saksija",
      "harmony-vaza",
      "rebrasti-svecnjak",
      "maska-figura",
      "home-figura",
    ],
    tips: {
      h2: "Kako ukrasiti radni sto",
      p: [
        "Drži se pravila do tri predmeta na stolu: jedna figura, jedna biljka ili vaza i jedan svećnjak ili natpis. Ostalo prepusti prostoru, jer radna površina mora ostati slobodna.",
        "Visine neka se razlikuju: nižu figuru stavi ispred, a vazu sa granom pozadi ili sa strane. U neutralnim bojama (bela, bež, siva) dekoracija se stapa sa stolom, a crna ili maslinasto zelena daju kontrast.",
      ],
    },
    faqs: [
      {
        q: "Šta staviti na radni sto da izgleda lepo, a ne smeta?",
        a: "Jednu malu figuru i jednu biljku ili vazu sa suvom granom. Do tri predmeta su dovoljna, ostatak ostavi slobodan.",
      },
      {
        q: "Koja figura je najbolja za radnu sobu?",
        a: "Mislilac je najčešći izbor za radni sto i biblioteku, a Maca i Labrador za ljubitelje životinja.",
      },
      {
        q: "Da li mogu da stavim biljku u saksiju?",
        a: "Drvo Saksija ima otvor za drenažu i namenjena je sukulentima i manjim biljkama.",
      },
    ],
    keywords: ["dekoracija za radnu sobu", "dekoracija radnog stola", "ukrasi za radni sto", "dekor za kancelariju"],
  },
];
