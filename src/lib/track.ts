// Anonimno brojanje poseta (v. src/pages/api/hit.ts). Ne koristi kolačiće; oznaka posete živi samo dok je kartica otvorena.
// Ne broji vlasnika (prijavljenog u aplikaciju u istom pregledaču) ni posete sa ?notrack.
const host = location.hostname;
const local = host === "localhost" || host === "127.0.0.1" || host.endsWith(".github.io");

function skip(): boolean {
  try {
    if (new URLSearchParams(location.search).has("notrack")) localStorage.setItem("lumora.noTrack", "1");
    if (localStorage.getItem("lumora.noTrack")) return true;
    // prijavljen vlasnik (aplikacija je na istom sajtu): njegove posete se ne broje
    if (localStorage.getItem("lumora.auth")) return true;
  } catch {
    /* bez localStorage-a broji se normalno */
  }
  return false;
}

function sessionId(): string {
  try {
    let s = sessionStorage.getItem("lumora.sid");
    if (!s) {
      s = Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 20);
      sessionStorage.setItem("lumora.sid", s);
    }
    return s;
  } catch {
    return Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  }
}

function send(kind: "pv" | "hb", sid: string) {
  const body = JSON.stringify({ sid, kind, path: location.pathname, ref: kind === "pv" ? document.referrer : "" });
  const url = "/api/hit";
  try {
    if (navigator.sendBeacon?.(url, new Blob([body], { type: "application/json" }))) return;
  } catch {
    /* pokušaj običnim zahtevom */
  }
  void fetch(url, { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
}

if (!local && !skip()) {
  const sid = sessionId();
  send("pv", sid);
  // "uživo": dok je kartica vidljiva javlja se na 30 sekundi
  setInterval(() => {
    if (document.visibilityState === "visible") send("hb", sid);
  }, 30_000);
}
