// Podsetnik za napuštenu korpu (samo server): kad kupac upiše mejl na kasi, zakazuju se dva mejla preko Resend-a
// (posle 1 sata i posle 24 sata). Čim završi porudžbinu, zakazani mejlovi se otkazuju (v. cancelCartReminders).
// Zakazani ID-jevi se čuvaju u Supabase tabeli cart_reminders (docs/supabase-cart-reminders.sql).
import { Resend } from "resend";
import { SITE } from "../data/site";
import { PRODUCTS } from "../data/products";
import { sbDelete, sbInsert, sbSelect, supabaseConfigured } from "./supabase";

export const FIRST_AFTER_MIN = 60;
export const SECOND_AFTER_MIN = 24 * 60;

export interface ReminderItem {
  slug: string;
  qty: number;
  price: number;
  /** boja (ili boje) koje je kupac izabrao, samo za prikaz */
  color: string;
}

interface CartRow {
  cart_id: string;
  email: string;
  resend_ids: string[];
  created_at: string;
}

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const nf = new Intl.NumberFormat("sr-RS", { maximumFractionDigits: 0 });
const money = (n: number) => `${nf.format(Math.round(n))} ${SITE.currency}`;
const BORDER = "#e3dccb";
const MUTED = "#6e6459";
const ACCENT = "#4f6f63";

/** PostgREST: vrednost u upitu (mejl, id) ide pod navodnicima i bezbedno kodirana (mejl sme da sadrži zarez ili zagradu). */
const q = (v: string) => encodeURIComponent(`"${v.replace(/"/g, "")}"`);

/** Stavke iz zahteva se proveravaju prema katalogu: ime i cena dolaze sa servera, ne iz pregledača. */
export function cleanItems(raw: unknown): ReminderItem[] {
  if (!Array.isArray(raw)) return [];
  const out: ReminderItem[] = [];
  for (const it of raw.slice(0, 20)) {
    const p = PRODUCTS.find((x) => x.slug === it?.slug);
    if (!p) continue;
    const allowed = [p.price, ...(p.options ?? []).map((o) => o.price)];
    const price = allowed.includes(Number(it.price)) ? Number(it.price) : p.price;
    const qty = Math.min(20, Math.max(1, Math.floor(Number(it.qty) || 1)));
    // boja: samo slova, razmaci i nekoliko znakova, kratko
    const color = String(it.color ?? "")
      .replace(/[^\p{L}\d +:,()–-]/gu, "")
      .slice(0, 80);
    out.push({ slug: p.slug, qty, price, color });
  }
  return out;
}

function itemsTable(items: ReminderItem[]): string {
  const rows = items
    .map((i) => {
      const p = PRODUCTS.find((x) => x.slug === i.slug)!;
      const img = `${SITE.url}/images/meta/${p.slug}-1.jpg`;
      return `
      <tr>
        <td width="68" style="padding:10px 12px 10px 0;border-bottom:1px solid ${BORDER};vertical-align:top">
          <img src="${esc(img)}" width="60" height="60" alt="" style="display:block;border-radius:8px;border:0;object-fit:cover">
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};vertical-align:top">
          <div style="font-size:15px;font-weight:600;line-height:1.35">${esc(p.name)}</div>
          <div style="color:${MUTED};font-size:13px;line-height:1.5;margin-top:2px">${i.color ? `${esc(i.color)} &middot; ` : ""}${i.qty} &times; ${money(i.price)}</div>
        </td>
      </tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:6px 0 14px"><tbody>${rows}</tbody></table>`;
}

const shell = (title: string, body: string) => `<!doctype html>
<html lang="sr"><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
</head>
<body style="margin:0;padding:0;background:#ece5d8" bgcolor="#ece5d8">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ece5d8" style="background:#ece5d8">
    <tr><td align="center" style="padding:16px 10px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f1e8" style="max-width:560px;background:#f5f1e8;border:1px solid #d6cbb8;border-radius:14px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#2a2420">
        <tr><td style="padding:18px 22px;border-bottom:1px solid #d6cbb8">
          <span style="font-size:20px;font-weight:700;letter-spacing:.02em;color:#2a2420">${esc(SITE.name)}</span>
        </td></tr>
        <tr><td style="padding:22px;font-size:15px;line-height:1.55;color:#2a2420">
          <h1 style="font-size:20px;line-height:1.3;margin:0 0 14px;color:#2a2420">${title}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:14px 22px;border-top:1px solid #d6cbb8;color:${MUTED};font-size:12px;line-height:1.5">
          ${esc([SITE.name, SITE.address.city, SITE.address.country].filter(Boolean).join(", "))} &middot;
          <a href="mailto:${esc(SITE.email)}" style="color:${ACCENT}">${esc(SITE.email)}</a> &middot; ${esc(SITE.phone)}<br>
          Ne želiš podsetnike? Odgovori na ovaj mejl sa rečju STOP.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

function build(kind: 1 | 2, items: ReminderItem[], first: string): { subject: string; html: string; text: string } {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const link = `${SITE.url}/kasa/`;
  const hello = first ? `Zdravo, ${esc(first)}!` : "Zdravo!";
  const button = `<p style="margin:0 0 6px"><a href="${esc(link)}" style="display:inline-block;background:${ACCENT};color:#ffffff;padding:13px 22px;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px">Završi porudžbinu</a></p>`;
  const sum = `<p style="margin:0 0 16px"><strong>Ukupno: ${money(total)}</strong> &middot; plaćanje pouzećem, bez registracije.</p>`;
  const lines = items.map((i) => `- ${PRODUCTS.find((p) => p.slug === i.slug)!.name} x${i.qty}`).join("\n");
  if (kind === 1) {
    return {
      subject: "Tvoja korpa te čeka 🛒",
      html: shell(
        "Ostavio si nešto u korpi",
        `<p style="margin:0 0 14px">${hello} U tvojoj korpi su ostale ove stavke. Čuvamo ih za tebe, a porudžbinu možeš da završiš za minut.</p>
         ${itemsTable(items)}
         ${sum}
         ${button}`,
      ),
      text: `${first ? `Zdravo, ${first}!` : "Zdravo!"} U tvojoj korpi su ostale stavke:\n${lines}\n\nUkupno: ${money(total)}. Završi porudžbinu: ${link}\n\n${SITE.name} · ${SITE.phone}`,
    };
  }
  return {
    subject: "Još uvek čuvamo tvoju korpu",
    html: shell(
      "Tvoja korpa je i dalje tu",
      `<p style="margin:0 0 14px">${hello} Samo da te podsetimo: stavke koje si izabrao još čekaju. Svaki komad štampamo po porudžbini, u izabranoj boji, a dostava je po celoj Srbiji.</p>
       ${itemsTable(items)}
       ${sum}
       ${button}`,
    ),
    text: `${first ? `Zdravo, ${first}!` : "Zdravo!"} Tvoja korpa je i dalje tu:\n${lines}\n\nUkupno: ${money(total)}. Završi porudžbinu: ${link}\n\n${SITE.name} · ${SITE.phone}`,
  };
}

/** Da li je sve podešeno (Resend ključ, baza, tabela). Bez toga se ništa ne zakazuje, da se zakazani mejl nikad ne bi nepovratno izgubio. */
export async function reminderReady(): Promise<boolean> {
  if (!process.env.RESEND_API_KEY || !supabaseConfigured()) return false;
  try {
    await sbSelect("cart_reminders", "select=cart_id&limit=1");
    return true;
  } catch {
    return false;
  }
}

async function cancelIds(resend: Resend, ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => resend.emails.cancel(id).catch(() => undefined)));
}

/** Otkazuje zakazane podsetnike za ovu korpu i/ili ovaj mejl i briše zapise. Nikad ne baca grešku. */
export async function cancelCartReminders(opts: { cartId?: string; email?: string }): Promise<void> {
  try {
    const key = process.env.RESEND_API_KEY;
    if (!key || !supabaseConfigured()) return;
    const conds: string[] = [];
    if (opts.cartId) conds.push(`cart_id.eq.${q(opts.cartId)}`);
    if (opts.email) conds.push(`email.eq.${q(opts.email.trim().toLowerCase())}`);
    if (!conds.length) return;
    const rows = await sbSelect<CartRow>("cart_reminders", `select=*&or=(${conds.join(",")})`);
    if (!rows.length) return;
    await cancelIds(new Resend(key), rows.flatMap((r) => r.resend_ids ?? []));
    await Promise.all(rows.map((r) => sbDelete("cart_reminders", `cart_id=eq.${encodeURIComponent(r.cart_id)}`)));
  } catch (e) {
    console.error("Otkazivanje podsetnika nije uspelo", e);
  }
}

/** Zakazuje dva mejla za ovu korpu. Vraća false ako ništa nije zakazano. */
export async function scheduleCartReminders(opts: { cartId: string; email: string; firstName?: string; items: ReminderItem[] }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY!;
  const email = opts.email.trim().toLowerCase();
  const resend = new Resend(key);

  // ista korpa: zameni ranije zakazano; isti mejl iz druge korpe u poslednja 24h: ne šalji ponovo (zaštita od zloupotrebe i duplikata)
  const existing = await sbSelect<CartRow>("cart_reminders", `select=*&or=(cart_id.eq.${q(opts.cartId)},email.eq.${q(email)})`);
  const recentOther = existing.find((r) => r.cart_id !== opts.cartId && Date.now() - Date.parse(r.created_at) < 24 * 3600 * 1000);
  if (recentOther) return false;
  const same = existing.filter((r) => r.cart_id === opts.cartId);
  if (same.length) {
    await cancelIds(resend, same.flatMap((r) => r.resend_ids ?? []));
    await sbDelete("cart_reminders", `cart_id=eq.${encodeURIComponent(opts.cartId)}`);
  }

  const FROM = process.env.ORDER_FROM || `${SITE.name} <onboarding@resend.dev>`;
  const first = (opts.firstName || "").trim().slice(0, 40).replace(/[^\p{L} -]/gu, "");
  const ids: string[] = [];
  try {
    for (const [kind, minutes] of [
      [1, FIRST_AFTER_MIN],
      [2, SECOND_AFTER_MIN],
    ] as const) {
      const { subject, html, text } = build(kind, opts.items, first);
      const { data, error } = await resend.emails.send({
        from: FROM,
        to: [email],
        replyTo: SITE.email,
        subject,
        html,
        text,
        scheduledAt: new Date(Date.now() + minutes * 60_000).toISOString(),
      });
      if (error || !data?.id) throw new Error(error?.message || "Resend nije vratio ID.");
      ids.push(data.id);
    }
    await sbInsert("cart_reminders", { cart_id: opts.cartId, email, resend_ids: ids });
    return true;
  } catch (e) {
    // ništa ne sme ostati zakazano bez zapisa u bazi, jer se tada ne bi moglo otkazati
    await cancelIds(resend, ids);
    console.error("Podsetnik nije zakazan", e);
    return false;
  }
}
