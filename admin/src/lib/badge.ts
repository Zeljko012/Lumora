// Broj na ikoni aplikacije (kao kod poruka): koliko je novih, nespakovanih porudžbina.
// Radi kad je aplikacija instalirana na početni ekran (Android i iPhone 16.4+).
type BadgeNav = Navigator & { setAppBadge?: (n?: number) => Promise<void>; clearAppBadge?: () => Promise<void> }

export function setBadge(n: number) {
  const nav = navigator as BadgeNav
  try {
    if (n > 0) void nav.setAppBadge?.(n)?.catch(() => {})
    else void nav.clearAppBadge?.()?.catch(() => {})
  } catch {
    /* nije podržano */
  }
}
