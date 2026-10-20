const moneyFmt = new Intl.NumberFormat('sr-Latn-RS', { maximumFractionDigits: 0 })

export const money = (n: number, currency = 'RSD') => `${moneyFmt.format(Math.round(n || 0))} ${currency}`

const pad = (n: number) => String(n).padStart(2, '0')

export function dateShort(ts: number) {
  const d = new Date(ts)
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}.`
}

export function dateTime(ts: number) {
  const d = new Date(ts)
  return `${dateShort(ts)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** "danas 14:05", "juče 09:12" ili datum */
export function dateRelative(ts: number) {
  const d = new Date(ts)
  const today = new Date()
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  if (ts >= startToday) return `danas ${time}`
  if (ts >= startToday - 86400000) return `juče ${time}`
  return dateShort(ts)
}

/** broj komada sa pravilnim oblikom: 1 komad, 2 komada, 5 komada */
export function pieces(n: number) {
  return `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'komad' : 'komada'}`
}

/** srpska množina: plural(5, 'porudžbina', 'porudžbine', 'porudžbina') */
export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

/** uklanja dijakritike i mala slova — za pretragu */
export function fold(s: string) {
  return (s || '')
    .toLowerCase()
    .replace(/đ/g, 'dj')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}
