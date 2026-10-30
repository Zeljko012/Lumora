// Meta Pixel (Facebook/Instagram oglasi). Učitava se TEK posle saglasnosti posetioca (baner za kolačiće),
// i nikad za vlasnika (prijavljen u aplikaciju u istom pregledaču), na probnim adresama ili uz ?notrack.
// Identifikator proizvoda u događajima je `slug` (isti kao sku u šemi) — u Meta katalogu mora biti isti ID.
import { SITE } from "../data/site";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: unknown;
};
declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const KEY = "lumora.consent";
export type Consent = "granted" | "denied" | null;

export function getConsent(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(v: Consent): void {
  try {
    if (v) localStorage.setItem(KEY, v);
    else localStorage.removeItem(KEY);
  } catch {
    /* privatni režim: izbor važi samo dok je stranica otvorena */
  }
  window.dispatchEvent(new Event("lumora:consent"));
}

/** true = ovde se nikad ne meri (vlasnik, probna adresa, ?notrack, "Do Not Track"). */
export function measuringBlocked(): boolean {
  if (typeof window === "undefined") return true;
  const host = location.hostname;
  const local = host === "localhost" || host === "127.0.0.1" || host.endsWith(".github.io");
  // lumora.pxDebug: samo za proveru na lokalnom računaru
  if (local && !localStorage.getItem("lumora.pxDebug")) return true;
  if (navigator.doNotTrack === "1") return true;
  try {
    if (new URLSearchParams(location.search).has("notrack")) localStorage.setItem("lumora.noTrack", "1");
    if (localStorage.getItem("lumora.noTrack")) return true;
    if (localStorage.getItem("lumora.auth")) return true;
  } catch {
    /* bez localStorage-a meri se samo uz saglasnost */
  }
  return false;
}

type Pending = [string, Record<string, unknown> | undefined, Record<string, unknown> | undefined];
const pending: Pending[] = [];
let loaded = false;

function load(): void {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  // standardni Meta kod
  const w = window;
  if (!w.fbq) {
    // isto kao originalni Meta kod: red čuva `arguments` objekte
    const n: Fbq = function () {
      // eslint-disable-next-line prefer-rest-params
      if (n.callMethod) n.callMethod.apply(n, arguments as unknown as unknown[]);
      // eslint-disable-next-line prefer-rest-params
      else (n.queue as unknown[]).push(arguments);
    } as Fbq;
    if (!w._fbq) w._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    w.fbq = n;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
  }
  w.fbq!("init", SITE.metaPixelId);
  w.fbq!("track", "PageView");
}

function flush(): void {
  while (pending.length) {
    const [event, params, opts] = pending.shift()!;
    window.fbq!("track", event, params ?? {}, opts ?? {});
  }
}

/** Šalje događaj Meta-i ako je posetilac dozvolio; ako se još nije izjasnio, čeka odgovor. */
export function px(event: string, params?: Record<string, unknown>, opts?: Record<string, unknown>): void {
  if (typeof window === "undefined" || measuringBlocked()) return;
  const c = getConsent();
  if (c === "denied") return;
  if (c === "granted") {
    load();
    window.fbq!("track", event, params ?? {}, opts ?? {});
  } else {
    pending.push([event, params, opts]);
  }
}

if (typeof window !== "undefined" && !measuringBlocked()) {
  if (getConsent() === "granted") load();
  window.addEventListener("lumora:consent", () => {
    if (measuringBlocked()) return;
    if (getConsent() === "granted") {
      load();
      flush();
    } else {
      pending.length = 0;
    }
  });
}
