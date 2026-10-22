import { useSyncExternalStore } from 'react'
import { liveQuery } from 'dexie'
import { db } from '../db'

type ItemRef = { productId: string | null; variantId: string | null }

/* Jedna zajednička pretplata na proizvode za sve male slike (a ne po jedan upit za svaku karticu). */
let imageMap = new Map<string, string>()
const subs = new Set<() => void>()
let started = false

function start() {
  if (started) return
  started = true
  liveQuery(() => db.products.toArray()).subscribe({
    next: (products) => {
      const m = new Map<string, string>()
      for (const p of products) {
        if (p.imageUrl) m.set(`p:${p.id}`, p.imageUrl)
        for (const v of p.variants) if (v.imageUrl || p.imageUrl) m.set(`v:${v.id}`, v.imageUrl || p.imageUrl)
      }
      imageMap = m
      subs.forEach((f) => f())
    },
    error: () => {
      started = false
    },
  })
}

const subscribe = (cb: () => void) => {
  start()
  subs.add(cb)
  return () => {
    subs.delete(cb)
  }
}
const snapshot = () => imageMap

/** Slika proizvoda za stavku porudžbine (slika varijante/boje, inače glavna slika proizvoda). */
export function useItemImage(): (i: ItemRef) => string {
  const map = useSyncExternalStore(subscribe, snapshot)
  return (i) => (i.variantId && map.get(`v:${i.variantId}`)) || (i.productId && map.get(`p:${i.productId}`)) || ''
}

/** Mala slika (ili prazan kvadrat ako je nema). */
export function Thumb({ src, size = 52 }: { src: string; size?: number }) {
  const style = { width: size, height: size }
  return src ? <img className="thumb" style={style} src={src} alt="" loading="lazy" /> : <span className="thumb" style={style} />
}

/** Red malih slika za karticu porudžbine (do 4, sa brojem komada kad ih je više od jednog). */
export function ThumbRow({ items }: { items: (ItemRef & { qty: number })[] }) {
  const imageOf = useItemImage()
  if (!items.length) return null
  return (
    <div className="thumb-row">
      {items.slice(0, 4).map((i, k) => (
        <span key={k} className="thumb-wrap">
          <Thumb src={imageOf(i)} size={44} />
          {i.qty > 1 && <b className="thumb-qty">×{i.qty}</b>}
        </span>
      ))}
      {items.length > 4 && <span className="thumb-more">+{items.length - 4}</span>}
    </div>
  )
}
