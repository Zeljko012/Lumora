import type { APIRoute } from "astro";
import { Resend } from "resend";
import { SITE } from "../../data/site";
import { supabaseConfigured, upsertContact } from "../../lib/supabase";

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

/** Prijava na obaveštenja (newsletter): upisuje mejl u listu kontakata + šalje obaveštenje vlasniku kao rezervu. */
export const POST: APIRoute = async ({ request }) => {
  let body: { email?: string; company?: string };
  try {
    const raw = await request.text();
    if (raw.length > 2000) return json({ ok: false, error: "Zahtev je prevelik." }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "Neispravan zahtev." }, 400);
  }
  if (body.company) return json({ ok: true }); // honeypot: botovi popunjavaju skriveno polje
  const email = (body.email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) {
    return json({ ok: false, error: "Unesite ispravnu email adresu." }, 400);
  }

  let stored = false;
  if (supabaseConfigured()) {
    try {
      await upsertContact({ email, source: "newsletter", marketing: true });
      stored = true;
    } catch (e) {
      console.error("Kontakt nije upisan", e);
    }
  }

  // rezerva: mejl vlasniku (ako nema baze, ovo je jedini trag o prijavi)
  let mailed = false;
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const to = (process.env.ORDER_TO || SITE.email).split(",").map((s) => s.trim()).filter(Boolean);
      const r = await new Resend(apiKey).emails.send({
        from: process.env.ORDER_FROM || "Lumora <onboarding@resend.dev>",
        to,
        subject: `Nova prijava na obaveštenja — ${email}`,
        text: `Nova prijava na obaveštenja o akcijama i novim modelima:\n\n${email}\n\nKupac je pristao na slanje obaveštenja.`,
      });
      mailed = !r.error;
    } catch (e) {
      console.error("Mejl o prijavi nije poslat", e);
    }
  }
  console.log("PRIJAVA NA OBAVEŠTENJA", email, { stored, mailed });

  if (!stored && !mailed) {
    return json({ ok: false, error: "Prijava trenutno nije moguća. Pokušajte kasnije." }, 503);
  }
  return json({ ok: true });
};

export const GET: APIRoute = () => json({ ok: false, error: "Koristi POST." }, 405);
