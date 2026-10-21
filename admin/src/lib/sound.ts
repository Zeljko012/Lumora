// Zvuk i vibracija za novu porudžbinu. Zvuk se pravi u samom pregledaču (nema fajlova).
// Pregledači dozvoljavaju zvuk tek posle prvog dodira ekrana, zato se "otključava" na prvi dodir.

const KEY = 'lumora.sound'

let ctx: AudioContext | null = null

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    /* nije bitno */
  }
}

function getCtx(): AudioContext | null {
  if (ctx) return ctx
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  try {
    ctx = new AC()
  } catch {
    ctx = null
  }
  return ctx
}

/** Da li će zvuk sada stvarno zasvirati (ili ga pregledač još blokira do prvog dodira). */
export function audioReady(): boolean {
  return !!ctx && ctx.state === 'running'
}

export async function unlockAudio() {
  const c = getCtx()
  if (c && c.state === 'suspended') {
    try {
      await c.resume()
    } catch {
      /* ostaje zaključano do sledećeg dodira */
    }
  }
}

let unlockInstalled = false
export function installAudioUnlock() {
  if (unlockInstalled) return
  unlockInstalled = true
  const handler = () => {
    void unlockAudio().then(() => {
      if (audioReady()) {
        window.removeEventListener('pointerdown', handler)
        window.removeEventListener('keydown', handler)
      }
    })
  }
  window.addEventListener('pointerdown', handler)
  window.addEventListener('keydown', handler)
}

/** Metalni zvuk zvona (kao kasa): nekoliko neharmonijskih tonova koji brzo zamiru. */
function bell(c: AudioContext, freq: number, start: number, dur: number, gain: number) {
  const partials: [number, number][] = [
    [1, 1],
    [2.76, 0.55],
    [5.4, 0.3],
    [8.93, 0.14],
  ]
  for (const [ratio, amp] of partials) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq * ratio
    g.gain.setValueAtTime(0.0001, start)
    g.gain.exponentialRampToValueAtTime(gain * amp, start + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur / Math.sqrt(ratio))
    osc.connect(g).connect(c.destination)
    osc.start(start)
    osc.stop(start + dur + 0.05)
  }
}

/** „Ka": kratak mehanički klik kase. */
function click(c: AudioContext, start: number) {
  const len = Math.floor(c.sampleRate * 0.05)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = c.createBufferSource()
  src.buffer = buf
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 2200
  const g = c.createGain()
  g.gain.value = 0.5
  src.connect(bp).connect(g).connect(c.destination)
  src.start(start)
  const thump = c.createOscillator()
  const tg = c.createGain()
  thump.type = 'triangle'
  thump.frequency.setValueAtTime(220, start)
  thump.frequency.exponentialRampToValueAtTime(90, start + 0.08)
  tg.gain.setValueAtTime(0.3, start)
  tg.gain.exponentialRampToValueAtTime(0.0001, start + 0.1)
  thump.connect(tg).connect(c.destination)
  thump.start(start)
  thump.stop(start + 0.12)
}

/** „Ka-ching!" — kratak zvuk naplate (jednom). */
export async function playChime(force = false) {
  if (!force && !soundEnabled()) return
  const c = getCtx()
  if (!c) return
  await unlockAudio()
  if (c.state !== 'running') return
  const t = c.currentTime + 0.05
  click(c, t)
  bell(c, 1568, t + 0.07, 0.6, 0.16)
  bell(c, 2093, t + 0.2, 0.8, 0.2)
}

export function vibrate() {
  try {
    navigator.vibrate?.([200, 100, 200, 100, 300])
  } catch {
    /* nije podržano */
  }
}

/** Sve odjednom: zvuk + vibracija. */
export async function alertNewOrder() {
  vibrate()
  await playChime()
}
