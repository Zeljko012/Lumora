// Svi zapisi imaju `id` (uuid) i `updatedAt` da bi kasnije mogli da se sinhronizuju sa Supabase-om.

export interface Sender {
  name: string
  address: string
  city: string
  zip: string
  phone: string
  pib: string
  /** tekući račun na koji kurir uplaćuje otkupninu */
  account: string
}

export interface Courier {
  id: string
  name: string
  price: number
  active: boolean
}

export interface Settings {
  id: 'main'
  sender: Sender
  couriers: Courier[]
  defaultCourierId: string
  currency: string
  /** globalni prag za upozorenje o zalihi; null = isključeno */
  lowStockThreshold: number | null
  /** skidaj komade sa zalihe kad se napravi porudžbina */
  deductStock: boolean
  defaultShippingPayer: ShippingPayer
  /** format nalepnice: A6 termalni (100×150 mm) ili A4 sa 4 nalepnice */
  labelFormat: LabelFormat
  /** upozori ako je pošiljka "Poslato" a nije naplaćena posle ovoliko dana */
  unpaidAlertDays: number
  catalogSeeded: boolean
  /** verzija kataloga sa sajta koja je poslednja uvezena u aplikaciju */
  catalogVersion: number
  /** adresa javne statistike posete sajta (Cloudflare Web Analytics, Umami…) */
  trafficUrl: string
  updatedAt: number
}

export interface Expense {
  id: string
  date: number
  category: string
  amount: number
  note: string
  updatedAt: number
  deletedAt?: number
  demo?: boolean
}

export interface Variant {
  id: string
  sku: string
  /** originalna vrednost opcije iz Shopify-ja (npr. "black") — za uparivanje pri uvozu */
  optionKey: string
  color: string
  size: string
  price: number
  stock: number
  imageUrl: string
}

export interface Product {
  id: string
  handle: string
  title: string
  imageUrl: string
  images: string[]
  active: boolean
  source: 'shopify' | 'rucno' | 'sajt'
  /** kategorija sa sajta: vaze | figure | svecnjaci | dom */
  category?: string
  /** trošak izrade jednog komada (materijal, struja…) — za procenu marže; 0/prazno = nepoznato */
  cost?: number
  /** prag za upozorenje o zalihi samo za ovaj proizvod; null = koristi globalni */
  lowStock: number | null
  variants: Variant[]
  updatedAt: number
  deletedAt?: number
}

export type OrderStatus =
  | 'nova'
  | 'spakovano'
  | 'poslato'
  | 'isporuceno'
  | 'naplaceno'
  | 'vraceno'
  | 'otkazano'

export type OrderSource = 'sajt' | 'rucno' | 'instagram' | 'viber' | 'shopify' | 'email' | 'telefon' | 'ostalo'
export type PaymentMethod = 'pouzece' | 'uplaceno'
/** ko plaća kuriru poštarinu: primalac (kupac, direktno kuriru) ili pošiljalac (ja) */
export type ShippingPayer = 'primalac' | 'posiljalac'
export type LabelFormat = 'a6' | 'a4x4'

export interface OrderItem {
  id: string
  productId: string | null
  variantId: string | null
  title: string
  color: string
  size: string
  qty: number
  price: number
  packed: boolean
}

export interface Customer {
  name: string
  address: string
  city: string
  zip: string
  phone: string
  email?: string
}

export interface StatusChange {
  status: OrderStatus
  at: number
  note?: string
}

export interface Order {
  id: string
  number: number
  createdAt: number
  updatedAt: number
  deletedAt?: number
  source: OrderSource
  customer: Customer
  /** telefon bez razmaka i sa +381 → 0, za pretragu i prepoznavanje kupca */
  phoneNorm: string
  note: string
  items: OrderItem[]
  courierId: string
  /** ko snosi troškove dostave; poštarina NIJE deo otkupnine */
  shippingPayer: ShippingPayer
  /** procenjena cena dostave (iz podešavanja kurira) — trošak samo kad je snosi pošiljalac */
  shippingPrice: number
  paymentMethod: PaymentMethod
  discount: number
  status: OrderStatus
  statusHistory: StatusChange[]
  tracking: string
  returnInfo?: ReturnInfo
  /** broj porudžbine sa sajta (npr. LUM-20261021-AB12) — sprečava dvostruki uvoz */
  externalId?: string
  /** probni podatak (može da se obriše jednim dodirom) */
  demo?: boolean
}

export interface ReturnInfo {
  reason: string
  /** trošak povrata (dostava u oba smera) */
  cost: number
  /** proizvod ispravan i vraćen na zalihu */
  restocked: boolean
  at: number
}

/** Kupac / kontakt za mejling listu i Viber. Spaja se po mejlu, a kad ga nema po broju telefona. */
export interface Contact {
  id: string
  /** mejl malim slovima, ili `tel:0641234567` kad nema mejla */
  key: string
  name: string
  email: string
  phone: string
  /** telefon bez razmaka, počinje sa 0 */
  phoneNorm: string
  city: string
  /** odakle je kontakt stigao: sajt, newsletter, instagram, viber, rucno… */
  sources: string[]
  /** true = pristao na obaveštenja o akcijama; false = odjavio se; null = nije se izjasnio */
  marketing: boolean | null
  note: string
  createdAt: number
  updatedAt: number
  deletedAt?: number
}
