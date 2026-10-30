import { unzip } from 'fflate'
import { useEffect, useMemo, useRef, useState } from 'react'
import { defaults } from '../../data/content.js'
import { getDb } from '../../lib/firebase.js'
import { resizeImage } from '../../lib/media.js'
import { bundledPhotos, forgetPhotoCache } from '../../lib/photos.js'
import { useContent } from '../../lib/useContent.js'
import { copyBuiltins } from './builtins.js'
import { IMAGE, RAW, bestMatch, groupKey, photoNumber, prettyTitle } from './photoGroups.js'
import { eventsConfig, projectsConfig } from './sections.js'

const TYPES = { events: { noun: 'event', empty: eventsConfig.empty, category: 'Events' }, projects: { noun: 'project', empty: projectsConfig.empty, category: 'Projects' } }
const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif' }
const mimeOf = (name) => MIME[name.split('.').pop().toLowerCase()] || 'image/jpeg'
const baseName = (path) => path.split(/[\\/]/).pop()

function unzipFile(file) {
  return file.arrayBuffer().then(
    (buf) =>
      new Promise((resolve, reject) =>
        unzip(new Uint8Array(buf), { filter: (f) => !/(^|\/)(__MACOSX|\.)/.test(f.name) && (IMAGE.test(f.name) || RAW.test(f.name)) }, (err, out) =>
          err ? reject(new Error(`${file.name} could not be opened as a zip.`)) : resolve(out),
        ),
      ),
  )
}

/** Turn picked files, folders and zips into [{ path, name, blob }]. */
async function collect(fileList) {
  const out = []
  for (const f of fileList) {
    if (/\.zip$/i.test(f.name)) {
      const entries = await unzipFile(f)
      const top = f.name.replace(/\.zip$/i, '')
      for (const [name, data] of Object.entries(entries)) {
        out.push({ path: `${top}/${name}`, name: baseName(name), blob: new File([data], baseName(name), { type: mimeOf(name) }) })
      }
    } else if (IMAGE.test(f.name) || RAW.test(f.name)) {
      const path = f.webkitRelativePath || f.name
      out.push({ path, name: f.name, blob: f.type ? f : new File([f], f.name, { type: mimeOf(f.name) }) })
    }
  }
  return out
}

async function fetchRemote() {
  const { fs, db } = await getDb()
  const [ev, pr] = await Promise.all(['events', 'projects'].map((c) => fs.getDocs(fs.collection(db, c))))
  const list = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return { events: list(ev), projects: list(pr) }
}

export default function PhotoImport() {
  const { refresh } = useContent()
  const [remote, setRemote] = useState(null) // { events: [], projects: [] }
  const [groups, setGroups] = useState([])
  const [raw, setRaw] = useState([])
  const [fallback, setFallback] = useState('new:projects')
  const [busy, setBusy] = useState('')
  const [progress, setProgress] = useState(null)
  const [msg, setMsg] = useState(null)
  const filesRef = useRef(null)
  const folderRef = useRef(null)
  const thumbs = useRef([])

  async function loadRemote() {
    const next = await fetchRemote()
    setRemote(next)
    return next
  }

  useEffect(() => {
    let alive = true
    fetchRemote()
      .then((next) => alive && setRemote(next))
      .catch((e) => alive && setMsg({ bad: true, text: `Could not load events and projects: ${e.message}` }))
    const urls = thumbs.current
    return () => {
      alive = false
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  // Everything a photo group can go to: the dashboard's items, plus built-in ones not copied in yet.
  const candidates = useMemo(() => {
    if (!remote) return []
    return Object.keys(TYPES).flatMap((type) => {
      const mine = remote[type].map((it) => ({ ...it, type, inDashboard: true }))
      const ids = new Set(mine.map((i) => i.id))
      const built = defaults[type].filter((b) => !ids.has(b.id)).map((b) => ({ ...b, type, inDashboard: false }))
      return [...mine, ...built]
    })
  }, [remote])

  function defaultTarget(key) {
    const m = bestMatch(key, candidates)
    if (!m) return { target: fallback, note: 'No match found' }
    const built = bundledPhotos(m.item.type, m.item).length
    if (built) return { target: 'skip', note: `Matches “${m.item.title}”, which already has ${built} built-in photos. Choose it to add these as well.`, match: `${m.item.type}:${m.item.id}` }
    return { target: `${m.item.type}:${m.item.id}`, note: m.exact ? 'Matched by photo file name' : 'Matched by name' }
  }

  async function pick(e) {
    const list = [...e.target.files]
    e.target.value = ''
    if (!list.length) return
    setBusy('Reading files…')
    setMsg(null)
    try {
      const found = await collect(list)
      const byKey = new Map()
      const rawFiles = []
      for (const f of found) {
        if (RAW.test(f.name)) rawFiles.push(f.path)
        else {
          const key = groupKey(f.path)
          if (!byKey.has(key)) byKey.set(key, [])
          byKey.get(key).push(f)
        }
      }
      const next = [...byKey.entries()].map(([key, files]) => {
        files.sort((a, b) => photoNumber(a.name) - photoNumber(b.name) || a.name.localeCompare(b.name))
        const thumb = URL.createObjectURL(files[0].blob)
        thumbs.current.push(thumb)
        return { key, files, thumb, ...defaultTarget(key) }
      })
      // Photos chosen in a second round join any group with the same name.
      setGroups((prev) => {
        const merged = new Map(prev.map((g) => [g.key, g]))
        for (const g of next) {
          const had = merged.get(g.key)
          merged.set(g.key, had ? { ...had, files: [...had.files, ...g.files.filter((f) => !had.files.some((h) => h.name === f.name))] } : g)
        }
        return [...merged.values()].sort((a, b) => a.key.localeCompare(b.key))
      })
      setRaw((r) => [...r, ...rawFiles])
      if (!found.length) setMsg({ bad: true, text: 'No photos found in what you chose.' })
    } catch (ex) {
      setMsg({ bad: true, text: ex.message })
    }
    setBusy('')
  }

  const setTarget = (key, target) => setGroups((gs) => gs.map((g) => (g.key === key ? { ...g, target } : g)))
  function applyFallback(value) {
    setFallback(value)
    setGroups((gs) => gs.map((g) => (g.note === 'No match found' ? { ...g, target: value } : g)))
  }
  function clearAll() {
    thumbs.current.forEach((u) => URL.revokeObjectURL(u))
    thumbs.current = []
    setGroups([])
    setRaw([])
    setMsg(null)
    setProgress(null)
  }

  const todo = groups.filter((g) => g.target !== 'skip')
  const photoTotal = todo.reduce((n, g) => n + g.files.length, 0)

  async function run() {
    setBusy('Importing…')
    setMsg(null)
    let added = 0
    let repeats = 0
    const failed = []
    const created = []
    try {
      const { fs, db } = await getDb()
      let current = remote || (await loadRemote())
      // Adding the first dashboard item would hide the built-in ones, so copy those in first.
      for (const type of Object.keys(TYPES)) {
        if (todo.some((g) => g.target === `new:${type}`) && current[type].length === 0) {
          await copyBuiltins(type, defaults[type])
          current = await loadRemote()
        }
      }
      setProgress({ done: 0, total: photoTotal })
      let done = 0
      for (const g of todo) {
        let type = null
        let id = ''
        let title = prettyTitle(g.key)
        let item = null
        if (g.target.startsWith('new:')) {
          type = g.target.slice(4)
          const ref = await fs.addDoc(fs.collection(db, type), { ...TYPES[type].empty, title, photoKey: g.key, status: 'published', createdAt: fs.serverTimestamp() })
          id = ref.id
          item = { id, inDashboard: true }
          created.push(`${title} (new ${TYPES[type].noun})`)
        } else if (g.target !== 'gallery') {
          ;[type, id] = [g.target.slice(0, g.target.indexOf(':')), g.target.slice(g.target.indexOf(':') + 1)]
          item = candidates.find((c) => c.type === type && c.id === id)
          title = item?.title || title
        }

        // Skip photos already imported for this item (same file name), so running an import twice is safe.
        const already = new Set()
        if (id) {
          const snap = await fs.getDocs(fs.query(fs.collection(db, 'gallery'), fs.where('linkId', '==', id)))
          snap.docs.forEach((d) => d.data().fileName && already.add(d.data().fileName))
        }
        let order = already.size
        let first = null
        for (const f of g.files) {
          if (already.has(f.name)) {
            repeats++
          } else {
            try {
              let src = await resizeImage(f.blob, 1400, 0.72)
              if (src.length > 900000) src = await resizeImage(f.blob, 1000, 0.62)
              await fs.addDoc(fs.collection(db, 'gallery'), {
                type: 'photo', title, category: type ? TYPES[type].category : 'Constituency', src,
                linkType: type || '', linkId: id, fileName: f.name, order: order++, status: 'published', createdAt: fs.serverTimestamp(),
              })
              added++
              first ||= f
            } catch {
              failed.push(f.name)
            }
          }
          done++
          setProgress({ done, total: photoTotal, label: title })
        }

        // Give the item a card picture if it has none yet.
        const hasPicture = item && (item.cover || bundledPhotos(type, item).length || item.photos?.length)
        if (type && first && item?.inDashboard && !hasPicture) {
          await fs.updateDoc(fs.doc(db, type, id), { cover: await resizeImage(first.blob, 640, 0.7) })
        }
      }
      forgetPhotoCache()
      refresh()
      await loadRemote()
      const parts = [`Imported ${added} photo${added === 1 ? '' : 's'}.`]
      if (created.length) parts.push(`Created: ${created.join(', ')}. Open Events or Projects to fill in their details.`)
      if (repeats) parts.push(`${repeats} were already imported and were skipped.`)
      if (failed.length) parts.push(`${failed.length} could not be read: ${failed.slice(0, 5).join(', ')}${failed.length > 5 ? '…' : ''}.`)
      setMsg({ bad: failed.length > 0 && added === 0, text: parts.join(' ') })
      setGroups([])
    } catch (ex) {
      setMsg({ bad: true, text: `Stopped after ${added} photos: ${ex.message}` })
    }
    setBusy('')
  }

  const options = (type) => candidates.filter((c) => c.type === type)

  return (
    <>
      <div className="adm-top">
        <div>
          <h1>Photo import</h1>
          <p>Add many photos at once. They are sorted to events and projects by file name: “KMTC (1).jpg” and “KMTC (2).jpg” go together.</p>
        </div>
      </div>

      {msg && <p className={msg.bad ? 'adm-alert' : 'adm-ok'} role="status">{msg.text}</p>}

      <div className="adm-panel">
        <div className="adm-actions">
          <button type="button" className="adm-btn" onClick={() => filesRef.current?.click()} disabled={!!busy || !remote}>Choose photos or zip files</button>
          <button type="button" className="adm-btn ghost" onClick={() => folderRef.current?.click()} disabled={!!busy || !remote}>Choose a folder</button>
          <input ref={filesRef} type="file" multiple accept="image/*,.zip,application/zip" hidden onChange={pick} />
          <input ref={folderRef} type="file" multiple hidden onChange={pick} webkitdirectory="" directory="" />
          {groups.length > 0 && <button type="button" className="adm-link" onClick={clearAll} disabled={!!busy}>Start again</button>}
        </div>
        <small className="adm-help">
          Name photos after the event or project, numbered: “Kibiru pri school (1).jpg”. Photos named by the camera (IMG_0042.jpg) are grouped by their folder instead.
          Photos are resized automatically. Camera RAW and iPhone HEIC files cannot be read in the browser; save them as JPG first.
        </small>
        {busy && <p className="adm-pad" style={{ padding: '12px 0 0' }}>{busy}</p>}
      </div>

      {raw.length > 0 && (
        <p className="adm-alert">
          {raw.length} RAW or HEIC file{raw.length === 1 ? ' was' : 's were'} skipped ({[...new Set(raw.map(groupKey))].join(', ')}). Export them as JPG and import those.
        </p>
      )}

      {groups.length > 0 && (
        <div className="adm-panel flush">
          <div className="adm-import-head">
            <b>{groups.length} groups, {groups.reduce((n, g) => n + g.files.length, 0)} photos</b>
            <label>
              Groups with no match become
              <select value={fallback} onChange={(e) => applyFallback(e.target.value)}>
                <option value="new:projects">a new project</option>
                <option value="new:events">a new event</option>
                <option value="gallery">Gallery photos only</option>
                <option value="skip">skipped</option>
              </select>
            </label>
          </div>
          <div className="adm-scroll">
            <table className="adm-table adm-import">
              <thead><tr><th /><th>Photos named</th><th>Goes to</th></tr></thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g.key} className={g.target === 'skip' ? 'is-skip' : ''}>
                    <td><img src={g.thumb} alt="" /></td>
                    <td><b>{g.key}</b><br /><small>{g.files.length} photo{g.files.length === 1 ? '' : 's'}</small></td>
                    <td>
                      <select value={g.target} onChange={(e) => setTarget(g.key, e.target.value)} aria-label={`Where the ${g.key} photos go`}>
                        <optgroup label="Actions">
                          <option value="skip">Skip these photos</option>
                          <option value="new:projects">New project: {prettyTitle(g.key)}</option>
                          <option value="new:events">New event: {prettyTitle(g.key)}</option>
                          <option value="gallery">Gallery only</option>
                        </optgroup>
                        <optgroup label="Events">{options('events').map((c) => <option key={c.id} value={`events:${c.id}`}>{c.title}</option>)}</optgroup>
                        <optgroup label="Projects">{options('projects').map((c) => <option key={c.id} value={`projects:${c.id}`}>{c.title}</option>)}</optgroup>
                      </select>
                      {g.note && <small className="adm-note">{g.note}</small>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="adm-import-foot">
            {progress && busy ? (
              <div className="adm-progress" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done}>
                <span style={{ width: `${(100 * progress.done) / Math.max(1, progress.total)}%` }} />
                <small>{progress.done} of {progress.total}{progress.label ? ` · ${progress.label}` : ''}</small>
              </div>
            ) : (
              <button type="button" className="adm-btn" onClick={run} disabled={!!busy || photoTotal === 0}>
                Import {photoTotal} photo{photoTotal === 1 ? '' : 's'}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
