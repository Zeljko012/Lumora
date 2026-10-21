// Web Push: obaveštenje na telefon (sa zvukom telefona) i kad je aplikacija zatvorena.
// Potrebno: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT + Supabase. Bez toga se tiho preskače.
import { sbDelete, sbSelect, supabaseConfigured } from "./supabase";

interface SubRow {
  endpoint: string;
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
}

export const pushConfigured = () =>
  supabaseConfigured() && !!process.env.VAPID_PUBLIC_KEY && !!process.env.VAPID_PRIVATE_KEY;

export async function sendPush(title: string, body: string, url = "#/porudzbine"): Promise<number> {
  if (!pushConfigured()) return 0;
  const webpush = (await import("web-push")).default;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:homedecorlumora@gmail.com",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  const subs = await sbSelect<SubRow>("push_subscriptions", "select=endpoint,subscription&limit=50");
  const payload = JSON.stringify({ title, body, url });
  let sent = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(s.subscription, payload, { TTL: 3600, urgency: "high" });
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        // pretplata je istekla ili je telefon odjavljen — ukloni je
        if (code === 404 || code === 410) await sbDelete("push_subscriptions", `endpoint=eq.${encodeURIComponent(s.endpoint)}`);
        else console.error("Push nije poslat", code ?? e);
      }
    }),
  );
  return sent;
}
