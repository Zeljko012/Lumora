// Porudžbina sa sajta putuje do aplikacije kao kratak kod u linku iz mejla:
//   <adresa aplikacije>/#/uvoz?d=<kod>
// Kod = JSON sažet (deflate) i zapisan u base64url. Nema pozivanja servera: sve je u samom linku.
// Ovaj fajl nema zavisnosti, pa se isti oblik koristi i na serveru (src/pages/api/order.ts) i u testovima.

export interface SiteOrderPayload {
  v: 1
  /** broj porudžbine na sajtu, npr. LUM-20261021-AB12 */
  id: string
  /** broj porudžbine iz zajedničkog brojača (#1000, #1001…), ako ga je sajt dobio od baze */
  number?: number
  /** ISO vreme kad je kupac poručio */
  at: string
  customer: {
    firstName: string
    lastName: string
    phone: string
    email: string
    address: string
    city: string
    zip: string
    note?: string
  }
  items: { slug: string; name: string; color: string; qty: number; price: number }[]
  subtotal: number
  /** besplatna dostava (preko praga) — tada poštarinu plaća pošiljalac */
  shippingFree: boolean
  total: number
  /** kupac je pristao na obaveštenja o akcijama (mejl / Viber) */
  marketing?: boolean
}

const b64urlToBytes = (s: string) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

/** Izvlači kod iz nalepljenog teksta: ceo link, deo posle # ili samo kod. */
export function extractCode(input: string): string {
  const text = (input || '').trim()
  const m = text.match(/[?&]d=([A-Za-z0-9_-]+)/)
  if (m) return m[1]
  return text.replace(/\s+/g, '')
}

export async function decodeSiteOrder(input: string): Promise<SiteOrderPayload> {
  const code = extractCode(input)
  if (!code) throw new Error('Nema koda porudžbine.')
  let json: string
  try {
    const bytes = b64urlToBytes(code)
    const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
    json = await new Response(stream).text()
  } catch {
    throw new Error('Kod porudžbine nije ispravan ili je prekinut. Kopiraj ceo link iz mejla.')
  }
  let p: SiteOrderPayload
  try {
    p = JSON.parse(json)
  } catch {
    throw new Error('Kod porudžbine nije ispravan.')
  }
  if (!p || p.v !== 1 || typeof p.id !== 'string' || !p.customer || !Array.isArray(p.items) || p.items.length === 0) {
    throw new Error('Ovo nije porudžbina sa Lumora sajta.')
  }
  return p
}
