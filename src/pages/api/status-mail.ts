import type { APIRoute } from "astro";
import { Resend } from "resend";
import { SITE } from "../../data/site";

export const prerender = false;

/**
 * Mejl kupcu kad se u admin aplikaciji promeni status porudžbine:
 * spakovano → „spremno za slanje", poslato → „na putu", naplaćeno → zahvalnica.
 * Poziva ga samo prijavljeni vlasnik aplikacije (Supabase sesija se proverava na serveru).
 */

type Kind = "spakovano" | "poslato" | "naplaceno";
interface Item {
  title: string;
  variant?: string;
  qty: number;
  price: number;
}
interface Body {
  kind: Kind;
  number: string;
  email: string;
  name: string;
  items: Item[];
  /** iznos koji kupac plaća kuriru (pouzeće) */
  amount: number;
  payment: "pouzece" | "uplaceno";
  /** primalac = kupac plaća poštarinu kuriru */
  shippingPayer?: "primalac" | "posiljalac";
  tracking?: string;
  courier?: string;
}

/** Aplikacija se može otvoriti i sa stare probne adrese (GitHub Pages), pa joj dozvoljavamo poziv sa nje. Svaki poziv ipak traži prijavu vlasnika. */
const ALLOWED_ORIGINS = ["https://zeljko012.github.io"];

const corsHeaders = (request: Request): Record<string, string> => {
  const origin = request.headers.get("origin") || "";
  return ALLOWED_ORIGINS.includes(origin)
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        Vary: "Origin",
      }
    : {};
};

const json = (request: Request, data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...corsHeaders(request) } });

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

/** Da li je zahtev poslao vlasnik (prijavljen u aplikaciji istim nalogom kao u Supabase-u). */
async function isOwner(request: Request): Promise<boolean> {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  const url = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_KEY || "";
  if (!token || !url || !key) return false;
  try {
    const res = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` } });
    if (!res.ok) return false;
    const user = (await res.json()) as { email?: string };
    const email = String(user.email || "").toLowerCase();
    const owners = [SITE.email, ...(process.env.ORDER_TO || "").split(",")].map((s) => s.trim().toLowerCase()).filter(Boolean);
    return !!email && owners.includes(email);
  } catch {
    return false;
  }
}

function validate(b: any): string | null {
  if (!b || typeof b !== "object") return "Neispravan zahtev.";
  if (!["spakovano", "poslato", "naplaceno"].includes(b.kind)) return "Nepoznat status.";
  if (typeof b.email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.email.trim())) return "Kupac nema ispravan mejl.";
  if (!Array.isArray(b.items) || b.items.length > 50) return "Neispravne stavke.";
  for (const f of ["number", "name"]) if (typeof b[f] !== "string" || b[f].length > 200) return `Neispravno polje: ${f}.`;
  return null;
}

function itemsTable(items: Item[]): string {
  if (!items.length) return "";
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};vertical-align:top">
          <div style="font-size:15px;font-weight:600;line-height:1.35">${esc(i.title)}</div>
          <div style="color:${MUTED};font-size:13px;line-height:1.5;margin-top:2px">${i.variant ? `${esc(i.variant)} &middot; ` : ""}${Number(i.qty) || 1} &times; ${money(Number(i.price) || 0)}</div>
        </td>
      </tr>`,
    )
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
          ${esc(SITE.name)} &middot; ${esc(SITE.address.city)}, ${esc(SITE.address.country)} &middot;
          <a href="mailto:${esc(SITE.email)}" style="color:${ACCENT}">${esc(SITE.email)}</a> &middot; ${esc(SITE.phone)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

function payLine(b: Body): string {
  if (b.payment !== "pouzece") return `<p style="margin:0 0 14px">Porudžbina je već plaćena.</p>`;
  const post = b.shippingPayer === "posiljalac" ? "" : " + poštarina po ceni kurirske službe";
  return `<p style="margin:0 0 14px"><strong>Plaćanje pouzećem:</strong> kuriru plaćate ${money(b.amount)}${post}.</p>`;
}

function build(b: Body): { subject: string; html: string; text: string } {
  const first = esc(b.name.split(" ")[0] || b.name);
  const no = esc(b.number);
  const contact = `<p style="margin:14px 0 0;color:${MUTED};font-size:13px">Pitanja? Odgovorite na ovaj mejl ili pozovite <a href="${esc(SITE.phoneHref)}" style="color:${ACCENT}">${esc(SITE.phone)}</a>.</p>`;

  if (b.kind === "spakovano") {
    return {
      subject: `Porudžbina ${b.number} je spakovana 📦`,
      html: shell(
        `Vaša porudžbina je spakovana, ${first}!`,
        `<p style="margin:0 0 14px">Porudžbina <strong>${no}</strong> je spakovana i spremna za slanje. Uskoro je predajemo kurirskoj službi i javljamo vam kad krene.</p>
         ${itemsTable(b.items)}
         ${payLine(b)}
         ${contact}`,
      ),
      text: `Vaša porudžbina ${b.number} je spakovana i spremna za slanje. Uskoro je predajemo kurirskoj službi i javljamo vam kad krene.\n\n${SITE.name} · ${SITE.phone}`,
    };
  }

  if (b.kind === "poslato") {
    const courier = b.courier ? ` <strong>${esc(b.courier)}</strong>` : "";
    const track = b.tracking
      ? `<p style="margin:0 0 14px;padding:12px 14px;background:#ece5d8;border-radius:10px"><span style="color:${MUTED};font-size:13px">Broj pošiljke</span><br><strong style="font-size:17px;letter-spacing:.03em">${esc(b.tracking)}</strong></p>`
      : "";
    return {
      subject: `Pošiljka ${b.number} je na putu 🚚`,
      html: shell(
        `Vaša pošiljka je na putu, ${first}!`,
        `<p style="margin:0 0 14px">Porudžbinu <strong>${no}</strong> smo predali kurirskoj službi${courier}. Kurir će je dostaviti na adresu iz porudžbine.</p>
         ${track}
         ${itemsTable(b.items)}
         ${payLine(b)}
         ${contact}`,
      ),
      text:
        `Vaša pošiljka ${b.number} je predata kurirskoj službi${b.courier ? ` ${b.courier}` : ""}.` +
        (b.tracking ? `\nBroj pošiljke: ${b.tracking}` : "") +
        `\n\n${SITE.name} · ${SITE.phone}`,
    };
  }

  const shop = `${SITE.url}/prodavnica/`;
  return {
    subject: `Hvala na kupovini, ${b.name.split(" ")[0] || b.name}!`,
    html: shell(
      `Hvala vam na kupovini, ${first}!`,
      `<p style="margin:0 0 14px">Drago nam je što ste izabrali ${esc(SITE.name)}. Nadamo se da ste zadovoljni porudžbinom <strong>${no}</strong>.</p>
       <p style="margin:0 0 14px">Ako želite da podelite utisak ili fotografiju, označite nas na Instagramu <a href="${esc(SITE.social.instagram)}" style="color:${ACCENT}">${esc(SITE.social.instagramHandle)}</a> — puno nam znači.</p>
       <p style="margin:0 0 6px"><a href="${esc(shop)}" style="display:inline-block;background:${ACCENT};color:#ffffff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px">Pogledajte ponudu</a></p>
       ${contact}`,
    ),
    text: `Hvala vam na kupovini! Nadamo se da ste zadovoljni porudžbinom ${b.number}.\nPonuda: ${shop}\n\n${SITE.name} · ${SITE.phone}`,
  };
}

export const OPTIONS: APIRoute = async ({ request }) => new Response(null, { status: 204, headers: corsHeaders(request) });

export const POST: APIRoute = async ({ request }) => {
  if (!(await isOwner(request))) return json(request, { ok: false, error: "Niste prijavljeni u aplikaciju." }, 401);

  let body: Body;
  try {
    const raw = await request.text();
    if (raw.length > 20_000) return json(request, { ok: false, error: "Zahtev je prevelik." }, 413);
    body = JSON.parse(raw);
  } catch {
    return json(request, { ok: false, error: "Neispravan JSON." }, 400);
  }
  const err = validate(body);
  if (err) return json(request, { ok: false, error: err }, 400);

  const API_KEY = process.env.RESEND_API_KEY;
  if (!API_KEY) return json(request, { ok: false, error: "Slanje mejla nije podešeno (RESEND_API_KEY)." }, 503);
  const FROM = process.env.ORDER_FROM || `${SITE.name} <onboarding@resend.dev>`;

  const { subject, html, text } = build(body);
  try {
    const { error } = await new Resend(API_KEY).emails.send({
      from: FROM,
      to: [body.email.trim()],
      replyTo: SITE.email,
      subject,
      html,
      text,
    });
    if (error) throw new Error(error.message);
  } catch (e) {
    console.error("Mejl kupcu nije poslat", body.number, body.kind, e);
    return json(request, { ok: false, error: "Mejl nije poslat." }, 502);
  }
  return json(request, { ok: true });
};
