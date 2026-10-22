import { useEffect, useState } from 'react'
import { db, getSettings, saveSettings } from '../db'
import { Icon } from '../components/Icon'
import { ConnectionCard } from '../components/ConnectionCard'
import { Field, NumberField, Segmented, Switch, TopBar, useUi } from '../components/ui'
import { exportJson, exportOrdersCsv, exportProductsCsv, importJson } from '../lib/backup'
import { resetOrdersLocal } from '../lib/reset'
import { addDemoData, hasDemoData, removeDemoData } from '../lib/demo'
import type { Courier, Settings } from '../types'

export default function SettingsPage() {
  const { toast, confirm } = useUi()
  const [s, setS] = useState<Settings | null>(null)
  const [dirty, setDirty] = useState(false)
  const [stats, setStats] = useState({ orders: 0, products: 0 })
  const [demo, setDemo] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getSettings().then(setS)
    Promise.all([db.orders.filter((o) => !o.deletedAt).count(), db.products.filter((p) => !p.deletedAt).count()]).then(([orders, products]) =>
      setStats({ orders, products }),
    )
  }, [])

  useEffect(() => {
    hasDemoData().then(setDemo)
  }, [])

  if (!s) return null

  const set = (patch: Partial<Settings>) => {
    setS({ ...s, ...patch })
    setDirty(true)
  }
  const setSender = (patch: Partial<Settings['sender']>) => set({ sender: { ...s.sender, ...patch } })
  const setCourier = (id: string, patch: Partial<Courier>) => set({ couriers: s.couriers.map((c) => (c.id === id ? { ...c, ...patch } : c)) })

  const save = async () => {
    await saveSettings({ ...s, couriers: s.couriers.filter((c) => c.name.trim()) })
    setDirty(false)
    toast('Podešavanja su sačuvana')
  }

  const toggleDemo = async () => {
    setBusy(true)
    try {
      if (demo) {
        const n = await removeDemoData()
        setDemo(false)
        toast(`Obrisano: ${n}`)
      } else {
        const n = await addDemoData()
        setDemo(true)
        toast(`Dodato ${n} probnih porudžbina`)
      }
    } catch (e) {
      toast((e as Error).message || 'Nije uspelo')
    } finally {
      setBusy(false)
    }
  }

  const onRestore = async (f: File | undefined) => {
    if (!f) return
    const ok = await confirm({
      title: 'Vratiti podatke iz backup-a?',
      message: 'Podaci iz fajla se spajaju sa postojećim. Ako isti zapis postoji na oba mesta, ostaje noviji.',
      confirmText: 'Vrati',
    })
    if (!ok) return
    try {
      const n = await importJson(await f.text())
      toast(`Vraćeno ${n} zapisa`)
      setTimeout(() => location.reload(), 800)
    } catch (e) {
      toast((e as Error).message || 'Fajl nije ispravan')
    }
  }

  return (
    <div className="page with-footer">
      <TopBar title="Podešavanja" back="/vise" />

      <div className="section">
        <ConnectionCard />

        <div className="section-title">Moji podaci (pošiljalac)</div>
        <div className="card stack">
          <Field label="Ime ili firma" value={s.sender.name} onChange={(e) => setSender({ name: e.target.value })} />
          <Field label="Adresa" value={s.sender.address} onChange={(e) => setSender({ address: e.target.value })} />
          <div className="grid-zip">
            <Field label="Grad" value={s.sender.city} onChange={(e) => setSender({ city: e.target.value })} />
            <Field label="Poštanski br." inputMode="numeric" value={s.sender.zip} onChange={(e) => setSender({ zip: e.target.value })} />
          </div>
          <Field label="Telefon" type="tel" inputMode="tel" value={s.sender.phone} onChange={(e) => setSender({ phone: e.target.value })} />
          <Field label="PIB" inputMode="numeric" placeholder="nije obavezno" value={s.sender.pib} onChange={(e) => setSender({ pib: e.target.value })} />
          <Field
            label="Račun za uplatu otkupnine"
            inputMode="numeric"
            placeholder="npr. 160-0000000000000-00"
            value={s.sender.account ?? ''}
            onChange={(e) => setSender({ account: e.target.value })}
            hint="Na koji tekući račun kurir uplaćuje otkupninu. Štampa se na nalepnici i spisku za kurira."
          />
        </div>
      </div>

      <div className="section">
        <div className="section-title">Kurirske službe</div>
        <div className="card">
          {s.couriers.map((c) => (
            <div className="variant-row" key={c.id}>
              <div className="head">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <input type="radio" name="defc" style={{ width: 22, height: 22 }} checked={s.defaultCourierId === c.id} onChange={() => set({ defaultCourierId: c.id, couriers: s.couriers.map((x) => (x.id === c.id ? { ...x, active: true } : x)) })} />
                  <span className={s.defaultCourierId === c.id ? '' : 'muted'}>Podrazumevani</span>
                </label>
                <label className="switch" style={{ minHeight: 0 }}>
                  <span className="small muted">Koristim</span>
                  <input type="checkbox" checked={c.active} onChange={(e) => setCourier(c.id, { active: e.target.checked })} />
                </label>
              </div>
              <Field label="Naziv" value={c.name} onChange={(e) => setCourier(c.id, { name: e.target.value })} />
              <NumberField label="Cena dostave" hint="Trošak kad poštarinu plaćaš ti" suffix="din" value={c.price} onChange={(n) => setCourier(c.id, { price: n ?? 0 })} />
            </div>
          ))}
          <button
            type="button"
            className="btn block mt"
            onClick={() => set({ couriers: [...s.couriers, { id: crypto.randomUUID(), name: '', price: s.couriers[0]?.price ?? 0, active: true }] })}
          >
            <Icon name="plus" /> Dodaj kurira
          </button>
          <div className="field mt">
            <span>Troškove dostave podrazumevano snosi</span>
            <Segmented
              value={s.defaultShippingPayer ?? 'primalac'}
              onChange={(defaultShippingPayer) => set({ defaultShippingPayer })}
              options={[
                { id: 'primalac', label: 'Primalac' },
                { id: 'posiljalac', label: 'Pošiljalac' },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Zaliha i upozorenja</div>
        <div className="card stack">
          <Switch
            checked={s.deductStock}
            onChange={(deductStock) => set({ deductStock })}
            label="Skidaj sa zalihe pri porudžbini"
            hint="Kad sačuvaš porudžbinu, komadi se oduzmu od zalihe. Brisanje ih vraća."
          />
          <NumberField
            label="Upozori kad zaliha padne ispod"
            suffix="kom"
            placeholder="isključeno"
            value={s.lowStockThreshold}
            onChange={(lowStockThreshold) => set({ lowStockThreshold })}
            hint="Važi za sve proizvode, osim ako proizvod nema svoj broj. Prazno = bez upozorenja."
          />
          <NumberField
            label="Upozori ako „Poslato“ nije naplaćeno posle"
            suffix="dana"
            value={s.unpaidAlertDays}
            onChange={(n) => set({ unpaidAlertDays: n ?? 10 })}
          />
          <Field label="Valuta" value={s.currency} onChange={(e) => set({ currency: e.target.value })} />
        </div>
      </div>

      <div className="section">
        <div className="section-title">Poseta sajta</div>
        <div className="card stack">
          <Field
            label="Adresa statistike posete"
            type="url"
            inputMode="url"
            placeholder="https://…"
            value={s.trafficUrl ?? ''}
            onChange={(e) => set({ trafficUrl: e.target.value })}
            hint="Link na besplatnu statistiku posete (Cloudflare Web Analytics, Umami…). Pojaviće se kao dugme u Analitici."
          />
        </div>
      </div>

      <div className="section">
        <div className="section-title">Probni podaci</div>
        <div className="card stack">
          <p className="small muted" style={{ margin: 0 }}>
            Dodaj ~75 dana izmišljenih porudžbina da vidiš kako izgledaju početna i analitika. Briše se jednim dodirom, a prave porudžbine se ne diraju.
          </p>
          <button className="btn block" disabled={busy} onClick={toggleDemo}>
            <Icon name="flask" /> {demo ? 'Obriši probne podatke' : 'Dodaj probne podatke'}
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Početak brojanja porudžbina</div>
        <div className="card stack">
          <p className="small muted" style={{ margin: 0 }}>
            Briše SVE porudžbine sa ovog uređaja (probne i prave) da brojanje krene ispočetka od #1000. Radi to jednom, pre prve prave prodaje.
            U bazi se prethodno puštaju naredbe iz fajla docs/supabase-reset-orders.sql, a zatim se isto uradi na svakom uređaju.
          </p>
          <button
            className="btn block danger"
            disabled={busy}
            onClick={async () => {
              if (
                !(await confirm({
                  title: 'Obrisati sve porudžbine na ovom uređaju?',
                  message: 'Ovo se ne može poništiti. Kupci i katalog ostaju. Nastavi samo ako su sve porudžbine probne.',
                  confirmText: 'Obriši sve',
                  danger: true,
                }))
              )
                return
              setBusy(true)
              try {
                const n = await resetOrdersLocal()
                toast(`Obrisano: ${n}. Sledeća porudžbina je #1000.`)
              } finally {
                setBusy(false)
              }
            }}
          >
            <Icon name="trash" /> Obriši porudžbine i kreni od #1000
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Rezervna kopija i izvoz</div>
        <div className="card stack">
          <p className="small muted" style={{ margin: 0 }}>
            Na ovom telefonu: {stats.orders} porudžbina, {stats.products} proizvoda. Podaci su samo na ovom uređaju — povremeno sačuvaj rezervnu kopiju (npr. na Google Drive). Tako ih i prenosiš na novi telefon.
          </p>
          <button className="btn block" onClick={() => exportJson()}>
            <Icon name="download" /> Sačuvaj rezervnu kopiju (JSON)
          </button>
          <label className="btn block" style={{ position: 'relative' }}>
            <Icon name="upload" /> Vrati iz rezervne kopije
            <input className="hidden-input" type="file" accept=".json,application/json" onChange={(e) => onRestore(e.target.files?.[0])} />
          </label>
          <div className="btn-row">
            <button className="btn small" onClick={() => exportOrdersCsv()}>
              Porudžbine CSV
            </button>
            <button className="btn small" onClick={() => exportProductsCsv()}>
              Katalog CSV
            </button>
          </div>
        </div>
      </div>

      {dirty && (
        <div className="footer-bar">
          <div className="sum">
            <small>Imaš nesačuvane izmene</small>
          </div>
          <button className="btn primary" onClick={save}>
            <Icon name="check" /> Sačuvaj
          </button>
        </div>
      )}
    </div>
  )
}
