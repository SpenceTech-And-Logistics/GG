import { useCallback, useEffect, useState } from 'react'
import { getDb } from '../../lib/firebase.js'

export default function Messages({ onCount }) {
  const [items, setItems] = useState(null)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    const { fs, db } = await getDb()
    const snap = await fs.getDocs(fs.collection(db, 'messages'))
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    onCount(list.filter((m) => !m.read).length)
    return list
  }, [onCount])

  useEffect(() => {
    let alive = true
    load()
      .then((l) => alive && setItems(l))
      .catch((e) => alive && (setItems([]), setErr(e.message)))
    return () => {
      alive = false
    }
  }, [load])

  async function mark(m, read) {
    const { fs, db } = await getDb()
    await fs.updateDoc(fs.doc(db, 'messages', m.id), { read })
    setItems(await load())
  }
  async function del(m) {
    const { fs, db } = await getDb()
    await fs.deleteDoc(fs.doc(db, 'messages', m.id))
    setItems(await load())
  }

  return (
    <>
      <div className="adm-top"><div><h1>Messages</h1><p>Sent from the contact form on the website.</p></div></div>
      {err && <p className="adm-alert">{err}</p>}
      {items === null ? <p>Loading…</p> : items.length === 0 ? (
        <div className="adm-panel"><p>No messages yet.</p></div>
      ) : (
        <div className="adm-stack">
          {items.map((m) => (
            <article key={m.id} className={`adm-panel msg ${m.read ? '' : 'unread'}`}>
              <header>
                <strong>{m.name}</strong>
                <span>{m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString('en-GB') : ''}</span>
              </header>
              <p className="adm-meta">{[m.topic, m.email, m.phone].filter(Boolean).join(' · ')}</p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{m.message}</p>
              <div className="adm-actions">
                <button type="button" className="adm-link" onClick={() => mark(m, !m.read)}>{m.read ? 'Mark as unread' : 'Mark as read'}</button>
                <button type="button" className="adm-link danger" onClick={() => del(m)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
