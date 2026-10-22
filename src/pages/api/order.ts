import type { APIRoute } from "astro";
import { deflateRawSync } from "node:zlib";
import { Resend } from "resend";
import { fixCase, type SiteOrderPayload } from "../../../admin/src/lib/siteOrderCodec";
import { SITE } from "../../data/site";
import { sbInsert, sbRpc, supabaseConfigured, upsertContact } from "../../lib/supabase";
import { sendPush } from "../../lib/push";

export const prerender = false;

interface OrderItem {
  slug: string;
  name: string;
  color: string;
  qty: number;
  price: number;
  lineTotal: number;
}
interface OrderPayload {
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    note?: string;
  };
  payment: string;
  /** kupac je pristao na obaveštenja o akcijama i novim modelima */
  marketing?: boolean;
  items: OrderItem[];
  totals: { subtotal: number; shippingFree: boolean; total: number };
  currency: string;
  pageUrl?: string;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const nf = new Intl.NumberFormat("sr-RS", { maximumFractionDigits: 0 });
const money = (n: number) => `${nf.format(Math.round(n))} ${SITE.currency}`;

function orderId(): string {
  const d = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LUM-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${rand}`;
}

function validate(b: any): string | null {
  if (!b || typeof b !== "object") return "Neispravan zahtev.";
  const c = b.customer;
  if (!c || typeof c !== "object") return "Nedostaju podaci o kupcu.";
  for (const f of ["firstName", "lastName", "phone", "email", "address", "city", "zip"]) {
    if (typeof c[f] !== "string" || !c[f].trim() || c[f].length > 200)
      return `Nedostaje ili je neispravno polje: ${f}.`;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email)) return "Neispravna email adresa.";
  if (!Array.isArray(b.items) || b.items.length === 0) return "Korpa je prazna.";
  if (b.items.length > 50) return "Previše stavki.";
  for (const it of b.items) {
    if (
      typeof it.name !== "string" ||
      typeof it.qty !== "number" ||
      typeof it.price !== "number" ||
      it.qty < 1 ||
      it.qty > 100
    )
      return "Neispravna stavka u korpi.";
  }
  if (!b.totals || typeof b.totals.total !== "number") return "Neispravan iznos.";
  return null;
}

const BORDER = "#e3dccb";
const MUTED = "#6e6459";

/** Stavke kao redovi: naziv levo, iznos desno (bez široke tabele, da staje u telefon). */
function itemsTable(items: OrderItem[]): string {
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${BORDER};vertical-align:top">
          <div style="font-size:15px;font-weight:600;line-height:1.35">${esc(i.name)}</div>
          <div style="color:${MUTED};font-size:13px;line-height:1.5;margin-top:2px">Boja: ${esc(i.color)} &middot; ${i.qty} &times; ${money(i.price)}</div>
        </td>
        <td align="right" style="padding:12px 0 12px 12px;border-bottom:1px solid ${BORDER};vertical-align:top;white-space:nowrap;font-size:15px;font-weight:700">${money(i.lineTotal)}</td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse"><tbody>${rows}</tbody></table>`;
}

function totalsBlock(t: OrderPayload["totals"]): string {
  const row = (label: string, value: string, strong = false) => {
    const pad = strong ? "12px 0 0" : "5px 0";
    const font = strong ? "font-size:17px;font-weight:700;border-top:2px solid " + BORDER + ";" : "font-size:14px;";
    return `
      <tr>
        <td style="padding:${pad};color:${strong ? "#2a2420" : MUTED};${font}">${label}</td>
        <td align="right" style="padding:${pad};${font}">${value}</td>
      </tr>`;
  };
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:8px">
      ${row("Međuzbir", money(t.subtotal))}
      ${row("Dostava", t.shippingFree ? "Besplatno" : "Po ceni kurirske službe")}
      ${row("Ukupno", money(t.total), true)}
    </table>`;
}

/** Link koji otvara admin aplikaciju i u njoj upisuje porudžbinu (v. admin/src/lib/siteOrderCodec.ts). */
function buildSitePayload(id: string, body: OrderPayload, number: number | null): SiteOrderPayload {
  return {
    v: 1,
    id,
    ...(number ? { number } : {}),
    at: new Date().toISOString(),
    customer: {
      firstName: body.customer.firstName,
      lastName: body.customer.lastName,
      phone: body.customer.phone,
      email: body.customer.email,
      address: body.customer.address,
      city: body.customer.city,
      zip: body.customer.zip,
      note: body.customer.note || "",
    },
    items: body.items.map((i) => ({ slug: i.slug, name: i.name, color: i.color, qty: i.qty, price: i.price })),
    subtotal: body.totals.subtotal,
    shippingFree: !!body.totals.shippingFree,
    total: body.totals.total,
    marketing: body.marketing === true,
  };
}

function adminLink(id: string, body: OrderPayload, number: number | null): string {
  const payload = buildSitePayload(id, body, number);
  const code = deflateRawSync(Buffer.from(JSON.stringify(payload), "utf8"), { level: 9 }).toString("base64url");
  const base = (process.env.ADMIN_URL || `${SITE.url}/admin/`).replace(/\/?$/, "/");
  return `${base}#/uvoz?d=${code}`;
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
          <span style="font-size:20px;font-weight:700;letter-spacing:.02em;color:#2a2420">Lumora</span>
        </td></tr>
        <tr><td style="padding:22px;font-size:15px;line-height:1.55;color:#2a2420">
          <h1 style="font-size:20px;line-height:1.3;margin:0 0 14px;color:#2a2420">${esc(title)}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:14px 22px;border-top:1px solid #d6cbb8;color:${MUTED};font-size:12px;line-height:1.5">
          Lumora &middot; ${esc(SITE.address.country)} &middot;
          <a href="mailto:${esc(SITE.email)}" style="color:#4f6f63">${esc(SITE.email)}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

export const POST: APIRoute = async ({ request }) => {
  let body: OrderPayload;
  try {
    const raw = await request.text();
    if (raw.length > 20_000) return json({ ok: false, error: "Zahtev je prevelik." }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "Neispravan JSON." }, 400);
  }

  const err = validate(body);
  if (err) return json({ ok: false, error: err }, 400);

  const id = orderId();
  // kupci na telefonu ponekad ukucaju velika slova sa kvačicom usred reči (SurČin): ispravi pre upisa i mejlova
  for (const k of ["firstName", "lastName", "address", "city"] as const) body.customer[k] = fixCase(body.customer[k] || "");
  const c = body.customer;
  const when = new Date().toLocaleString("sr-RS", { timeZone: "Europe/Belgrade" });

  // Uvek upiši u log (Vercel → Logs) da porudžbina ne bi bila izgubljena
  console.log("NOVA PORUDŽBINA", id, JSON.stringify({ customer: c, items: body.items, totals: body.totals }));

  // Broj porudžbine (#1000, #1001…) iz zajedničkog brojača u bazi; bez baze ostaje dugi broj (LUM-…)
  let number: number | null = null;
  if (supabaseConfigured()) {
    try {
      number = Number(await sbRpc<number>("next_order_number")) || null;
    } catch (e) {
      console.error("Broj porudžbine nije dobijen iz baze", e);
    }
  }
  const label = number ? `#${number}` : id;

  // Link za admin aplikaciju: u logu ostaje i kad mejl ne uspe, pa porudžbina ne može da se izgubi
  const link = adminLink(id, body, number);
  console.log("LINK ZA APLIKACIJU", id, link);

  // 1) Prvo u bazu (ako je podešena): odatle porudžbina sama ulazi u aplikaciju na telefonu
  let stored = false;
  if (supabaseConfigured()) {
    try {
      await sbInsert(
        "site_orders",
        { external_id: id, status: "new", payload: buildSitePayload(id, body, number) },
        { onConflict: "external_id", ignoreDuplicates: true },
      );
      stored = true;
    } catch (e) {
      console.error("Porudžbina nije upisana u bazu", e);
    }
    try {
      await upsertContact({
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        phone: c.phone,
        city: c.city,
        source: "porudzbina",
        marketing: body.marketing === true,
      });
    } catch (e) {
      console.error("Kontakt nije upisan", e);
    }
  }

  // 2) Obaveštenje na telefon (zvuk i kad je aplikacija zatvorena); ne sme da uspori ni obori porudžbinu
  if (stored) {
    const total = Number(body.totals?.total ?? 0);
    await Promise.race([
      sendPush("Nova porudžbina 🛍️", `${c.firstName} ${c.lastName} · ${total.toLocaleString("sr-Latn-RS")} RSD`).catch((e) =>
        console.error("Push greška", e),
      ),
      new Promise((r) => setTimeout(r, 4000)),
    ]);
  }

  const API_KEY = process.env.RESEND_API_KEY;
  const FROM = process.env.ORDER_FROM || `Lumora <onboarding@resend.dev>`;
  const TO = (process.env.ORDER_TO || SITE.email)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!API_KEY) {
    // porudžbina je bar u bazi — kupcu javljamo da je primljena
    if (stored) return json({ ok: true, orderId: label, emailed: false });
    return json(
      {
        ok: false,
        error:
          "Slanje mejla još nije podešeno (RESEND_API_KEY). Porudžbina je zabeležena — kontaktiraćemo vas.",
      },
      503,
    );
  }

  const resend = new Resend(API_KEY);

  const addressHtml = `
    <p style="margin:0 0 4px"><strong>${esc(c.firstName)} ${esc(c.lastName)}</strong></p>
    <p style="margin:0 0 4px">${esc(c.address)}</p>
    <p style="margin:0 0 4px">${esc(c.zip)} ${esc(c.city)}, Srbija</p>
    <p style="margin:0 0 4px">Tel: <a href="tel:${esc(c.phone)}" style="color:#4f6f63">${esc(c.phone)}</a></p>
    <p style="margin:0">Email: <a href="mailto:${esc(c.email)}" style="color:#4f6f63">${esc(c.email)}</a></p>`;

  const ownerHtml = shell(
    `Nova porudžbina ${label}`,
    `<p style="color:#6e6459;font-size:13px;margin:0 0 16px">${esc(when)} · plaćanje pouzećem</p>
     <p style="margin:0 0 6px"><a href="${esc(link)}" style="display:inline-block;background:#4f6f63;color:#ffffff;padding:13px 20px;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px">📲 Otvori u aplikaciji</a></p>
     <p style="color:#6e6459;font-size:12px;margin:0 0 18px">Dodirni dugme na telefonu na kom imaš Lumora aplikaciju — porudžbina se sama upisuje. Ako se ne otvori, kopiraj link iz ovog mejla i nalepi ga u aplikaciji (Početna → „Stigla porudžbina sa sajta?“).</p>
     ${itemsTable(body.items)}
     ${totalsBlock(body.totals)}
     <h2 style="font-size:15px;margin:20px 0 8px">Dostava</h2>
     ${addressHtml}
     ${c.note ? `<h2 style="font-size:15px;margin:20px 0 8px">Napomena</h2><p style="white-space:pre-wrap">${esc(c.note)}</p>` : ""}`,
  );

  const ownerText =
    `Nova porudžbina ${label} (${when})\n\n` +
    body.items
      .map((i) => `- ${i.name} / ${i.color} x${i.qty} = ${money(i.lineTotal)}`)
      .join("\n") +
    `\n\nMeđuzbir: ${money(body.totals.subtotal)}\nDostava: ${
      body.totals.shippingFree ? "Besplatno" : "Po ceni kurirske službe"
    }\nUkupno: ${money(body.totals.total)}\n\n` +
    `${c.firstName} ${c.lastName}\n${c.address}\n${c.zip} ${c.city}\nTel: ${c.phone}\nEmail: ${c.email}\n` +
    (c.note ? `\nNapomena: ${c.note}\n` : "") +
    `\nOtvori u aplikaciji: ${link}\n`;

  const customerHtml = shell(
    `Hvala na porudžbini, ${esc(c.firstName)}!`,
    `<p style="margin:0 0 14px">Primili smo vašu porudžbinu <strong>${label}</strong> i uskoro je potvrđujemo telefonom.</p>
     ${itemsTable(body.items)}
     ${totalsBlock(body.totals)}
     <p style="margin:16px 0 4px"><strong>Način plaćanja:</strong> pouzećem (gotovinom kuriru).</p>
     <p style="margin:0 0 14px"><strong>Dostava:</strong> ${esc(SITE.deliveryTime)} na adresu:<br>
       ${esc(c.address)}, ${esc(c.zip)} ${esc(c.city)}</p>
     <p style="color:#6e6459;font-size:13px">Ako nešto nije u redu sa porudžbinom, odgovorite na ovaj mejl ili nas pozovite na ${esc(SITE.phone)}.</p>`,
  );

  const customerText =
    `Hvala na porudžbini, ${c.firstName}!\n\nBroj porudžbine: ${label}\n\n` +
    body.items.map((i) => `- ${i.name} / ${i.color} x${i.qty} = ${money(i.lineTotal)}`).join("\n") +
    `\n\nUkupno: ${money(body.totals.total)}\nPlaćanje: pouzećem\nDostava: ${SITE.deliveryTime}\n\nLumora`;

  try {
    const [owner, customer] = await Promise.all([
      resend.emails.send({
        from: FROM,
        to: TO,
        replyTo: c.email,
        subject: `🛒 Porudžbina ${label} — ${c.firstName} ${c.lastName} — ${money(body.totals.total)}`,
        html: ownerHtml,
        text: ownerText,
      }),
      resend.emails.send({
        from: FROM,
        to: c.email,
        // odgovor kupca stiže u tvoj sandučić (adresa pošiljaoca nema sopstveni)
        replyTo: TO[0],
        subject: `Potvrda porudžbine ${label} — Lumora`,
        html: customerHtml,
        text: customerText,
      }),
    ]);

    if (owner.error) {
      console.error("Resend owner error", owner.error);
      if (stored) return json({ ok: true, orderId: label, emailed: false });
      return json(
        { ok: false, error: "Porudžbina je zabeležena, ali slanje mejla nije uspelo." },
        502,
      );
    }
    if (customer.error) console.error("Resend customer error", customer.error);

    return json({ ok: true, orderId: label });
  } catch (e) {
    console.error("Order send failed", e);
    if (stored) return json({ ok: true, orderId: label, emailed: false });
    return json(
      { ok: false, error: "Došlo je do greške pri slanju. Pokušajte ponovo." },
      500,
    );
  }
};

export const GET: APIRoute = () =>
  json({ ok: false, error: "Koristi POST." }, 405);
