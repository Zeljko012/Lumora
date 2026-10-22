// Ručno pisan, jedinstven tekst za svaki proizvod (naslov za pretragu, dva pasusa o korišćenju i jedno pitanje).
// Činjenice o dimenzijama, materijalu i cenama NE ovde: one dolaze iz src/data/products.ts.
// Naslov: bez "| Lumora" (dodaje ga Seo.astro); do 51 znak, da ukupno stane u 60.

import type { Category } from "./products";

export interface ProductCopy {
  /** naslov u rezultatima pretrage (bez "| Lumora") */
  title: string;
  /** dva kratka pasusa: gde stoji, uz šta ide, u kojoj boji */
  body: [string, string];
  /** jedno pitanje specifično za proizvod */
  faq: { q: string; a: string };
}

export const PRODUCT_COPY: Record<string, ProductCopy> = {
  /* ───────────── VAZE ───────────── */
  "arch-vaza": {
    title: "Arch vaza – moderna lučna vaza za policu",
    body: [
      "Arch vaza ima lučni otvor, pa i prazna izgleda kao mala arhitektonska maketa. Najlepše stoji na komodi, polici ili stolu uz zid, gde se luk jasno vidi sa strane. Jedna grana suve trave ili nekoliko klasova dovoljni su, jer je oblik sam po sebi dekoracija.",
      "U beloj ili bež boji naglašava čistu liniju luka, a u crnoj ili maslinastoj postaje akcenat u svetlom prostoru. Dobro se slaže sa knjigama i drvenim detaljima na polici.",
    ],
    faq: { q: "Šta mogu da stavim u Arch vazu?", a: "Suvo cveće, pampas travu ili grane suvog bilja. Ukrasna je i ne puni se vodom, a prazna stoji kao skulptura." },
  },
  "bubble-vaza": {
    title: "Bubble vaza – ukrasna vaza sa mehurićima",
    body: [
      "Površina Bubble vaze je prekrivena mehurićima koji hvataju svetlo i prave sitne senke, pa se izgled menja tokom dana. Zato je odlična na mestu gde pada bočno svetlo, recimo pored prozora ili na polici uz lampu.",
      "Pošto je tekstura sama po sebi živa, ostatak aranžmana neka bude jednostavan: nekoliko suvih grana ili pampas trava. U svetlijim bojama mehurići se vide nežno, u tamnijim kontrastnije.",
    ],
    faq: { q: "Da li je Bubble vaza glatka ili teksturisana?", a: "Teksturisana je, prekrivena mehurićima. Najlepše deluje kad na nju pada bočno svetlo." },
  },
  "donut-vaza": {
    title: "Donut vaza – okrugla ukrasna vaza za suvo cveće",
    body: [
      "Donut vaza je krug sa otvorenom sredinom. Privlači pogled i kada je prazna, pa je dovoljna sama na polici ili kafe stolu. Kada u nju stavite suvu travu, ona izlazi iz kruga i daje utisak lagane kompozicije.",
      "Okrugla forma se lepo slaže sa pravim linijama nameštaja, pa je česta u minimalističkim enterijerima. U neutralnim bojama je nenametljiva, a u roze ili crvenoj postaje centralni akcenat prostorije.",
    ],
    faq: { q: "Da li se Donut vaza puni vodom?", a: "Ne. Ukrasna je i namenjena suvom cveću i pampas travi ili da stoji sama kao skulptura." },
  },
  "duet-vaza": {
    title: "Duet vaza – dvostruka ukrasna vaza za parove",
    body: [
      "Duet vaza spaja dve forme u jedan komad, sa dva otvora. Zamišljena je kao mala kompozicija: u jedan otvor ide viša grana, u drugi niža, pa dobijate dva aranžmana bez dodatnog posuđa.",
      "Zbog simbolike dvoje, često se bira kao poklon za parove, godišnjicu ili useljenje. Na komodi ili stolu u trpezariji radi sama, bez potrebe za dodatnim ukrasima.",
    ],
    faq: { q: "Šta je razlika između Duet i Duo vaze?", a: "Duet je jedan komad sa dva otvora. Duo je set od dve odvojene vaze različitih visina." },
  },
  "duo-vaza": {
    title: "Duo vaza – set od dve moderne ukrasne vaze",
    body: [
      "Duo je set od dve vaze različitih visina koje rade zajedno. Postavite ih jednu pored druge na komodi, polici ili sredini stola i dobijate gotovu kompoziciju, bez razmišljanja o razmerama.",
      "Možete ih držati zajedno ili razdvojiti na dva kraja police, pa se ritam visina ponavlja. Kao poklon deluje zaokruženo, jer jedan paket znači jedan kompletan detalj za dom.",
    ],
    faq: { q: "Da li se Duo kupuje kao set?", a: "Da, Duo je set od dve vaze različitih visina koje se poručuju zajedno." },
  },
  "harmony-vaza": {
    title: "Harmony vaza – minimalistička ukrasna vaza",
    body: [
      "Harmony vaza ima čiste linije i meku siluetu, pa se uklapa u gotovo svaki enterijer, od skandinavskog do toplog rustik stila. Nije vaza koja traži pažnju, nego ona koja tiho zaokružuje policu ili sto.",
      "Najbolja je u neutralnim tonovima, uz suvu travu u istoj paleti. Ako uređujete mirnu, svetlu sobu, ovo je vaza koju ćete retko menjati.",
    ],
    faq: { q: "Za koji stil enterijera je Harmony vaza?", a: "Za minimalistički, skandinavski i topli rustik stil. Neutralne boje se slažu sa gotovo svim nameštajem." },
  },
  "list-vaza": {
    title: "List vaza – ukrasna vaza u obliku lista",
    body: [
      "List vaza je organska forma sa obrisom lista, pa se prirodno uklapa u prostor sa biljkama, drvetom i lanenim tkaninama. Dobro stoji na stolu pored prozora ili na polici sa sobnim biljem.",
      "Zeleni i bež tonovi pojačavaju botaničku temu, dok bela i siva daju savremeniji utisak. Uz nekoliko suvih grana izgleda kao deo cvetnog aranžmana.",
    ],
    faq: { q: "Koja boja List vaze najviše odgovara prirodnom stilu?", a: "Maslinasto zelena i bež. Bela i siva su dobar izbor za savremeniji, svetliji prostor." },
  },
  "spiralna-vaza": {
    title: "Spiralna vaza – moderna ukrasna vaza za suvo cveće",
    body: [
      "Spiralna vaza ima uvijenu liniju koja se penje uvis i daje utisak pokreta čak i kada je nepomična. Zbog toga je dobra za police i komode koje deluju previše ravno i trebaju malo dinamike.",
      "Spiralu je najbolje ostaviti vidljivom: jedna ili dve vitke grane, bez gustog buketa. U tamnijim bojama linija se čita jasno, u svetlim deluje mekše.",
    ],
    faq: { q: "Kakav buket odgovara Spiralnoj vazi?", a: "Redak, sa jednom ili dve vitke grane, da se spiralna linija vidi. Ne puni se vodom, pa je za suvo cveće." },
  },
  "split-vaza": {
    title: "Split vaza – asimetrična ukrasna vaza",
    body: [
      "Split vaza je presečena, asimetrična forma, pa izgleda drugačije iz svakog ugla. Okrenite je prema sobi tako da vam se najviše sviđa i ostavite je da bude središnji komad police.",
      "Zbog neobičnog preseka nije potrebno mnogo oko nje: jedan duži klas ili grana, a ostatak police neka ostane čist. Dobra je za ljubitelje skulpturalnih komada.",
    ],
    faq: { q: "Da li je Split vaza simetrična?", a: "Ne, namerno je asimetrična. Zato izgleda drugačije iz različitih uglova, pa je možete okrenuti kako vam se najviše sviđa." },
  },
  "vaza-luna": {
    title: "Vaza Luna – ukrasna vaza u obliku polumeseca",
    body: [
      "Vaza Luna ima oblik polumeseca, nežne zaobljene linije koje unose mirnu, večernju notu u prostor. Posebno lepo stoji u spavaćoj sobi, na noćnom stočiću ili polici uz mekano svetlo.",
      "Najbolje je u mekim tonovima, kao što su bež, roze ili bela, uz nekoliko suvih cvetova. Cena joj je među pristupačnijim u kolekciji vaza, pa je česta kao mali poklon za dom.",
    ],
    faq: { q: "Gde najbolje stoji Vaza Luna?", a: "Na noćnom stočiću, komodi ili polici u spavaćoj i dnevnoj sobi, gde njena mekana silueta unosi mirnu atmosferu." },
  },
  "vrecica-vaza": {
    title: "Vrećica vaza – vaza u obliku papirne kese",
    body: [
      "Vrećica vaza imitira zgužvanu papirnu kesu, ali u čvrstoj, mat izradi. Kontrast između jednostavnog oblika i svakodnevnog predmeta čini je zanimljivom na polici ili stolu.",
      "Uklapa se u wabi-sabi i prirodne enterijere sa lanom, drvetom i keramikom. Jedna grana ili nekoliko suvih klasova izgledaju kao da ste ih stavili u običnu kesu, samo mnogo elegantnije.",
    ],
    faq: { q: "Da li je Vrećica vaza stvarna papirna kesa?", a: "Ne, to je 3D štampana PLA vaza koja samo imitira oblik zgužvane papirne kese. Ne puni se vodom." },
  },

  /* ───────────── FIGURE ───────────── */
  "figura-sa-srcem": {
    title: "Figura sa srcem – 3D skulptura, poklon za ljubav",
    body: [
      "Figura sa srcem u rukama jednostavna je poruka pažnje i ljubavi. Mala je dovoljno da stoji na noćnom stočiću, polici ili radnom stolu, a dovoljno upečatljiva da kod osobe koja je dobije izazove osmeh.",
      "Radi kao poklon za partnera, prijateljicu ili majku, i to bez posebnog povoda. Bela i roze su klasičan izbor, a crna ili siva daju modernu notu.",
    ],
    faq: { q: "Za koju priliku je Figura sa srcem?", a: "Za godišnjicu, Dan zaljubljenih, rođendan ili bez povoda. Mala je i lako se pakuje kao poklon." },
  },
  "home-figura": {
    title: "Home figura – 3D dekoracija, poklon za useljenje",
    body: [
      "Natpis HOME u čvrstoj 3D formi stoji na komodi, polici ili prozorskoj dasci i odmah daje prostoru domaći osećaj. Posebno je prijatan na mestima koja tek dobijaju svoj izgled: u novom ili iznajmljenom stanu.",
      "Zato je čest poklon za useljenje. Ide uz svaku boju zida, a u beloj i bež izgleda neutralno, dok u crnoj ili crvenoj postaje grafički akcenat.",
    ],
    faq: { q: "Da li je Home figura dobar poklon za useljenje?", a: "Da, mala je, ne zauzima mnogo mesta i uklapa se u svaki stan. Birate boju koja odgovara novom domu." },
  },
  "home-roze-figura": {
    title: "Home roze figura – natpis HOME, poklon za dom",
    body: [
      "Natpis HOME je mala skulptura za policu ili ulazni deo stana. Boju birate pri poručivanju: roze unosi toplinu u sobu sa neutralnim tonovima, a oblik je grafički i jasan, pa ne deluje preslatko.",
      "Dobro se slaže sa belom, bež i sivom, kao i sa drvenim policama. Kao poklon za useljenje ili za nekoga ko voli nežne tonove, uvek je siguran izbor.",
    ],
    faq: { q: "Da li Home roze dolazi i u drugim bojama?", a: "Da, kao i svi Lumora komadi dostupan je u 7 boja. Boju birate pri poručivanju." },
  },
  "labrador-figura": {
    title: "Labrador figura – 3D skulptura psa, poklon",
    body: [
      "Labrador figura prikazuje sedećeg psa svedenog na čiste linije. Ne pokušava da bude realistična, već moderna skulptura koja se prepoznaje po siluetu.",
      "Odlična je za vlasnike labradora, za ljubitelje pasa uopšte i kao kolekcionarski komad uz mačke iz iste serije. Stoji na polici, komodi ili radnom stolu.",
    ],
    faq: { q: "Da li Labrador figura liči na stvarnog psa?", a: "Slična je po siluetu, ali je stilizovana, svedena na čiste linije kao moderna skulptura." },
  },
  "maca-figura": {
    title: "Maca figura – 3D skulptura mačke, poklon",
    body: [
      "Uspravna mačka svedena na osnovni oblik: mala skulptura sa karakterom. Dobro stoji na polici, na radnom stolu ili pored saksije, a boju birate prema tome da li želite da bude akcenat ili da se stopi sa prostorom.",
      "Za ljubitelje mačaka može biti početak kolekcije, jer se uklapa sa ostalim mačjim figurama u ponudi. Kao poklon radi i za ljude koji nemaju mačku, a vole dizajnerske predmete.",
    ],
    faq: { q: "Da li Maca figura ima druge mačke u istoj seriji?", a: "Da, u ponudi su još Maca mreža, Uspavana maca i Zaljubljene mace, pa možete da napravite malu kolekciju." },
  },
  "maca-mreza-figura": {
    title: "Maca mreža – dizajnerska figura mačke za policu",
    body: [
      "Maca mreža je mačka izvedena kao otvorena mrežasta struktura: puna forma, ali prozračna. Zbog toga baca zanimljive senke i izgleda lagano, čak i kada stoji na tamnoj površini.",
      "Za ljubitelje mačaka koji vole savremeniji, dizajnerski predmet umesto klasične figurice. Uz knjige, biljke ili lampu radi kao sitni skulpturalni akcenat.",
    ],
    faq: { q: "Zašto je Maca mreža šuplja?", a: "Namerno je izvedena kao otvorena mrežasta struktura, što je njen dizajn: puna forma, a lagana i prozračna." },
  },
  "maska-figura": {
    title: "Maska figura – dekorativna maska za zid i policu",
    body: [
      "Maska je stilizovano lice inspirisano pozorišnim i plemenskim maskama. Radi kao dekorativna skulptura na polici, komodi ili uz zid, gde lice dobija ulogu centralnog komada.",
      "Odgovara etno i boho enterijerima, ali i modernim prostorima kojima treba jedan jači, grafički detalj. U crnoj boji je dramatična, u beloj ili bež mirnija.",
    ],
    faq: { q: "Kome odgovara Maska figura?", a: "Ljubiteljima umetnosti i etno detalja u enterijeru. Dobro se slaže sa boho i modernim stilovima." },
  },
  "mislilac-figura": {
    title: "Mislilac figura – 3D skulptura za radni sto",
    body: [
      "Mislilac je sedeća figura u pozi razmišljanja, sa jasnim odjekom Rodenovog „Mislioca“. Na radnom stolu, polici sa knjigama ili u biblioteci deluje kao podsetnik da je pauza deo posla.",
      "Dobar je poklon za nekoga ko voli umetnost, filozofiju ili ima kutak za rad i čitanje. Crna ili siva daju ozbiljniji ton, bela deluje mekše i savremenije.",
    ],
    faq: { q: "Da li je Mislilac kopija Rodenove skulpture?", a: "Nije kopija, već stilizovana figura inspirisana pozom Rodenovog „Mislioca“, svedena na jednostavne linije." },
  },
  "uspavana-maca-figura": {
    title: "Uspavana maca – figura sklupčane mačke za policu",
    body: [
      "Sklupčana mačka u snu ima mekanu, zaobljenu siluetu koja smiruje prostor. Odlična je za komodu u spavaćoj sobi ili policu pored kreveta, gde dobro dođe malo mira.",
      "Nema oštrih ivica, pa je prijatna i za dodir. Poklon je za svakog vlasnika mačke, a posebno onog čija mačka većinu dana prespava na kauču.",
    ],
    faq: { q: "Gde najbolje stoji Uspavana maca?", a: "Na komodi ili polici u spavaćoj i dnevnoj sobi, na noćnom stočiću ili radnom stolu. Zaobljena je i mirna." },
  },
  "zagrljaj-ljubavi-figura": {
    title: "Zagrljaj ljubavi – 3D figura para, poklon",
    body: [
      "Par u čvrstom zagrljaju izveden je kao jedna neprekinuta linija, bez lica i detalja, pa deluje kao simbol, a ne kao realna figura. Zato se dopada i onima koji inače ne vole klasične figurice.",
      "Dobar je poklon za godišnjicu, veridbu ili za Dan zaljubljenih. Na polici ili komodi radi sama, bez dodatnih ukrasa.",
    ],
    faq: { q: "Po čemu se Zagrljaj ljubavi razlikuje od Zaljubljenog para?", a: "Zagrljaj ljubavi je izveden kao jedna neprekinuta linija, a Zaljubljeni par su dve isprepletene figure." },
  },
  "zaljubljene-mace-figura": {
    title: "Zaljubljene mace – figura dve mačke, poklon",
    body: [
      "Dve mačke naslonjene jedna na drugu čine nežan duo za policu. Prave su za parove koji dele ljubav prema mačkama i vole poklone sa malo humora.",
      "Zbog teme dvoje, može da se pokloni za Dan zaljubljenih ili godišnjicu, a stoji i na radnom stolu kao mali podsetnik na nekoga. U jednoj boji izgleda moderno, u roze mekše.",
    ],
    faq: { q: "Za koga je Zaljubljene mace?", a: "Za parove koji vole mačke, kao poklon za Dan zaljubljenih, godišnjicu ili bez povoda." },
  },
  "zaljubljeni-par-figura": {
    title: "Zaljubljeni par – 3D figura, poklon za ljubav",
    body: [
      "Zaljubljeni par su dve isprepletene figure u zagrljaju, apstraktna skulptura o bliskosti. Nema lica ni detalja, pa se svako može prepoznati u njoj.",
      "Klasičan poklon za godišnjicu, veridbu ili venčanje. Stoji na komodi, polici ili sa strane stola u spavaćoj ili dnevnoj sobi.",
    ],
    faq: { q: "Da li je Zaljubljeni par dobar poklon za venčanje?", a: "Da, često se bira za venčanje, veridbu i godišnjicu. Možete da izaberete boju koja odgovara domu mladenaca." },
  },

  /* ───────────── SVEĆNJACI ───────────── */
  "bubble-svecnjak": {
    title: "Bubble svećnjak – mali dekorativni svećnjak",
    body: [
      "Bubble svećnjak je zaobljen, prekriven mehurićima, dovoljno mali da stane na dlan. Najpristupačniji je način da u dom uneseš Lumora detalj, pa ga mnogi uzimaju kao prvi komad ili kao sitan poklon.",
      "Dobro radi u grupi: dva ili tri komada u različitim bojama na stolu ili polici prave toplu kompoziciju. Sam na kafe stolu isto je lep.",
    ],
    faq: { q: "Može li Bubble svećnjak u grupi?", a: "Da, dva ili tri komada u različitim bojama prave toplu kompoziciju na stolu ili polici." },
  },
  "hvatac-svetlosti-svecnjak": {
    title: "Hvatač svetlosti – svećnjak za LED svećicu",
    body: [
      "Hvatač svetlosti je perforiran svećnjak koji lomi svetlost LED svećice u mnogo sitnih odsjaja po zidu i plafonu. Najbolje deluje u zatamnjenoj sobi, na stolu ili polici uz ravan zid.",
      "Za one koji vole toplu večernju svetlost. Iako je jednostavan, pravi efekat koji se ne vidi na slici, pa je dobar poklon za nekoga ko je neće očekivati.",
    ],
    faq: { q: "Gde najbolje deluje Hvatač svetlosti?", a: "U zatamnjenoj sobi, uz ravan zid, gde se vide odsjaji koje stvara svetlost LED svećice kroz perforacije." },
  },
  "rebrasti-svecnjak": {
    title: "Rebrasti svećnjak – dekorativni svećnjak",
    body: [
      "Vertikalna rebra na Rebrastom svećnjaku bacaju pravilne senke i daju mu arhitektonski, kolonadni izgled. Najbolje deluje kada ga postavite na jednostavnu podlogu: drvenu dasku, kameni tanjir ili čist sto.",
      "Za ljubitelje čistih linija i simetrije. U beloj i bež boji liči na stub od gipsa, a u crnoj je moderniji i grafičkiji.",
    ],
    faq: { q: "Po čemu je Rebrasti svećnjak poseban?", a: "Vertikalna rebra bacaju pravilne senke i daju mu izgled kolone, pa je dobar za ljubitelje simetrije." },
  },
  "spiralni-svecnjak": {
    title: "Spiralni svećnjak – skulpturalni svećnjak",
    body: [
      "Spiralni svećnjak je uvrnuta forma koja se poigrava svetlom iz svakog ugla. I kada svećica nije upaljena, deluje kao mala skulptura na polici ili sredini stola.",
      "Dobro se slaže sa Spiralnom vazom iz iste porodice oblika, pa ih možete postaviti zajedno. U jednoj boji izgleda elegantno, u dve kontrastne razigrano.",
    ],
    faq: { q: "Da li se Spiralni svećnjak slaže sa Spiralnom vazom?", a: "Da, isti spiralni oblik čini ih lepim parom na polici ili sredini stola." },
  },
  "srce-svecnjak": {
    title: "Srce svećnjak – svećnjak u obliku srca, poklon",
    body: [
      "Srce svećnjak je namenjen jednoj LED svećici: mali gest sa velikim značenjem. Na stolu za večeru, uz knjigu ili na polici, daje toplinu bez ikakvog dodatnog uređenja.",
      "Odličan je poklon za Dan zaljubljenih, godišnjicu ili bez razloga. Kao poklon se lako pakuje i šalje.",
    ],
    faq: { q: "Koju svećicu koristi Srce svećnjak?", a: "Namenjen je isključivo jednoj LED svećici. Ne sme se koristiti sa otvorenim plamenom." },
  },

  /* ───────────── SAKSIJE I DETALJI ZA DOM ───────────── */
  "drvo-saksija": {
    title: "Drvo saksija – saksija u obliku stabla za sukulente",
    body: [
      "Drvo saksija je oblikovana kao stilizovano stablo i ima otvor za drenažu, pa je dom za sukulente i male biljke. Na radnom stolu ili polici daje malo prirode i skulpture u jednom komadu.",
      "Zeleni, bež i bela tonovi se stapaju sa biljkom, a crna ili crvena prave jaču igru oblika. Dobar je poklon za ljubitelje biljaka koji vole dizajnerske detalje.",
    ],
    faq: { q: "Da li Drvo saksija ima otvor za drenažu?", a: "Da, ima otvor za drenažu, namenjena je sukulentima i manjim biljkama." },
  },
  "home-za-vrata": {
    title: "Home za vrata – natpis HOME za ulaz i hodnik",
    body: [
      "Home za vrata je natpis HOME oblikovan da stoji uz ulazna vrata ili na polici u hodniku: prvi detalj koji se vidi kad uđete u stan. Zato je pravi izbor za predsoblje, gde se prvi utisak o domu pravi.",
      "Dobar je poklon za useljenje i za one koji vole uređen ulazni prostor. U neutralnoj boji se stapa sa zidom, u jarkoj postaje mali znak dobrodošlice.",
    ],
    faq: { q: "Gde se postavlja Home za vrata?", a: "Uz ulazna vrata, na polici ili komodi u hodniku, i na svakom mestu gde želite da dočekate goste." },
  },
  "papir-saksija": {
    title: "Papir saksija – saksija u obliku papirne kese",
    body: [
      "Papir saksija ima oblik presavijene papirne kese u čvrstoj izradi: moderni omot za saksiju ili suvo cveće. Dobro se slaže sa wabi-sabi i prirodnim enterijerima.",
      "Možete je koristiti kao spoljašnji omot za običnu saksiju ili u nju staviti suvu travu. U neutralnim tonovima izgleda mirno, u jarkim kao mala skulptura.",
    ],
    faq: { q: "Čemu služi Papir saksija?", a: "Kao dekorativni omot za saksiju ili za suvo cveće. Oblik joj je presavijena papirna kesa u čvrstoj izradi." },
  },
  "sapica-saksija": {
    title: "Šapica saksija – saksija u obliku mačje šape",
    body: [
      "Šapica saksija ima oblik mačje šape, simpatičan dom za sukulent ili kaktus. Vesela je i prijatna, pa ide na radni sto, prozorsku dasku ili policu u kuhinji.",
      "Pravi poklon za ljubitelje mačaka i biljaka istovremeno. U roze ili beloj boji deluje nežno, u crnoj grafički.",
    ],
    faq: { q: "Koje biljke odgovaraju Šapici?", a: "Sukulenti i kaktusi. Poklon je za ljubitelje mačaka i biljaka." },
  },
};

/** Pitanja koja važe za celu kategoriju (dodaju se uz pitanje specifično za proizvod). */
export const CATEGORY_FAQ: Record<Category, { q: string; a: string }> = {
  vaze: {
    q: "Da li se vaza puni vodom?",
    a: "Ne. Lumora vaze su ukrasne i ne pune se vodom. Namenjene su suvom cveću, pampas travi i grančicama, ili da stoje same kao skulptura.",
  },
  figure: {
    q: "Gde se figura najbolje uklapa?",
    a: "Na polici, komodi, radnom stolu ili prozorskoj dasci. Lako se kombinuje sa knjigama, biljkama i vazama.",
  },
  svecnjaci: {
    q: "Koju svećicu da koristim?",
    a: "Samo LED svećice. Svećnjaci su štampani od PLA materijala koji ne podnosi toplotu, pa se ne smeju koristiti sa otvorenim plamenom (običnim ni čajnim svećicama).",
  },
  dom: {
    q: "Kako da održavam dekoraciju?",
    a: "Brišite je suvom ili blago vlažnom mekom krpom. Izbegavajte jaku toplotu i direktno sunce. Više u vodiču za održavanje.",
  },
};

/** Kratak opis namene za listu detalja (umesto jedne iste rečenice za sve proizvode). */
export const CATEGORY_USE: Record<Category, string> = {
  vaze: "Namena: ukrasna vaza za suvo cveće i pampas travu — ne puni se vodom",
  figure: "Namena: dekorativna figura za policu, komodu ili radni sto",
  svecnjaci: "Namena: dekorativni svećnjak — isključivo za LED svećice, ne koristiti sa otvorenim plamenom",
  dom: "Namena: dekorativni detalj za dom, sto, policu ili ulaz",
};
