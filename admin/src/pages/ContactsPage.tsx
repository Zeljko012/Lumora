import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { Icon } from '../components/Icon'
import { Field, Segmented, Sheet, Switch, TopBar, useUi } from '../components/ui'
import { Loading } from '../components/Guard'
import { campaignEmails, campaignViber, contactsCsv, downloadText, emailOk, filterContacts, upsertContact, viberNumber, type ContactFilter } from '../lib/contacts'
import { normalizePhone } from '../lib/orders'
import { plural } from '../lib/format'
import type { Contact } from '../types'

const SOURCE_LABEL: Record<string, string> = {
  sajt: 'Sajt',
  newsletter: 'Prijava na sajtu',
  rucno: 'Ručno',
  instagram: 'Instagram',
  viber: 'Viber',
  telefon: 'Telefon',
  shopify: 'Shopify',
  email: 'Mejl',
  ostalo: 'Ostalo',
}
const srcLabel = (s: string) => SOURCE_LABEL[s] ?? s

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export default function ContactsPage() {
  const { toast, confirm } = useUi()
  const all = useLiveQuery(() => db.contacts.toArray(), [])
  const [filter, setFilter] = useState<ContactFilter>({ kind: 'svi', consentOnly: false, q: '' })
  const [edit, setEdit] = useState<Contact | 'new' | null>(null)
  const [tools, setTools] = useState(false)

  const live = useMemo(() => (all ?? []).filter((c) => !c.deletedAt), [all])
  const shown = useMemo(() => filterContacts(live, filter).sort((a, b) => b.updatedAt - a.updatedAt), [live, filter])

  if (!all) return <Loading />

  const withEmail = live.filter((c) => c.email).length
  const onlyPhone = live.length - withEmail
  const consented = live.filter((c) => c.marketing === true).length
  const emails = campaignEmails(live)
  const viber = campaignViber(live)

  const copyList = async (text: string, what: string) => toast((await copy(text)) ? `${what} kopirano ✓` : 'Kopiranje nije uspelo — preuzmi fajl')

  return (
    <div className="page">
      <TopBar
        title="Kupci i kontakti"
        sub={`${live.length} ${plural(live.length, 'kontakt', 'kontakta', 'kontakata')}`}
        back
        right={
          <button className="icon-btn" aria-label="Novi kontakt" onClick={() => setEdit('new')}>
            <Icon name="plus" />
          </button>
        }
      />

      <div className="card stack">
        <div className="kv">
          <dt>Imaju mejl</dt>
          <dd>{withEmail}</dd>
          <dt>Samo telefon (Viber)</dt>
          <dd>{onlyPhone}</dd>
          <dt>Pristali na obaveštenja</dt>
          <dd>{consented}</dd>
        </div>
        <button className="btn brand block" onClick={() => setTools(true)} disabled={!live.length}>
          <Icon name="mail" /> Pripremi akciju (mejl / Viber)
        </button>
      </div>

      <div className="stack mt-lg">
        <Field label="Pretraga" placeholder="ime, mejl, telefon ili grad" value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} />
        <Segmented
          value={filter.kind}
          options={[
            { id: 'svi', label: 'Svi' },
            { id: 'mejl', label: 'Imaju mejl' },
            { id: 'telefon', label: 'Samo telefon' },
          ]}
          onChange={(kind) => setFilter({ ...filter, kind })}
        />
        <Switch checked={filter.consentOnly} onChange={(consentOnly) => setFilter({ ...filter, consentOnly })} label="Samo oni koji su pristali na obaveštenja" />
      </div>

      <div className="list mt-lg">
        {shown.length === 0 && (
          <div className="empty">
            {live.length === 0 ? 'Još nema kontakata. Pojaviće se čim neko poruči ili se prijavi na sajtu.' : 'Nema kontakata za ovaj filter.'}
          </div>
        )}
        {shown.slice(0, 300).map((c) => (
          <button key={c.id} className="list-row" onClick={() => setEdit(c)}>
            <div className="main">
              <div className="title">{c.name || c.email || viberNumber(c.phoneNorm)}</div>
              <div className="meta">
                {[c.email, c.phoneNorm && viberNumber(c.phoneNorm), c.city].filter(Boolean).join(' · ')}
              </div>
            </div>
            <span className={`consent-tag ${c.marketing === true ? 'yes' : c.marketing === false ? 'no' : ''}`}>
              {c.marketing === true ? 'pristao' : c.marketing === false ? 'odjavljen' : 'bez pristanka'}
            </span>
          </button>
        ))}
        {shown.length > 300 && <div className="empty">Prikazano prvih 300 od {shown.length}. Suzi pretragu.</div>}
      </div>

      {tools && (
        <Sheet title="Pripremi akciju" onClose={() => setTools(false)}>
          <div className="stack">
            <p className="hint">
              Pošalji samo onima koji su pristali na obaveštenja (kvačica pri porudžbini ili prijava na sajtu). Svaka poruka treba da ima jasnu odjavu.
            </p>

            <div className="card stack">
              <div className="section-title" style={{ marginTop: 0 }}>
                <span className="grow">Mejl · {emails.length}</span>
              </div>
              <button className="btn block" disabled={!emails.length} onClick={() => copyList(emails.join(', '), 'Mejlovi')}>
                <Icon name="copy" /> Kopiraj mejlove
              </button>
              <button
                className="btn block"
                disabled={!emails.length}
                onClick={() => downloadText('lumora-mejlovi.csv', ['Mejl', ...emails].join('\r\n'))}
              >
                <Icon name="download" /> Preuzmi mejlove (CSV)
              </button>
              <small className="hint">Zalepi u „Bcc“ polje svog mejla, ili uvezi CSV u alat za slanje.</small>
            </div>

            <div className="card stack">
              <div className="section-title" style={{ marginTop: 0 }}>
                <span className="grow">Viber (nemaju mejl) · {viber.length}</span>
              </div>
              <button className="btn block" disabled={!viber.length} onClick={() => copyList(viber.map((v) => v.number).join('\n'), 'Brojevi')}>
                <Icon name="copy" /> Kopiraj brojeve
              </button>
              <button
                className="btn block"
                disabled={!viber.length}
                onClick={() => downloadText('lumora-viber.csv', '﻿Ime,Broj\r\n' + viber.map((v) => `"${v.name.replace(/"/g, '""')}",${v.number}`).join('\r\n'))}
              >
                <Icon name="download" /> Preuzmi brojeve (CSV)
              </button>
              <small className="hint">Brojevi su u međunarodnom obliku (+381…), spremni za Viber zajednicu ili grupu.</small>
            </div>

            <button className="btn block" onClick={() => downloadText('lumora-kontakti.csv', contactsCsv(live))}>
              <Icon name="download" /> Preuzmi sve kontakte (CSV)
            </button>
          </div>
        </Sheet>
      )}

      {edit && (
        <ContactSheet
          contact={edit === 'new' ? null : edit}
          onClose={() => setEdit(null)}
          onDelete={async (c) => {
            if (!(await confirm({ title: 'Obrisati kontakt?', message: c.name || c.email || c.phone, confirmText: 'Obriši', danger: true }))) return
            await db.contacts.update(c.id, { deletedAt: Date.now(), key: `deleted:${c.id}` })
            setEdit(null)
            toast('Kontakt je obrisan')
          }}
        />
      )}
    </div>
  )
}

function ContactSheet({ contact, onClose, onDelete }: { contact: Contact | null; onClose: () => void; onDelete: (c: Contact) => void }) {
  const { toast } = useUi()
  const [name, setName] = useState(contact?.name ?? '')
  const [email, setEmail] = useState(contact?.email ?? '')
  const [phone, setPhone] = useState(contact?.phone ?? '')
  const [city, setCity] = useState(contact?.city ?? '')
  const [note, setNote] = useState(contact?.note ?? '')
  const [marketing, setMarketing] = useState<boolean | null>(contact?.marketing ?? null)
  const [source, setSource] = useState('instagram')

  const save = async () => {
    const em = email.trim().toLowerCase()
    if (em && !emailOk(em)) return toast('Mejl nije ispravan')
    if (!em && normalizePhone(phone).length < 8) return toast('Upiši mejl ili broj telefona')
    if (!contact) {
      const c = await upsertContact({ name, email: em, phone, city, source, marketing: marketing === true ? true : undefined })
      if (c && (note || marketing === false)) await db.contacts.update(c.id, { note, marketing })
    } else {
      const phoneNorm = normalizePhone(phone)
      await db.contacts.update(contact.id, {
        name: name.trim(),
        email: em,
        phone: phone.trim(),
        phoneNorm,
        city: city.trim(),
        note: note.trim(),
        marketing,
        key: em || (phoneNorm ? `tel:${phoneNorm}` : contact.key),
        updatedAt: Date.now(),
      })
    }
    toast('Sačuvano')
    onClose()
  }

  return (
    <Sheet
      title={contact ? 'Kontakt' : 'Novi kontakt'}
      onClose={onClose}
      footer={
        <div className="row gap">
          {contact && (
            <button className="btn danger" onClick={() => onDelete(contact)}>
              <Icon name="trash" />
            </button>
          )}
          <button className="btn brand grow" onClick={save}>
            Sačuvaj
          </button>
        </div>
      }
    >
      <div className="stack">
        <Field label="Ime i prezime" value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Mejl" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Telefon" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Field label="Grad" value={city} onChange={(e) => setCity(e.target.value)} />
        <Field label="Beleška" value={note} onChange={(e) => setNote(e.target.value)} />
        {!contact && (
          <div>
            <div className="section-title" style={{ marginTop: 0 }}>Odakle je kontakt</div>
            <div className="chips">
              {['instagram', 'viber', 'telefon', 'rucno', 'ostalo'].map((s) => (
                <button key={s} type="button" className={`chip ${source === s ? 'on' : ''}`} onClick={() => setSource(s)}>
                  {srcLabel(s)}
                </button>
              ))}
            </div>
          </div>
        )}
        <Switch
          checked={marketing === true}
          onChange={(v) => setMarketing(v ? true : null)}
          label="Pristao na obaveštenja o akcijama"
          hint="Uključi samo ako je osoba to rekla ili napisala."
        />
        {contact && (
          <Switch checked={marketing === false} onChange={(v) => setMarketing(v ? false : null)} label="Odjavljen (ne šalji ništa)" />
        )}
        {contact && <small className="hint">Izvor: {contact.sources.map(srcLabel).join(', ') || '—'}</small>}
      </div>
    </Sheet>
  )
}
