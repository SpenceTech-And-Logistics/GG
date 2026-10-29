import { useCallback, useEffect, useRef, useState } from 'react'
import { getDb } from '../../lib/firebase.js'
import { csvTemplate, readRecords, saveText } from '../../lib/importer.js'
import { useContent } from '../../lib/useContent.js'
import { Field } from './Fields.jsx'

/**
 * A list of records (projects, news, gallery) with add, edit, delete and optional import from CSV or JSON.
 * Props: coll, title, blurb, noun, fields, columns, empty, importer?: { columns, example, map }
 */
export default function CollectionEditor({ coll, title, blurb, noun, fields, columns, empty, importer }) {
  const { refresh } = useContent()
  const [items, setItems] = useState(null)
  const [editing, setEditing] = useState(null) // null | 'new' | id
  const [form, setForm] = useState(empty)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState('')
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    const { fs, db } = await getDb()
    const snap = await fs.getDocs(fs.collection(db, coll))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [coll])

  useEffect(() => {
    let alive = true
    load()
      .then((list) => alive && setItems(list))
      .catch((e) => alive && (setItems([]), setMsg({ bad: true, text: `Could not load: ${e.message}` })))
    return () => {
      alive = false
    }
  }, [load])

  const reload = async () => {
    setItems(await load())
    refresh()
  }

  function startNew() {
    setForm(empty)
    setEditing('new')
    setMsg(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function startEdit(item) {
    const { id, ...rest } = item
    void id
    setForm({ ...empty, ...rest })
    setEditing(item.id)
    setMsg(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      const { fs, db } = await getDb()
      const { createdAt, ...data } = form
      if (JSON.stringify(data).length > 950000) throw new Error('Too large to save. Remove a photo or two, or use smaller photos.')
      if (editing === 'new') await fs.addDoc(fs.collection(db, coll), { ...data, createdAt: fs.serverTimestamp() })
      else await fs.setDoc(fs.doc(db, coll, editing), { ...data, ...(createdAt ? { createdAt } : {}) })
      await reload()
      setEditing(null)
      setMsg({ text: `${noun} saved. It is live on the site${data.status === 'draft' ? ' once you set it to Published' : ''}.` })
    } catch (ex) {
      setMsg({ bad: true, text: ex.message })
    }
    setBusy(false)
  }

  async function remove(id) {
    try {
      const { fs, db } = await getDb()
      await fs.deleteDoc(fs.doc(db, coll, id))
      setConfirm('')
      await reload()
    } catch (ex) {
      setMsg({ bad: true, text: ex.message })
    }
  }

  async function doImport(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setMsg(null)
    try {
      const records = await readRecords(file)
      const seen = new Set((items || []).map((i) => String(i.title || '').trim().toLowerCase()))
      const fresh = []
      let skipped = 0
      for (const r of records) {
        const doc = importer.map(r)
        const key = String(doc.title || '').trim().toLowerCase()
        if (!key || seen.has(key)) {
          skipped++
          continue
        }
        seen.add(key)
        fresh.push(doc)
      }
      const { fs, db } = await getDb()
      for (let i = 0; i < fresh.length; i += 400) {
        const batch = fs.writeBatch(db)
        fresh.slice(i, i + 400).forEach((d) => batch.set(fs.doc(fs.collection(db, coll)), { ...d, createdAt: fs.serverTimestamp() }))
        await batch.commit()
      }
      await reload()
      setMsg({ text: `Imported ${fresh.length}. Skipped ${skipped} (empty or already listed by title).` })
    } catch (ex) {
      setMsg({ bad: true, text: ex.message })
    }
    setBusy(false)
  }

  const visible = (f) => !f.showIf || f.showIf(form)

  return (
    <>
      <div className="adm-top">
        <div><h1>{title}</h1><p>{blurb}</p></div>
        <div className="adm-actions">
          {importer && (
            <>
              <button type="button" className="adm-btn ghost" onClick={() => saveText(`${coll}-template.csv`, csvTemplate(importer.columns, importer.example))}>CSV template</button>
              <button type="button" className="adm-btn ghost" onClick={() => fileRef.current?.click()} disabled={busy}>Import from file</button>
              <input ref={fileRef} type="file" accept=".csv,.json,text/csv,application/json" hidden onChange={doImport} />
            </>
          )}
          <button type="button" className="adm-btn" onClick={startNew}>Add {noun.toLowerCase()}</button>
        </div>
      </div>

      {msg && <p className={msg.bad ? 'adm-alert' : 'adm-ok'} role="status">{msg.text}</p>}

      {editing && (
        <form className="adm-panel" onSubmit={save}>
          <h2>{editing === 'new' ? `New ${noun.toLowerCase()}` : `Edit ${noun.toLowerCase()}`}</h2>
          <div className="adm-grid">
            {fields.filter(visible).map((f) => <Field key={f.key} def={f} value={form[f.key]} onChange={(v) => setForm({ ...form, [f.key]: v })} />)}
          </div>
          <div className="adm-actions">
            <button className="adm-btn" disabled={busy}>{busy ? 'Saving…' : `Save ${noun.toLowerCase()}`}</button>
            <button type="button" className="adm-btn ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="adm-panel flush">
        {items === null ? (
          <p className="adm-pad">Loading…</p>
        ) : items.length === 0 ? (
          <p className="adm-pad">Nothing here yet. Use “Add {noun.toLowerCase()}”{importer ? ' or “Import from file”' : ''}. Until you add one, the public site shows its built-in content.</p>
        ) : (
          <div className="adm-scroll">
            <table className="adm-table">
              <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}<th /></tr></thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    {columns.map((c) => <td key={c.key}>{c.render ? c.render(it) : it[c.key]}</td>)}
                    <td className="r">
                      {confirm === it.id ? (
                        <>
                          <button type="button" className="adm-link danger" onClick={() => remove(it.id)}>Delete for good</button>{' '}
                          <button type="button" className="adm-link" onClick={() => setConfirm('')}>Keep</button>
                        </>
                      ) : (
                        <>
                          <button type="button" className="adm-link" onClick={() => startEdit(it)}>Edit</button>{' '}
                          <button type="button" className="adm-link danger" onClick={() => setConfirm(it.id)}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
