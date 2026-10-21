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

function note(c: AudioContext, freq: number, start: number, dur: number, gain = 0.22) {
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(gain, start + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(g).connect(c.destination)
  osc.start(start)
  osc.stop(start + dur + 0.05)
}

/** Kratka "kasa" melodija: tri tona naviše, dva puta. */
export async function playChime(force = false) {
  if (!force && !soundEnabled()) return
  const c = getCtx()
  if (!c) return
  await unlockAudio()
  if (c.state !== 'running') return
  const t = c.currentTime + 0.05
  const seq = [659.25, 783.99, 1046.5]
  for (let rep = 0; rep < 2; rep++) {
    seq.forEach((f, i) => note(c, f, t + rep * 0.75 + i * 0.16, rep === 1 && i === 2 ? 0.55 : 0.32))
  }
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
