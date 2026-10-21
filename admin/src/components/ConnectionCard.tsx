import { useEffect, useState, useSyncExternalStore } from 'react'
import { Field, Switch, useUi } from './ui'
import { Icon } from './Icon'
import { cleanProjectUrl, currentUserEmail, getRemoteConfig, remoteConfigured, saveRemoteConfig, signIn, signOut } from '../lib/remote'
import { getInboxStatus, onInboxStatus, pullInbox, remoteChanged } from '../lib/inbox'
import { audioReady, playChime, setSoundEnabled, soundEnabled, unlockAudio } from '../lib/sound'
import { dateTime } from '../lib/format'
import { disablePush, enablePush, pushSubscribed, pushSupported } from '../lib/push'

const useInboxStatus = () => useSyncExternalStore(onInboxStatus, getInboxStatus)

/** Povezivanje sa sajtom: prijava vlasničkim nalogom + zvuk obaveštenja. */
export function ConnectionCard() {
  const { toast } = useUi()
  const status = useInboxStatus()
  const cfg = getRemoteConfig()
  const [url, setUrl] = useState(cfg?.url ?? '')
  const [key, setKey] = useState(cfg?.key ?? '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sound, setSound] = useState(soundEnabled())
  const [notif, setNotif] = useState<NotificationPermission | 'unsupported'>('Notification' in window ? Notification.permission : 'unsupported')
  const [open, setOpen] = useState(!remoteConfigured())
  const [pushOn, setPushOn] = useState(false)
  useEffect(() => {
    void pushSubscribed().then(setPushOn)
  }, [])

  useEffect(() => {
    if (remoteConfigured()) void currentUserEmail().then(setUser)
  }, [status.state])

  const connected = status.state === 'ok'
  const tone = connected ? 'ok' : status.state === 'error' ? 'bad' : status.state === 'login' ? 'warn' : ''
  const label = connected
    ? 'Povezano · porudžbine stižu same'
    : status.state === 'error'
      ? 'Greška u vezi'
      : status.state === 'login'
        ? 'Treba prijava'
        : 'Nije povezano'

  const connect = async () => {
    if (!url.trim() || !key.trim()) return toast('Upiši adresu baze i javni ključ')
    if (!/^https:\/\//i.test(url.trim())) return toast('Adresa baze treba da počinje sa https://')
    setBusy(true)
    try {
      setUrl(cleanProjectUrl(url))
      saveRemoteConfig({ url, key })
      await unlockAudio()
      if (!user) {
        if (!email.trim() || !password) throw new Error('Upiši mejl i lozinku svog naloga')
        await signIn(email, password)
        setPassword('')
      }
      remoteChanged()
      await pullInbox(true)
      setUser(await currentUserEmail())
      toast('Povezano ✓')
      setOpen(false)
    } catch (e) {
      toast((e as Error).message || 'Povezivanje nije uspelo')
    } finally {
      setBusy(false)
    }
  }

  const disconnect = async () => {
    await signOut()
    saveRemoteConfig(null)
    setUser(null)
    setOpen(true)
    remoteChanged()
    await pullInbox()
  }

  return (
    <>
      <div className="section-title">Povezivanje sa sajtom</div>
      <div className="card stack">
        <div className={`conn ${tone}`}>
          <i /> {label}
        </div>
        {connected && status.lastSync && <small className="hint">Poslednja provera: {dateTime(status.lastSync)}</small>}
        {status.message && <small className="hint">{status.message}</small>}
        <small className="hint">
          Porudžbine sa sajta same ulaze u listu i stiže zvuk. Mejl sa porudžbinom i dalje stiže kao rezerva ako veza ne radi.
        </small>

        {remoteConfigured() && (
          <div className="row gap">
            <button className="btn grow" onClick={() => void pullInbox(true).then(() => toast('Provereno'))}>
              <Icon name="refresh" /> Proveri sada
            </button>
            <button className="btn" onClick={() => setOpen(!open)}>
              {open ? 'Sakrij' : 'Podešavanje'}
            </button>
          </div>
        )}

        {open && (
          <div className="stack">
            <Field label="Adresa baze (Project URL)" placeholder="https://xxxx.supabase.co" value={url} onChange={(e) => setUrl(e.target.value)} autoCapitalize="off" autoCorrect="off" />
            <Field label="Javni ključ (anon / publishable)" value={key} onChange={(e) => setKey(e.target.value)} autoCapitalize="off" autoCorrect="off" />
            {user ? (
              <small className="hint">Prijavljen kao {user}</small>
            ) : (
              <>
                <Field label="Mejl naloga" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
                <Field label="Lozinka" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              </>
            )}
            <button className="btn brand block" onClick={connect} disabled={busy}>
              {busy ? 'Povezujem…' : user ? 'Sačuvaj i proveri' : 'Poveži i prijavi se'}
            </button>
            {remoteConfigured() && (
              <button className="btn block" onClick={disconnect}>
                Odjavi i prekini vezu
              </button>
            )}
          </div>
        )}
      </div>

      <div className="section-title">Zvuk obaveštenja</div>
      <div className="card stack">
        <Switch
          checked={sound}
          onChange={(v) => {
            setSound(v)
            setSoundEnabled(v)
            if (v) void playChime(true)
          }}
          label="Zvuk i vibracija kad stigne porudžbina"
          hint="Radi dok je aplikacija otvorena. Prvi dodir ekrana posle otvaranja uključuje zvuk."
        />
        <button className="btn block" onClick={async () => {
          await unlockAudio()
          await playChime(true)
          if (!audioReady()) toast('Zvuk je blokiran — proveri da telefon nije na nemom')
        }}>
          Probaj zvuk
        </button>
        {pushSupported() && (
          <>
            <button
              className="btn block"
              disabled={!connected && !pushOn}
              onClick={async () => {
                try {
                  if (pushOn) await disablePush()
                  else await enablePush()
                  setPushOn(await pushSubscribed())
                  setNotif('Notification' in window ? Notification.permission : 'unsupported')
                  toast(pushOn ? 'Obaveštenja isključena' : 'Obaveštenja uključena ✓')
                } catch (e) {
                  toast((e as Error).message || 'Nije uspelo')
                }
              }}
            >
              {pushOn ? 'Obaveštenja na telefonu: uključena ✓ (dodirni da isključiš)' : 'Uključi obaveštenja na ovom telefonu'}
            </button>
            <small className="hint">
              Telefon oglasi svoj zvuk obaveštenja i kad je aplikacija zatvorena. Potrebna je veza sa sajtom; na iPhone-u prvo dodaj aplikaciju na početni ekran. Mejl ostaje rezerva.
            </small>
          </>
        )}
      </div>
    </>
  )
}
