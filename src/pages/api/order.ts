import type { APIRoute } from "astro";
import { Resend } from "resend";
import { SITE } from "../../data/site";

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

function itemsTable(items: OrderItem[]): string {
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e3dccb">${esc(i.name)}<br>
          <span style="color:#6e6459;font-size:13px">Boja: ${esc(i.color)}</span></td>
        <td style="padding:8px 10px;border-bottom:1px solid #e3dccb;text-align:center">${i.qty}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e3dccb;text-align:right">${money(i.price)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e3dccb;text-align:right"><strong>${money(i.lineTotal)}</strong></td>
      </tr>`,
    )
    .join("");
  return `
    <table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px">
      <thead>
        <tr style="text-align:left;color:#6e6459;font-size:12px;text-transform:uppercase;letter-spacing:.06em">
          <th style="padding:8px 10px">Proizvod</th>
          <th style="padding:8px 10px;text-align:center">Kol.</th>
          <th style="padding:8px 10px;text-align:right">Cena</th>
          <th style="padding:8px 10px;text-align:right">Ukupno</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function totalsBlock(t: OrderPayload["totals"]): string {
  return `
    <table role="presentation" style="border-collapse:collapse;font-size:14px;margin-top:10px">
      <tr><td style="padding:3px 10px;color:#6e6459">Međuzbir</td>
        <td style="padding:3px 10px;text-align:right">${money(t.subtotal)}</td></tr>
      <tr><td style="padding:3px 10px;color:#6e6459">Dostava</td>
        <td style="padding:3px 10px;text-align:right">${t.shippingFree ? "Besplatno" : "Po ceni kurirske službe"}</td></tr>
      <tr><td style="padding:6px 10px;font-size:16px"><strong>Ukupno</strong></td>
        <td style="padding:6px 10px;text-align:right;font-size:16px"><strong>${money(t.total)}</strong></td></tr>
    </table>`;
}

const shell = (title: string, body: string) => `
  <div style="background:#ece5d8;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#2a2420">
    <div style="max-width:600px;margin:0 auto;background:#f5f1e8;border:1px solid #d6cbb8;border-radius:16px;overflow:hidden">
      <div style="padding:20px 24px;border-bottom:1px solid #d6cbb8">
        <span style="font-size:20px;font-weight:700;letter-spacing:.02em">Lumora</span>
      </div>
      <div style="padding:24px">
        <h1 style="font-size:19px;margin:0 0 12px">${esc(title)}</h1>
        ${body}
      </div>
      <div style="padding:16px 24px;border-top:1px solid #d6cbb8;color:#6e6459;font-size:12px">
        Lumora · ${esc(SITE.address.country)} ·
        <a href="mailto:${esc(SITE.email)}" style="color:#4f6f63">${esc(SITE.email)}</a>
      </div>
    </div>
  </div>`;

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
  const c = body.customer;
  const when = new Date().toLocaleString("sr-RS", { timeZone: "Europe/Belgrade" });

  // Uvek upiši u log (Vercel → Logs) da porudžbina ne bi bila izgubljena
  console.log("NOVA PORUDŽBINA", id, JSON.stringify({ customer: c, items: body.items, totals: body.totals }));

  const API_KEY = process.env.RESEND_API_KEY;
  const FROM = process.env.ORDER_FROM || `Lumora <onboarding@resend.dev>`;
  const TO = (process.env.ORDER_TO || SITE.email)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!API_KEY) {
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
    `Nova porudžbina ${id}`,
    `<p style="color:#6e6459;font-size:13px;margin:0 0 16px">${esc(when)} · plaćanje pouzećem</p>
     ${itemsTable(body.items)}
     ${totalsBlock(body.totals)}
     <h2 style="font-size:15px;margin:20px 0 8px">Dostava</h2>
     ${addressHtml}
     ${c.note ? `<h2 style="font-size:15px;margin:20px 0 8px">Napomena</h2><p style="white-space:pre-wrap">${esc(c.note)}</p>` : ""}`,
  );

  const ownerText =
    `Nova porudžbina ${id} (${when})\n\n` +
    body.items
      .map((i) => `- ${i.name} / ${i.color} x${i.qty} = ${money(i.lineTotal)}`)
      .join("\n") +
    `\n\nMeđuzbir: ${money(body.totals.subtotal)}\nDostava: ${
      body.totals.shippingFree ? "Besplatno" : "Po ceni kurirske službe"
    }\nUkupno: ${money(body.totals.total)}\n\n` +
    `${c.firstName} ${c.lastName}\n${c.address}\n${c.zip} ${c.city}\nTel: ${c.phone}\nEmail: ${c.email}\n` +
    (c.note ? `\nNapomena: ${c.note}\n` : "");

  const customerHtml = shell(
    `Hvala na porudžbini, ${esc(c.firstName)}!`,
    `<p style="margin:0 0 14px">Primili smo vašu porudžbinu <strong>${id}</strong> i uskoro je potvrđujemo telefonom.</p>
     ${itemsTable(body.items)}
     ${totalsBlock(body.totals)}
     <p style="margin:16px 0 4px"><strong>Način plaćanja:</strong> pouzećem (gotovinom kuriru).</p>
     <p style="margin:0 0 14px"><strong>Dostava:</strong> ${esc(SITE.deliveryTime)} na adresu:<br>
       ${esc(c.address)}, ${esc(c.zip)} ${esc(c.city)}</p>
     <p style="color:#6e6459;font-size:13px">Ako nešto nije u redu sa porudžbinom, odgovorite na ovaj mejl ili nas pozovite na ${esc(SITE.phone)}.</p>`,
  );

  const customerText =
    `Hvala na porudžbini, ${c.firstName}!\n\nBroj porudžbine: ${id}\n\n` +
    body.items.map((i) => `- ${i.name} / ${i.color} x${i.qty} = ${money(i.lineTotal)}`).join("\n") +
    `\n\nUkupno: ${money(body.totals.total)}\nPlaćanje: pouzećem\nDostava: ${SITE.deliveryTime}\n\nLumora`;

  try {
    const [owner, customer] = await Promise.all([
      resend.emails.send({
        from: FROM,
        to: TO,
        replyTo: c.email,
        subject: `🛒 Porudžbina ${id} — ${c.firstName} ${c.lastName} — ${money(body.totals.total)}`,
        html: ownerHtml,
        text: ownerText,
      }),
      resend.emails.send({
        from: FROM,
        to: c.email,
        subject: `Potvrda porudžbine ${id} — Lumora`,
        html: customerHtml,
        text: customerText,
      }),
    ]);

    if (owner.error) {
      console.error("Resend owner error", owner.error);
      return json(
        { ok: false, error: "Porudžbina je zabeležena, ali slanje mejla nije uspelo." },
        502,
      );
    }
    if (customer.error) console.error("Resend customer error", customer.error);

    return json({ ok: true, orderId: id });
  } catch (e) {
    console.error("Order send failed", e);
    return json(
      { ok: false, error: "Došlo je do greške pri slanju. Pokušajte ponovo." },
      500,
    );
  }
};

export const GET: APIRoute = () =>
  json({ ok: false, error: "Koristi POST." }, 405);
