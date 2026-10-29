import { useEffect, useState } from 'react'
import { getDb } from '../../lib/firebase.js'
import { useContent } from '../../lib/useContent.js'
import { Field } from './Fields.jsx'

/** Edits one document in the "site" collection (profile, parliament record or contact details). */
export default function DocEditor({ docId, title, blurb, fields, defaults }) {
  const { refresh } = useContent()
  const [form, setForm] = useState(null)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const { fs, db } = await getDb()
      let saved = {}
      try {
        const snap = await fs.getDoc(fs.doc(db, 'site', docId))
        if (snap.exists()) saved = snap.data()
      } catch (e) {
        if (alive) setMsg({ bad: true, text: `Could not load: ${e.message}` })
      }
      if (alive) setForm({ ...defaults, ...saved })
    })()
    return () => {
      alive = false
    }
  }, [docId, defaults])

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      const { fs, db } = await getDb()
      if (JSON.stringify(form).length > 950000) throw new Error('This is too large to save. Use a smaller portrait photo.')
      await fs.setDoc(fs.doc(db, 'site', docId), form)
      refresh()
      setMsg({ text: 'Saved. The public site now shows these changes.' })
    } catch (ex) {
      setMsg({ bad: true, text: ex.message })
    }
    setBusy(false)
  }

  return (
    <>
      <div className="adm-top"><div><h1>{title}</h1><p>{blurb}</p></div></div>
      {!form ? (
        <p>Loading…</p>
      ) : (
        <form className="adm-panel" onSubmit={save}>
          <div className="adm-grid">
            {fields.map((f) => <Field key={f.key} def={f} value={form[f.key]} onChange={(v) => setForm({ ...form, [f.key]: v })} />)}
          </div>
          {msg && <p className={msg.bad ? 'adm-alert' : 'adm-ok'} role="status">{msg.text}</p>}
          <div><button className="adm-btn" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button></div>
        </form>
      )}
    </>
  )
}
