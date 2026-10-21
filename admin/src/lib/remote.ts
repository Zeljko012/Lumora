// Veza sa Supabase bazom u koju sajt upisuje porudžbine i prijave. Aplikacija se prijavljuje
// vlasničkim nalogom (mejl + lozinka), pa baza nikome drugom ne otkriva podatke.
// Sve ostalo u aplikaciji priča sa "adapterom" (InboxAdapter), pa se tok može testirati bez prave baze.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { SiteOrderPayload } from './siteOrderCodec'

export interface RemoteOrderRow {
  external_id: string
  created_at: string
  payload: SiteOrderPayload
}

export interface RemoteContactRow {
  contact_key: string
  email: string | null
  phone: string | null
  name: string | null
  city: string | null
  sources: string[] | null
  marketing_consent: boolean | null
}

export interface InboxAdapter {
  /** da li je aplikacija povezana i prijavljena */
  ready(): Promise<boolean>
  fetchNewOrders(): Promise<RemoteOrderRow[]>
  markImported(externalIds: string[]): Promise<void>
  fetchContacts(): Promise<RemoteContactRow[]>
  /** javlja odmah kad se u bazi pojavi nova porudžbina ili kontakt; vraća funkciju za prekid */
  subscribe(onChange: (what: 'orders' | 'contacts') => void): () => void
}

let override: InboxAdapter | null = null
/** Samo za testiranje (DEV): zamenjuje pravu bazu lažnom. */
export function setInboxAdapter(a: InboxAdapter | null) {
  override = a
}

/* ---------- podešavanja veze ---------- */

const CFG_KEY = 'lumora.supabase'
export interface RemoteConfig {
  url: string
  key: string
}

export function getRemoteConfig(): RemoteConfig | null {
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (envUrl && envKey) return { url: envUrl, key: envKey }
  try {
    const raw = localStorage.getItem(CFG_KEY)
    if (raw) {
      const c = JSON.parse(raw) as RemoteConfig
      if (c.url && c.key) return c
    }
  } catch {
    /* ignoriši */
  }
  return null
}

export function saveRemoteConfig(c: RemoteConfig | null) {
  try {
    if (c) localStorage.setItem(CFG_KEY, JSON.stringify({ url: c.url.trim().replace(/\/+$/, ''), key: c.key.trim() }))
    else localStorage.removeItem(CFG_KEY)
  } catch {
    /* ignoriši */
  }
  client = null
  clientSig = ''
}

let client: SupabaseClient | null = null
let clientSig = ''

export function getClient(): SupabaseClient | null {
  const cfg = getRemoteConfig()
  if (!cfg) return null
  const sig = `${cfg.url}|${cfg.key}`
  if (client && sig === clientSig) return client
  client = createClient(cfg.url, cfg.key, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'lumora.auth' },
  })
  clientSig = sig
  return client
}

export async function signIn(email: string, password: string): Promise<void> {
  const c = getClient()
  if (!c) throw new Error('Prvo upiši adresu baze i javni ključ.')
  const { error } = await c.auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw new Error(/invalid/i.test(error.message) ? 'Pogrešan mejl ili lozinka.' : error.message)
}

export async function signOut() {
  await getClient()?.auth.signOut()
}

export async function currentUserEmail(): Promise<string | null> {
  const c = getClient()
  if (!c) return null
  const { data } = await c.auth.getSession()
  return data.session?.user.email ?? null
}

/* ---------- prava baza ---------- */

const supabaseAdapter: InboxAdapter = {
  async ready() {
    return (await currentUserEmail()) != null
  },
  async fetchNewOrders() {
    const c = getClient()
    if (!c) return []
    const { data, error } = await c
      .from('site_orders')
      .select('external_id, created_at, payload')
      .eq('status', 'new')
      .order('created_at', { ascending: true })
      .limit(100)
    if (error) throw new Error(error.message)
    return (data ?? []) as RemoteOrderRow[]
  },
  async markImported(ids) {
    const c = getClient()
    if (!c || !ids.length) return
    const { error } = await c.from('site_orders').update({ status: 'imported', imported_at: new Date().toISOString() }).in('external_id', ids)
    if (error) throw new Error(error.message)
  },
  async fetchContacts() {
    const c = getClient()
    if (!c) return []
    const { data, error } = await c
      .from('contacts')
      .select('contact_key, email, phone, name, city, sources, marketing_consent')
      .order('updated_at', { ascending: false })
      .limit(5000)
    if (error) throw new Error(error.message)
    return (data ?? []) as RemoteContactRow[]
  },
  subscribe(onChange) {
    const c = getClient()
    if (!c) return () => {}
    const ch = c
      .channel('lumora-inbox')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'site_orders' }, () => onChange('orders'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => onChange('contacts'))
      .subscribe()
    return () => {
      void c.removeChannel(ch)
    }
  },
}

export const adapter = (): InboxAdapter => override ?? supabaseAdapter
export const remoteConfigured = () => override != null || getRemoteConfig() != null
