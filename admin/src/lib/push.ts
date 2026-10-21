// Pretplata telefona na obaveštenja sajta (Web Push). Server šalje poruku kad stigne porudžbina,
// pa telefon oglasi svoj zvuk obaveštenja i kad je aplikacija zatvorena.
import { getClient } from './remote'

// javni VAPID ključ (nije tajna); privatni ključ je samo na serveru sajta
const PUBLIC_KEY = (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) || 'BDs1SFTkIULevVDcHCI3t57Kz-dBEjJqT7M7EHmFJzXoZ-_qECiUKUgLH8EeQtQB1l_fCvU_VTqcPNaqndm7HM0'

export const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

const toKey = (b64: string) => {
  const s = (b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(s)
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

export async function pushSubscribed(): Promise<boolean> {
  if (!pushSupported()) return false
  const reg = await navigator.serviceWorker.getRegistration()
  return !!(await reg?.pushManager.getSubscription())
}

export async function enablePush(): Promise<void> {
  if (!pushSupported()) throw new Error('Ovaj pregledač ne podržava push obaveštenja. Na iPhone-u prvo dodaj aplikaciju na početni ekran.')
  const client = getClient()
  if (!client) throw new Error('Prvo poveži aplikaciju sa sajtom.')
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') throw new Error('Obaveštenja nisu dozvoljena u telefonu.')
  const reg = await navigator.serviceWorker.ready
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(PUBLIC_KEY) as BufferSource }))
  const { error } = await client.from('push_subscriptions').upsert({ endpoint: sub.endpoint, subscription: sub.toJSON() }, { onConflict: 'endpoint' })
  if (error) throw new Error(error.message)
}

export async function disablePush(): Promise<void> {
  const reg = await navigator.serviceWorker.getRegistration()
  const sub = await reg?.pushManager.getSubscription()
  if (!sub) return
  await getClient()?.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
  await sub.unsubscribe()
}
