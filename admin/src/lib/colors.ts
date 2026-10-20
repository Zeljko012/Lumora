// Shopify izvoz ima boje na engleskom ("black"); u aplikaciji ih prikazujemo na srpskom.

const COLOR_NAMES: Record<string, string> = {
  black: 'crna',
  white: 'bela',
  red: 'crvena',
  pink: 'roze',
  gray: 'siva',
  grey: 'siva',
  green: 'zelena',
  beige: 'bež',
  blue: 'plava',
  navy: 'teget',
  yellow: 'žuta',
  orange: 'narandžasta',
  purple: 'ljubičasta',
  brown: 'braon',
  gold: 'zlatna',
  silver: 'srebrna',
  transparent: 'providna',
}

const SWATCHES: Record<string, string> = {
  crna: '#1c1a17',
  bela: '#ffffff',
  crvena: '#c8352e',
  roze: '#f2a7bb',
  siva: '#9a9893',
  zelena: '#6f7f45',
  'maslinasto zelena': '#6b7256',
  bež: '#dcc9a8',
  plava: '#3d64c4',
  teget: '#23305a',
  žuta: '#f0c537',
  narandžasta: '#e8792d',
  ljubičasta: '#7d4fb0',
  braon: '#7a5032',
  zlatna: '#c9a54a',
  srebrna: '#c7c9cc',
}

export function translateColor(raw: string) {
  const key = raw.trim().toLowerCase()
  return COLOR_NAMES[key] ?? raw.trim()
}

export function swatch(color: string) {
  return SWATCHES[color.trim().toLowerCase()] ?? null
}
