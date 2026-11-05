import { useCallback, useEffect, useRef, useState } from 'react'
import { getDb } from '../../lib/firebase.js'
import { csvTemplate, readRecords, saveText } from '../../lib/importer.js'
import { bundledPhotos, forgetPhotoCache } from '../../lib/photos.js'
import { copyBuiltins, deleteLinkedPhotos, loadRemoved, saveRemoved } from './builtins.js'
import { findDuplicates, matchesFor, suggestKeep } from './duplicates.js'
import { useContent } from '../../lib/useContent.js'
import { Field } from './Fields.jsx'

/**
 * A list of records (projects, news, gallery) with add, edit, delete and optional import from CSV or JSON.
 * Props: coll, title, blurb, noun, fields, columns, empty, importer?: { columns, example, map },
 *   builtins? (built-in items that can be copied in), linked? (delete the item's imported photos with it)
 */
export default function CollectionEditor({ coll, title, blurb, noun, fields, columns, empty, importer, builtins, linked }) {
  const { refresh } = useContent()
  const [items, setItems] = useState(null)
  const [editing, setEditing] = useState(null) // null | 'new' | id
  const [form, setForm] = useState(empty)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [dupOpen, setDupOpen] = useState(false)
  const [keepIds, setKeepIds] = useState({}) // group index -> id to keep
  const [dupWarn, setDupWarn] = useState(null) // matches found while saving
  const [ignored, setIgnored] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(`gg-not-duplicates-${coll}`) || '[]'))
    } catch {
      return new Set()
    }
  })
  const [confirm, setConfirm] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [removed, setRemoved] = useState([]) // built-in items deleted from the site
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    const { fs, db } = await getDb()
    const snap = await fs.getDocs(fs.collection(db, coll))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [coll])

  useEffect(() => {
    if (!builtins) return undefined
    let alive = true
    loadRemoved(coll).then((ids) => alive && setRemoved(ids)).catch(() => {})
    return () => {
      alive = false
    }
  }, [coll, builtins])

  useEffect(() => {
    let alive = true
    load()
      .then((list) => alive && setItems(list))
      .catch((e) => {
        if (!alive) return
        setItems([])
        setMsg({ bad: true, text: /permission|insufficient/i.test(e.message) ? 'Firebase is blocking this list. In the Firebase console open Firestore Database → Rules, paste the contents of firestore.rules from the project and click Publish.' : `Could not load: ${e.message}` })
      })
    return () => {
      alive = false
    }
  }, [load])

  const reload = async () => {
    setItems(await load())
    if (builtins) setRemoved(await loadRemoved(coll))
    forgetPhotoCache()
    refresh()
  }

  // Possible duplicates: the same title, or titles that are nearly the same (positions compare title and organisation).
  const keyOf = importer?.key || ((x) => x.title)
  const dupGroups = items ? findDuplicates(items, keyOf, ignored) : []
  const flagged = new Set(dupGroups.flatMap((g) => g.items.map((it) => it.id)))
  // Built-in items (from the site's code) that are not in the dashboard: they show on the site, so they are listed too.
  const sameTitle = (a, b) => String(a || '').replace(/\s+/g, ' ').trim().toLowerCase() === String(b || '').replace(/\s+/g, ' ').trim().toLowerCase()
  const uncopied = builtins && items
    ? builtins
        .filter((b) => !removed.includes(b.id) && !items.some((i) => i.id === b.id || i.builtinKey === b.id || sameTitle(i.title, b.title)))
        .map((b) => ({ ...b, builtinKey: b.id, status: 'published', builtinOnly: true }))
    : []
  const rows = items ? [...items, ...uncopied] : []
  const removedHere = builtins ? builtins.filter((b) => removed.includes(b.id)) : []
  // Filter the list by category (projects, events, news…) when the records have one.
  const catField = fields.find((f) => f.key === 'category')
  const catCounts = {}
  for (const it of rows) {
    const c = String(it.category || '').trim() || 'No category'
    catCounts[c] = (catCounts[c] || 0) + 1
  }
  const catNames = Object.keys(catCounts).sort((a, b) => a.localeCompare(b))
  const showCats = Boolean(catField) && catNames.length > 1
  const activeCat = showCats && catCounts[catFilter] ? catFilter : 'All'
  const listed = activeCat === 'All' ? rows : rows.filter((it) => (String(it.category || '').trim() || 'No category') === activeCat)
  const extraCount = dupGroups.reduce((n, g) => n + g.items.length - 1, 0)

  /** What tells copies apart in the review: dates, place, photos, when added. */
  const describe = (it) => {
    const photos = bundledPhotos(coll, it).length + (it.photos || []).length
    const added = it.createdAt?.seconds ? new Date(it.createdAt.seconds * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
    return [
      it.year || it.date || it.period,
      it.ward || it.venue || it.organisation || it.outlet,
      it.category,
      it.progress,
      `${photos} photo${photos === 1 ? '' : 's'}`,
      it.builtinKey ? 'built-in copy' : '',
      added && `added ${added}`,
      it.status === 'draft' ? 'draft' : '',
    ].filter(Boolean).join(' · ')
  }

  /** Remove the other copies in one group, moving any imported photos to the copy that stays. */
  async function resolveGroup(group, keepId) {
    setBusy(true)
    setMsg(null)
    try {
      const { fs, db } = await getDb()
      const keep = group.items.find((it) => it.id === keepId) || suggestKeep(group.items)
      const extra = group.items.filter((it) => it.id !== keep.id)
      for (const it of extra) {
        if (linked) {
          const snap = await fs.getDocs(fs.query(fs.collection(db, 'gallery'), fs.where('linkId', '==', it.id)))
          for (const d of snap.docs) await fs.updateDoc(d.ref, { linkId: keep.id })
        }
        await fs.deleteDoc(fs.doc(db, coll, it.id))
      }
      setKeepIds({})
      await reload()
      setMsg({ text: `Kept “${keep.title}” and removed ${extra.length} other cop${extra.length === 1 ? 'y' : 'ies'}${linked ? '. Their photos moved to the copy that stays' : ''}.` })
    } catch (ex) {
      setMsg({ bad: true, text: ex.message })
    }
    setBusy(false)
  }

  /** Mark a group as different items so it is not flagged again (remembered on this computer). */
  function notDuplicates(group) {
    const next = new Set(ignored)
    for (const a of group.items) for (const b of group.items) if (a.id < b.id) next.add(`${a.id}|${b.id}`)
    setIgnored(next)
    setKeepIds({})
    try {
      localStorage.setItem(`gg-not-duplicates-${coll}`, JSON.stringify([...next]))
    } catch {
      /* not remembered after reload; fine */
    }
  }

  function checkDuplicates() {
    setDupOpen(true)
    if (!dupGroups.length) setMsg({ text: `Checked ${items?.length || 0} ${title.toLowerCase()}: no duplicates found.` })
  }

  const missing = uncopied

  async function restoreRemoved() {
    setBusy(true)
    try {
      await saveRemoved(coll, [])
      await reload()
      setMsg({ text: `Restored ${removedHere.length} built-in ${removedHere.length === 1 ? noun.toLowerCase() : title.toLowerCase()} to the site.` })
    } catch (ex) {
      setMsg({ bad: true, text: ex.message })
    }
    setBusy(false)
  }

  async function copyIn() {
    setBusy(true)
    setMsg(null)
    try {
      const n = await copyBuiltins(coll, builtins.filter((b) => uncopied.some((u) => u.id === b.id)))
      await reload()
      setMsg({ text: `Copied ${n} built-in ${title.toLowerCase()} into the dashboard. Their photos stay attached.` })
    } catch (ex) {
      setMsg({ bad: true, text: ex.message })
    }
    setBusy(false)
  }

  function startNew() {
    // Adding while a category is picked starts the new record in that category.
    setForm(activeCat !== 'All' && activeCat !== 'No category' ? { ...empty, category: activeCat } : empty)
    setEditing('new')
    setDupWarn(null)
    setMsg(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function startEdit(item) {
    const { id, ...rest } = item
    void id
    setForm({ ...empty, ...rest })
    setEditing(item.id)
    setDupWarn(null)
    setMsg(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save(e, anyway = false) {
    e?.preventDefault()
    const matches = matchesFor(keyOf(form), items, editing === 'new' ? null : editing, keyOf, form)
    if (matches.length && !anyway) {
      setDupWarn(matches)
      return
    }
    setDupWarn(null)
    setBusy(true)
    setMsg(null)
    try {
      const { fs, db } = await getDb()
      const { createdAt, ...raw } = form
      // Typed-in choices (e.g. a category) reuse the existing spelling when they match one, ignoring case and spacing.
      const data = { ...raw }
      for (const f of fields.filter((x) => x.type === 'combo')) {
        const typed = String(data[f.key] || '').replace(/\s+/g, ' ').trim()
        const known = [...(f.options || []), ...(items || []).map((it) => it[f.key])].find((o) => String(o || '').toLowerCase() === typed.toLowerCase())
        data[f.key] = known || (typed ? typed[0].toUpperCase() + typed.slice(1) : typed)
      }
      if (JSON.stringify(data).length > 950000) throw new Error('Too large to save. Remove a photo or two, or use smaller photos.')
      if (editing === 'new') {
        await fs.addDoc(fs.collection(db, coll), { ...data, createdAt: fs.serverTimestamp() })
      }
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
      const row = rows.find((r) => r.id === id) || {}
      const key = row.builtinKey || (builtins?.some((b) => b.id === id) ? id : '')
      // A built-in item would come back from the site's code, so it is also recorded as deleted.
      if (key) await saveRemoved(coll, [...removed, key])
      if (!row.builtinOnly) await fs.deleteDoc(fs.doc(db, coll, id))
      if (linked) await deleteLinkedPhotos(id)
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
      const keyOf = importer.key || ((d) => d.title)
      const norm = (d) => String(keyOf(d) || '').trim().toLowerCase()
      // Built-in items are listed too, so they count as already there.
      const seen = new Set(rows.map(norm))
      const fresh = []
      let skipped = 0
      for (const r of records) {
        const doc = importer.map(r)
        const key = norm(doc)
        if (!String(doc.title || '').trim() || seen.has(key)) {
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
      setMsg({ text: `Imported ${fresh.length}. Skipped ${skipped} (empty or already listed).` })
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
          {items?.length > 1 && (
            <button type="button" className="adm-btn ghost" onClick={checkDuplicates} disabled={busy}>Check for duplicates</button>
          )}
          <button type="button" className="adm-btn" onClick={startNew}>Add {noun.toLowerCase()}</button>
        </div>
      </div>

      {msg && <p className={msg.bad ? 'adm-alert' : 'adm-ok'} role="status">{msg.text}</p>}

      {extraCount > 0 && !dupOpen && (
        <div className="adm-banner">
          <p>
            <b>{dupGroups.length} possible duplicate{dupGroups.length === 1 ? '' : 's'}</b>: {dupGroups.map((g) => `${g.items[0].title} (×${g.items.length})`).join(', ')}.
            Check them side by side and choose which copy to keep.
          </p>
          <button type="button" className="adm-btn" onClick={() => setDupOpen(true)}>Review duplicates</button>
        </div>
      )}

      {dupOpen && (
        <div className="adm-panel adm-dups">
          <div className="adm-dups-head">
            <h2>Duplicate check</h2>
            <button type="button" className="adm-link" onClick={() => setDupOpen(false)}>Close</button>
          </div>
          {dupGroups.length === 0 ? (
            <p className="adm-ok">No duplicates: every {noun.toLowerCase()} has its own title.</p>
          ) : (
            <>
              <p className="adm-help" style={{ marginTop: 0 }}>
                Each box is one group that may be the same {noun.toLowerCase()}. Choose the copy to keep (the suggested one is ticked), then remove the others
                {linked ? '. Photos from the removed copies move to the one you keep' : ''}. If they are different, choose “These are different”.
              </p>
              {dupGroups.map((g, gi) => {
                const keepId = keepIds[gi] || suggestKeep(g.items).id
                return (
                  <fieldset className="adm-dup" key={g.items.map((it) => it.id).join('-')}>
                    <legend>{g.exact ? 'Same title' : 'Similar titles'} · {g.items.length} copies</legend>
                    {g.items.map((it) => (
                      <label key={it.id} className={`adm-dup-row ${keepId === it.id ? 'is-keep' : ''}`}>
                        <input type="radio" name={`keep-${gi}`} checked={keepId === it.id} onChange={() => setKeepIds({ ...keepIds, [gi]: it.id })} />
                        <span>
                          <b>{it.title}</b>
                          <small>{describe(it)}</small>
                        </span>
                        <button type="button" className="adm-link" onClick={(e) => { e.preventDefault(); startEdit(it) }}>Open</button>
                      </label>
                    ))}
                    <div className="adm-actions">
                      <button type="button" className="adm-btn" onClick={() => resolveGroup(g, keepId)} disabled={busy}>
                        Keep the ticked one, remove {g.items.length - 1}
                      </button>
                      <button type="button" className="adm-btn ghost" onClick={() => notDuplicates(g)} disabled={busy}>These are different</button>
                    </div>
                  </fieldset>
                )
              })}
            </>
          )}
        </div>
      )}

      {missing.length > 0 && (
        <div className="adm-banner">
          <p>
            <b>{missing.length} built-in {missing.length === 1 ? noun.toLowerCase() : title.toLowerCase()}</b> (marked <i>Built-in</i> in the list) {missing.length === 1 ? 'comes' : 'come'} with the website.
            Edit or delete them like any other: editing saves a copy into the dashboard, and deleting takes them off the site.
          </p>
          <button type="button" className="adm-btn ghost" onClick={copyIn} disabled={busy}>Copy them all in</button>
        </div>
      )}

      {removedHere.length > 0 && (
        <div className="adm-banner">
          <p>
            <b>{removedHere.length} built-in {removedHere.length === 1 ? noun.toLowerCase() : title.toLowerCase()} deleted</b> from the site: {removedHere.slice(0, 4).map((b) => `“${b.title}”`).join(', ')}{removedHere.length > 4 ? ` and ${removedHere.length - 4} more` : ''}.
          </p>
          <button type="button" className="adm-btn ghost" onClick={restoreRemoved} disabled={busy}>Restore {removedHere.length === 1 ? 'it' : 'them'}</button>
        </div>
      )}

      {editing && (
        <form className="adm-panel" onSubmit={save}>
          <h2>{editing === 'new' ? `New ${noun.toLowerCase()}` : `Edit ${noun.toLowerCase()}`}</h2>
          <div className="adm-grid">
            {fields.filter(visible).map((f) => (
              <Field
                key={f.key}
                def={f}
                value={form[f.key]}
                onChange={(v) => setForm({ ...form, [f.key]: v })}
                suggestions={f.type === 'combo' ? (items || []).map((it) => it[f.key]) : undefined}
              />
            ))}
          </div>
          {dupWarn && (
            <div className="adm-alert" role="alert">
              <p style={{ margin: '0 0 8px' }}>
                This looks like {dupWarn.length === 1 ? 'a' : ''} {noun.toLowerCase()}{dupWarn.length === 1 ? '' : 's'} already in the list: {dupWarn.map((m) => `“${m.title}”`).join(', ')}.
                Edit that one instead, or save anyway if this is a different {noun.toLowerCase()}.
              </p>
              <div className="adm-actions">
                <button type="button" className="adm-btn" onClick={() => save(null, true)} disabled={busy}>Save anyway</button>
                <button type="button" className="adm-btn ghost" onClick={() => startEdit(dupWarn[0])}>Edit the existing one</button>
              </div>
            </div>
          )}
          <div className="adm-actions">
            <button className="adm-btn" disabled={busy}>{busy ? 'Saving…' : `Save ${noun.toLowerCase()}`}</button>
            <button type="button" className="adm-btn ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="adm-panel flush">
        {items === null ? (
          <p className="adm-pad">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="adm-pad">Nothing here yet. Use “Add {noun.toLowerCase()}”{importer ? ' or “Import from file”' : ''}{builtins ? ', or copy the built-in ones in above' : ''}. Until you add one, the public site shows its built-in content.</p>
        ) : (
          <>
          {showCats && (
            <div className="adm-cats" role="group" aria-label={`Show ${title.toLowerCase()} by category`}>
              <label htmlFor={`cat-${coll}`}>Category</label>
              <select id={`cat-${coll}`} value={activeCat} onChange={(e) => setCatFilter(e.target.value)}>
                <option value="All">All ({rows.length})</option>
                {catNames.map((c) => <option key={c} value={c}>{c} ({catCounts[c]})</option>)}
              </select>
              <div className="adm-chipset">
                {['All', ...catNames].map((c) => (
                  <button key={c} type="button" className="adm-chip" aria-pressed={activeCat === c} onClick={() => setCatFilter(c)}>
                    {c} <span>{c === 'All' ? rows.length : catCounts[c]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="adm-scroll">
            <table className="adm-table">
              <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}<th /></tr></thead>
              <tbody>
                {listed.map((it) => (
                  <tr key={it.id} className={flagged.has(it.id) ? 'is-dup' : ''}>
                    {columns.map((c, ci) => (
                      <td key={c.key}>
                        {c.render ? c.render(it) : it[c.key]}
                        {ci === 0 && it.builtinOnly && <span className="adm-tag" title="Comes with the website. Editing saves a copy into the dashboard.">Built-in</span>}
                        {ci === 0 && flagged.has(it.id) && (
                          <button type="button" className="adm-dup-badge" onClick={() => setDupOpen(true)} title="Open the duplicate check">Possible duplicate</button>
                        )}
                      </td>
                    ))}
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
          </>
        )}
      </div>
    </>
  )
}
