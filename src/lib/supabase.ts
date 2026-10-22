// Tanak sloj za Supabase (samo server). Koristi običan REST (PostgREST), bez dodatnih paketa.
// Potrebne varijable: SUPABASE_URL i SUPABASE_SERVICE_KEY (tajni ključ — NIKAD u kod ili u aplikaciju).
// Ako nisu podešene, ništa ne puca: porudžbine i dalje stižu mejlom.

const base = () => (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const key = () => process.env.SUPABASE_SERVICE_KEY || "";

export const supabaseConfigured = () => !!(base() && key());

function headers(extra: Record<string, string> = {}): Record<string, string> {
  const k = key();
  const h: Record<string, string> = { apikey: k, "Content-Type": "application/json", ...extra };
  // stari ključevi su JWT i idu i kao Bearer; novi "sb_secret_…" ključevi idu samo u apikey
  if (k.startsWith("eyJ")) h.Authorization = `Bearer ${k}`;
  return h;
}

export async function sbInsert(
  table: string,
  row: Record<string, unknown>,
  opts: { onConflict?: string; ignoreDuplicates?: boolean } = {},
): Promise<void> {
  const q = opts.onConflict ? `?on_conflict=${encodeURIComponent(opts.onConflict)}` : "";
  const prefer = [opts.onConflict ? (opts.ignoreDuplicates ? "resolution=ignore-duplicates" : "resolution=merge-duplicates") : "", "return=minimal"]
    .filter(Boolean)
    .join(",");
  const res = await fetch(`${base()}/rest/v1/${table}${q}`, {
    method: "POST",
    headers: headers({ Prefer: prefer }),
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`Supabase ${table}: ${res.status} ${(await res.text()).slice(0, 200)}`);
}

export async function sbSelect<T = unknown>(table: string, query: string): Promise<T[]> {
  const res = await fetch(`${base()}/rest/v1/${table}?${query}`, { headers: headers() });
  if (!res.ok) throw new Error(`Supabase ${table}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as T[];
}

/** Poziva funkciju u bazi (npr. brojač porudžbina). */
export async function sbRpc<T = unknown>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`${base()}/rest/v1/rpc/${fn}`, { method: "POST", headers: headers(), body: JSON.stringify(args) });
  if (!res.ok) throw new Error(`Supabase rpc ${fn}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as T;
}

export async function sbDelete(table: string, query: string): Promise<void> {
  await fetch(`${base()}/rest/v1/${table}?${query}`, { method: "DELETE", headers: headers() });
}

/** "+381 64 123-45-67" -> "0641234567" (isto kao u admin aplikaciji) */
export function normalizePhone(phone: string): string {
  let d = (phone || "").replace(/\D/g, "");
  if (d.startsWith("00381")) d = "0" + d.slice(5);
  else if (d.startsWith("381")) d = "0" + d.slice(3);
  else if (d && !d.startsWith("0")) d = "0" + d;
  return d;
}

export interface ContactInput {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  source: "porudzbina" | "newsletter";
  /** true = kupac je pristao na obaveštenja o akcijama. Nikad se ne spušta automatski na false. */
  marketing?: boolean;
}

/** Upisuje/ažurira kontakt (kupac ili prijava na newsletter) u listu kontakata. */
export async function upsertContact(c: ContactInput): Promise<void> {
  const email = (c.email || "").trim().toLowerCase();
  const phoneNorm = normalizePhone(c.phone || "");
  const contactKey = email || (phoneNorm ? `tel:${phoneNorm}` : "");
  if (!contactKey) return;
  const row: Record<string, unknown> = {
    contact_key: contactKey,
    updated_at: new Date().toISOString(),
    sources: [c.source],
  };
  if (email) row.email = email;
  if (phoneNorm) row.phone = phoneNorm;
  if (c.name?.trim()) row.name = c.name.trim();
  if (c.city?.trim()) row.city = c.city.trim();
  // pristanak se samo uključuje; nikad ne gazi ranije dat pristanak
  if (c.marketing === true) row.marketing_consent = true;
  await sbInsert("contacts", row, { onConflict: "contact_key" });
}
