import type { APIRoute } from "astro";
import { sbRpc, supabaseConfigured } from "../../lib/supabase";

export const prerender = false;

const noContent = () => new Response(null, { status: 204 });
const BOT =
  /bot|crawl|spider|slurp|bing|facebookexternalhit|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|go-http|axios|node-fetch/i;

/**
 * Anonimna statistika posete: samo nasumična oznaka posete, putanja stranice i domen izvora.
 * Bez kolačića, bez IP adresa i bez ličnih podataka.
 */
export const POST: APIRoute = async ({ request, url }) => {
  if (!supabaseConfigured()) return noContent();
  const ua = request.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return noContent();

  let body: { sid?: string; path?: string; ref?: string; kind?: string };
  try {
    const raw = await request.text();
    if (raw.length > 1000) return noContent();
    body = JSON.parse(raw);
  } catch {
    return noContent();
  }

  const sid = String(body.sid || "");
  const path = String(body.path || "/").slice(0, 200);
  if (!/^[a-z0-9]{8,32}$/.test(sid) || !path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) {
    return noContent();
  }
  const kind = body.kind === "hb" ? "hb" : "pv";

  // izvor: samo domen, i to samo ako nije naš sajt
  let ref = "";
  try {
    if (body.ref) {
      const h = new URL(String(body.ref)).hostname.replace(/^www\./, "");
      if (h && h !== url.hostname.replace(/^www\./, "")) ref = h.slice(0, 80);
    }
  } catch {
    /* nevažeći izvor se ignoriše */
  }
  const device = /Mobi|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";

  try {
    await sbRpc("track_hit", { p_sid: sid, p_path: path, p_ref: ref, p_device: device, p_kind: kind });
  } catch (e) {
    console.error("Statistika posete nije upisana", e);
  }
  return noContent();
};

export const GET: APIRoute = () => new Response(null, { status: 405 });
