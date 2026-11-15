import type { APIRoute } from "astro";
import { cleanItems, reminderReady, scheduleCartReminders } from "../../lib/cartReminder";

export const prerender = false;

/**
 * Poziva ga kasa kad kupac upiše mejl: zakazuje podsetnike za napuštenu korpu (posle 1 h i 24 h).
 * Otkazuju se sami kad kupac završi porudžbinu (v. api/order.ts).
 */
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export const POST: APIRoute = async ({ request }) => {
  let b: any;
  try {
    const raw = await request.text();
    if (raw.length > 10_000) return json({ ok: false }, 413);
    b = JSON.parse(raw);
  } catch {
    return json({ ok: false }, 400);
  }
  const email = typeof b?.email === "string" ? b.email.trim() : "";
  const cartId = typeof b?.cartId === "string" ? b.cartId : "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) return json({ ok: false }, 400);
  if (!/^[A-Za-z0-9-]{8,64}$/.test(cartId)) return json({ ok: false }, 400);
  const items = cleanItems(b?.items);
  if (!items.length) return json({ ok: false }, 400);

  if (!(await reminderReady())) return json({ ok: false, skipped: "not-configured" }, 200);
  const ok = await scheduleCartReminders({
    cartId,
    email,
    firstName: typeof b?.firstName === "string" ? b.firstName : "",
    items,
  });
  return json({ ok });
};
