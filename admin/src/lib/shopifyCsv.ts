import Papa from 'papaparse'
import { uid } from '../db'
import type { Product, Variant } from '../types'
import { translateColor } from './colors'

type Row = Record<string, string>

export interface ParsedVariant {
  sku: string
  optionKey: string
  color: string
  size: string
  price: number
  stock: number | null
  imageUrl: string
}

export interface ParsedProduct {
  handle: string
  title: string
  active: boolean
  images: string[]
  variants: ParsedVariant[]
}

const isColorOption = (name: string) => /boj|color|colour/i.test(name)
const isSizeOption = (name: string) => /veli[cč]|size/i.test(name)

function num(v: string | undefined): number | null {
  if (v == null || v.trim() === '') return null
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/** Čita Shopify "products_export.csv" i grupiše redove po proizvodu (Handle). */
export function parseShopifyCsv(text: string): ParsedProduct[] {
  const res = Papa.parse<Row>(text.replace(/^﻿/, ''), { header: true, skipEmptyLines: true })
  if (!res.meta.fields?.includes('Handle')) {
    throw new Error('Ovo ne liči na Shopify izvoz proizvoda (nema kolone "Handle").')
  }

  const map = new Map<string, ParsedProduct & { optionNames: string[] }>()

  for (const r of res.data) {
    const handle = (r['Handle'] || '').trim()
    if (!handle) continue
    let p = map.get(handle)
    if (!p) {
      p = { handle, title: '', active: true, images: [], variants: [], optionNames: [] }
      map.set(handle, p)
    }
    if (r['Title']?.trim()) {
      p.title = r['Title'].trim()
      p.active = (r['Status'] || 'active').trim().toLowerCase() !== 'archived'
      p.optionNames = [r['Option1 Name'], r['Option2 Name'], r['Option3 Name']].map((s) => (s || '').trim())
    }
    const img = (r['Image Src'] || '').trim()
    if (img && !p.images.includes(img)) p.images.push(img)

    const values = [r['Option1 Value'], r['Option2 Value'], r['Option3 Value']].map((s) => (s || '').trim())
    const isVariantRow = values[0] !== '' || (r['Variant Price'] || '').trim() !== ''
    if (!isVariantRow) continue // red samo sa dodatnom slikom

    let color = ''
    let size = ''
    const other: string[] = []
    values.forEach((v, i) => {
      if (!v || v === 'Default Title') return
      const name = p!.optionNames[i] || ''
      if (isSizeOption(name)) size = v
      else if (isColorOption(name)) color = translateColor(v)
      else other.push(v)
    })
    if (!color && other.length) color = other.join(' / ')

    p.variants.push({
      sku: (r['Variant SKU'] || '').trim(),
      optionKey: values.filter((v) => v && v !== 'Default Title').join('|').toLowerCase(),
      color,
      size,
      price: num(r['Variant Price']) ?? 0,
      stock: num(r['Variant Inventory Qty']),
      imageUrl: (r['Variant Image'] || '').trim(),
    })
  }

  return [...map.values()]
    .filter((p) => p.title)
    .map(({ optionNames: _, ...p }) => p)
}

const variantKey = (v: { sku: string; optionKey: string }) => (v.sku ? `sku:${v.sku}` : `opt:${v.optionKey}`)

export interface ImportPlan {
  added: Product[]
  updated: { before: Product; after: Product; changes: string[] }[]
  unchanged: number
  /** proizvodi koji postoje u aplikaciji a nema ih u fajlu — brišu se samo ako korisnik potvrdi */
  missing: Product[]
}

/** Upoređuje fajl sa postojećim katalogom: šta je novo, šta se menja, šta fali. */
export function planImport(parsed: ParsedProduct[], existing: Product[], opts: { updateStock: boolean }): ImportPlan {
  const live = existing.filter((p) => !p.deletedAt)
  const byHandle = new Map(live.map((p) => [p.handle, p]))
  const bySku = new Map<string, Product>()
  for (const p of live) for (const v of p.variants) if (v.sku) bySku.set(v.sku, p)

  const plan: ImportPlan = { added: [], updated: [], unchanged: 0, missing: [] }
  const seen = new Set<string>()
  const now = Date.now()

  for (const pp of parsed) {
    const match = byHandle.get(pp.handle) ?? pp.variants.map((v) => v.sku && bySku.get(v.sku)).find(Boolean) ?? null
    const image = pp.images[0] ?? ''

    if (!match) {
      plan.added.push({
        id: uid(),
        handle: pp.handle,
        title: pp.title,
        imageUrl: image,
        images: pp.images,
        active: pp.active,
        source: 'shopify',
        lowStock: null,
        updatedAt: now,
        variants: pp.variants.map((v) => ({
          id: uid(),
          sku: v.sku,
          optionKey: v.optionKey,
          color: v.color,
          size: v.size,
          price: v.price,
          stock: v.stock ?? 0,
          imageUrl: v.imageUrl,
        })),
      })
      continue
    }

    seen.add(match.id)
    const changes: string[] = []
    if (match.title !== pp.title) changes.push(`naziv: ${match.title} → ${pp.title}`)
    if (image && match.imageUrl !== image) changes.push('slika')
    if (match.active !== pp.active) changes.push(pp.active ? 'ponovo aktivan' : 'arhiviran')

    const oldByKey = new Map(match.variants.map((v) => [variantKey(v), v]))
    const variants: Variant[] = pp.variants.map((v) => {
      const old = oldByKey.get(variantKey(v))
      if (!old) {
        changes.push(`nova varijanta: ${[v.color, v.size].filter(Boolean).join(' ') || 'osnovna'}`)
        return { id: uid(), sku: v.sku, optionKey: v.optionKey, color: v.color, size: v.size, price: v.price, stock: v.stock ?? 0, imageUrl: v.imageUrl }
      }
      oldByKey.delete(variantKey(v))
      const label = [old.color, old.size].filter(Boolean).join(' ') || 'osnovna'
      if (old.price !== v.price) changes.push(`cena ${label}: ${old.price} → ${v.price}`)
      const stock = opts.updateStock && v.stock != null ? v.stock : old.stock
      if (stock !== old.stock) changes.push(`zaliha ${label}: ${old.stock} → ${stock}`)
      // boja/veličina koje je korisnik ručno preimenovao ostaju
      return { ...old, sku: v.sku || old.sku, price: v.price, stock, imageUrl: v.imageUrl || old.imageUrl }
    })
    // varijante kojih više nema u Shopify-ju zadržavamo (ne brišemo bez pitanja)
    for (const leftover of oldByKey.values()) variants.push(leftover)

    if (changes.length === 0) {
      plan.unchanged++
      continue
    }
    plan.updated.push({
      before: match,
      after: { ...match, title: pp.title, imageUrl: image || match.imageUrl, images: pp.images.length ? pp.images : match.images, active: pp.active, variants, updatedAt: now },
      changes,
    })
  }

  plan.missing = live.filter((p) => !seen.has(p.id) && !plan.added.some((a) => a.id === p.id) && p.source === 'shopify')
  return plan
}
