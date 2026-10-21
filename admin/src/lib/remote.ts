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
  /** poslednjih ~200 porudžbina sa sajta (svaki uređaj preuzima sve što još nema) */
  fetchRecentOrders(): Promise<RemoteOrderRow[]>
  fetchContacts(): Promise<RemoteContactRow[]>
  /** javlja odmah kad se u bazi pojavi nova porudžbina ili kontakt; vraća funkciju za prekid */
  subscribe(onChange: (what: 'orders' | 'contacts') => void): () => void
}

/* ---------- sinhronizacija svih podataka između uređaja ---------- */

export interface SyncRow {
  kind: string
  id: string
  data: unknown
  updated_at: number
  server_ts?: string
}

export interface SyncAdapter {
  ready(): Promise<boolean>
  /** dokumenti promenjeni u bazi od datog trenutka (uključivo), najviše `limit` */
  pull(since: string, limit: number): Promise<SyncRow[]>
  push(rows: SyncRow[]): Promise<void>
  subscribe(onChange: () => void): () => void
}

let syncOverride: SyncAdapter | null = null
/** Samo za testiranje (DEV). */
export function setSyncAdapter(a: SyncAdapter | null) {
  syncOverride = a
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

/** Ostavlja samo adresu projekta (https://xxxx.supabase.co): briše /rest/v1, /auth/v1 i kose crte na kraju. */
export function cleanProjectUrl(url: string): string {
  const t = url.trim()
  try {
    return new URL(t).origin
  } catch {
    return t.replace(/\/+$/, '')
  }
}

export function getRemoteConfig(): RemoteConfig | null {
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (envUrl && envKey) return { url: envUrl, key: envKey }
  try {
    const raw = localStorage.getItem(CFG_KEY)
    if (raw) {
      const c = JSON.parse(raw) as RemoteConfig
      if (c.url && c.key) return { url: cleanProjectUrl(c.url), key: c.key }
    }
  } catch {
    /* ignoriši */
  }
  return null
}

export function saveRemoteConfig(c: RemoteConfig | null) {
  try {
    if (c) localStorage.setItem(CFG_KEY, JSON.stringify({ url: cleanProjectUrl(c.url), key: c.key.trim() }))
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
  if (error) {
    if (/invalid login|invalid credentials/i.test(error.message)) throw new Error('Pogrešan mejl ili lozinka.')
    if (/not confirmed/i.test(error.message)) throw new Error('Nalog nije potvrđen: u Supabase-u uključi „Auto Confirm User“ za ovog korisnika.')
    throw new Error(/fetch|network|path/i.test(error.message) ? 'Ne mogu da stignem do baze. Proveri adresu baze (https://xxxx.supabase.co).' : error.message)
  }
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
  async fetchRecentOrders() {
    const c = getClient()
    if (!c) return []
    const { data, error } = await c
      .from('site_orders')
      .select('external_id, created_at, payload')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw new Error(error.message)
    return ((data ?? []) as RemoteOrderRow[]).reverse()
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

const supabaseSync: SyncAdapter = {
  ready: () => supabaseAdapter.ready(),
  async pull(since, limit) {
    const c = getClient()
    if (!c) throw new Error('Nije povezano sa bazom.')
    const { data, error } = await c
      .from('sync_docs')
      .select('kind, id, data, updated_at, server_ts')
      .gte('server_ts', since)
      .order('server_ts', { ascending: true })
      .limit(limit)
    if (error) throw new Error(error.message)
    return (data ?? []) as SyncRow[]
  },
  async push(rows) {
    if (!rows.length) return
    const c = getClient()
    if (!c) throw new Error('Nije povezano sa bazom.')
    const { error } = await c.from('sync_docs').upsert(rows, { onConflict: 'kind,id' })
    if (error) throw new Error(error.message)
  },
  subscribe(onChange) {
    const c = getClient()
    if (!c) return () => {}
    const ch = c
      .channel('lumora-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sync_docs' }, () => onChange())
      .subscribe()
    return () => {
      void c.removeChannel(ch)
    }
  },
}

export const syncAdapter = (): SyncAdapter => syncOverride ?? supabaseSync
export const adapter = (): InboxAdapter => override ?? supabaseAdapter
export const remoteConfigured = () => override != null || syncOverride != null || getRemoteConfig() != null
