import Dexie, { type EntityTable } from 'dexie'
import type { Contact, Expense, Order, Product, Settings } from './types'

export const db = new Dexie('lumora-admin') as Dexie & {
  settings: EntityTable<Settings, 'id'>
  products: EntityTable<Product, 'id'>
  orders: EntityTable<Order, 'id'>
  expenses: EntityTable<Expense, 'id'>
  contacts: EntityTable<Contact, 'id'>
  /** koju verziju svakog dokumenta je ovaj uređaj već uskladio sa bazom (v. lib/sync.ts) */
  syncState: EntityTable<{ id: string; ts: number }, 'id'>
}

db.version(1).stores({
  settings: 'id',
  products: 'id, handle, title, updatedAt',
  orders: 'id, &number, createdAt, status, phoneNorm, updatedAt',
})
db.version(2).stores({
  expenses: 'id, date, category, updatedAt',
})
db.version(3).stores({
  orders: 'id, &number, createdAt, status, phoneNorm, updatedAt, externalId',
})

db.version(4).stores({
  contacts: 'id, &key, email, phoneNorm, updatedAt',
})

db.version(5).stores({
  syncState: 'id',
})

export const uid = () => crypto.randomUUID()

export const DEFAULT_SETTINGS: Settings = {
  id: 'main',
  sender: { name: '', address: '', city: '', zip: '', phone: '', pib: '', account: '' },
  couriers: [
    { id: 'post-express', name: 'Post Express', price: 450, active: true },
    { id: 'bex', name: 'BEX', price: 450, active: true },
    { id: 'd-express', name: 'D Express', price: 450, active: true },
    { id: 'aks', name: 'AKS', price: 450, active: false },
    { id: 'city-express', name: 'City Express', price: 450, active: false },
  ],
  defaultCourierId: 'post-express',
  currency: 'RSD',
  lowStockThreshold: null,
  // proizvodi se prave po porudžbini, pa zaliha se podrazumevano ne vodi
  deductStock: false,
  defaultShippingPayer: 'primalac',
  labelFormat: 'a6',
  unpaidAlertDays: 10,
  catalogSeeded: false,
  catalogVersion: 0,
  trafficUrl: '',
  updatedAt: Date.now(),
}

export async function getSettings(): Promise<Settings> {
  const s = await db.settings.get('main')
  if (s) return { ...DEFAULT_SETTINGS, ...s, sender: { ...DEFAULT_SETTINGS.sender, ...s.sender } }
  // updatedAt 0: podrazumevana podešavanja nikad ne smeju da pregaze prava podešavanja sa drugog uređaja
  await db.settings.put({ ...DEFAULT_SETTINGS, updatedAt: 0 })
  return DEFAULT_SETTINGS
}

export async function saveSettings(patch: Partial<Settings>) {
  const s = await getSettings()
  await db.settings.put({ ...s, ...patch, id: 'main', updatedAt: Date.now() })
}
