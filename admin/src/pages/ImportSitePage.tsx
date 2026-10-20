import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { TopBar, useUi } from '../components/ui'
import { countUnmatched, decodeSiteOrder, findImported, importSiteOrder, type SiteOrderPayload } from '../lib/siteOrder'
import { dateTime, money, plural } from '../lib/format'
import type { Order } from '../types'

export default function ImportSitePage() {
  const nav = useNavigate()
  const { toast } = useUi()
  const [params, setParams] = useSearchParams()
  const [text, setText] = useState('')
  const [payload, setPayload] = useState<SiteOrderPayload | null>(null)
  const [existing, setExisting] = useState<Order | null>(null)
  const [unmatched, setUnmatched] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const code = params.get('d')

  const load = async (input: string) => {
    setError('')
    try {
      const p = await decodeSiteOrder(input)
      setPayload(p)
      setExisting((await findImported(p.id)) ?? null)
      setUnmatched(await countUnmatched(p))
    } catch (e) {
      setPayload(null)
      setError((e as Error).message)
    }
  }

  useEffect(() => {
    if (code) void load(code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  const paste = async () => {
    try {
      const t = await navigator.clipboard.readText()
      if (!t.trim()) return toast('Klipbord je prazan')
      setText(t)
      await load(t)
    } catch {
      toast('Ne mogu da pročitam klipbord — nalepi ručno u polje')
    }
  }

  const add = async () => {
    if (!payload) return
    setBusy(true)
    try {
      const order = await importSiteOrder(payload)
      toast(`Dodato: porudžbina #${order.number}`)
      nav(`/porudzbina/${order.id}`, { replace: true })
    } catch (e) {
      setError((e as Error).message || 'Porudžbina nije dodata')
      setBusy(false)
    }
  }

  const reset = () => {
    setPayload(null)
    setExisting(null)
    setText('')
    setError('')
    if (params.has('d')) setParams({}, { replace: true })
  }

  const items = payload?.items ?? []
  const pcs = items.reduce((s, i) => s + i.qty, 0)

  return (
    <div className={`page ${payload ? 'with-footer' : ''}`}>
      <TopBar title="Porudžbina sa sajta" back="/" />

      {!payload && (
        <>
          <div className="notice blue" style={{ marginBottom: 12 }}>
            <Icon name="mail" />
            <span className="grow">
              Kad kupac poruči na sajtu, na mejl ti stiže poruka sa dugmetom <b>„Otvori u aplikaciji“</b>. Dodirni ga — porudžbina se otvara ovde.
              Ako se ne otvori sama, kopiraj link iz mejla i nalepi ga ispod.
            </span>
          </div>
          <div className="card stack">
            <label className="field">
              <span>Link ili kod porudžbine</span>
              <textarea className="textarea code-box" value={text} onChange={(e) => setText(e.target.value)} placeholder="Nalepi ceo link iz mejla…" />
            </label>
            {error && (
              <div className="notice red">
                <Icon name="alert" />
                <span className="grow">{error}</span>
              </div>
            )}
            <div className="btn-row">
              <button className="btn" onClick={paste}>
                <Icon name="copy" /> Nalepi
              </button>
              <button className="btn brand" disabled={!text.trim()} onClick={() => load(text)}>
                Pročitaj
              </button>
            </div>
          </div>
          <p className="small muted" style={{ margin: '12px 4px' }}>
            Nema linka? Porudžbinu možeš uneti i ručno: <Link to="/nova" className="link-btn">Nova porudžbina</Link>.
          </p>
        </>
      )}

      {payload && (
        <>
          {existing ? (
            <div className="notice green" style={{ marginBottom: 12 }}>
              <Icon name="check" />
              <span className="grow">
                <b>Već dodato</b> kao porudžbina #{existing.number}.
              </span>
            </div>
          ) : (
            unmatched > 0 && (
              <div className="notice amber" style={{ marginBottom: 12 }}>
                <Icon name="alert" />
                <span className="grow">
                  {unmatched} {plural(unmatched, 'stavka nije', 'stavke nisu', 'stavki nije')} pronađeno u katalogu (npr. nova boja ili proizvod). Biće dodato kao običan tekst, a zaliha se za to ne menja.
                </span>
              </div>
            )
          )}

          <div className="card">
            <div className="section-title" style={{ marginTop: 0 }}>
              <span className="grow">Kupac</span>
              <span className="badge blue">{payload.id}</span>
            </div>
            <dl className="kv">
              <dt>Ime</dt>
              <dd>
                {payload.customer.firstName} {payload.customer.lastName}
              </dd>
              <dt>Telefon</dt>
              <dd>
                <a href={`tel:${payload.customer.phone}`}>{payload.customer.phone}</a>
              </dd>
              <dt>Adresa</dt>
              <dd>
                {payload.customer.address}, {payload.customer.zip} {payload.customer.city}
              </dd>
              <dt>Mejl</dt>
              <dd style={{ overflowWrap: 'anywhere' }}>{payload.customer.email}</dd>
              <dt>Poručeno</dt>
              <dd>{dateTime(Date.parse(payload.at) || Date.now())}</dd>
              {payload.customer.note && (
                <>
                  <dt>Napomena</dt>
                  <dd style={{ whiteSpace: 'pre-wrap' }}>{payload.customer.note}</dd>
                </>
              )}
            </dl>
          </div>

          <div className="card">
            <div className="section-title" style={{ marginTop: 0 }}>
              <span className="grow">Stavke · {pcs} kom</span>
            </div>
            {items.map((i, n) => (
              <div className="item-row" style={{ gridTemplateColumns: '1fr auto' }} key={n}>
                <div>
                  <div className="name">
                    {i.qty} × {i.name}
                  </div>
                  <div className="opts">{i.color}</div>
                </div>
                <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{money(i.qty * i.price)}</strong>
              </div>
            ))}
            <div className="totals" style={{ marginTop: 6 }}>
              <div className="row">
                <span>Plaćanje</span>
                <span>Pouzećem</span>
              </div>
              <div className="row">
                <span>Dostava</span>
                <span>{payload.shippingFree ? 'Besplatna (plaćaš ti)' : 'Plaća kupac kuriru'}</span>
              </div>
              <div className="row big">
                <span>Otkupnina</span>
                <span>{money(payload.subtotal)}</span>
              </div>
            </div>
          </div>

          <div className="footer-bar">
            <button className="btn" style={{ minWidth: 0 }} onClick={reset}>
              Drugi link
            </button>
            {existing ? (
              <button className="btn brand" style={{ flex: 1 }} onClick={() => nav(`/porudzbina/${existing.id}`)}>
                Otvori porudžbinu
              </button>
            ) : (
              <button className="btn brand" style={{ flex: 1 }} disabled={busy} onClick={add}>
                <Icon name="plus" /> Dodaj u porudžbine
              </button>
            )}
          </div>
          {error && (
            <div className="notice red mt">
              <Icon name="alert" />
              <span className="grow">{error}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
