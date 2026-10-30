import { getDb } from '../../lib/firebase.js'

/**
 * Built-in projects and events (from src/data/content.js) show on the site until the dashboard has its own.
 * Copying them in keeps them on the site once the office adds more, and makes them editable.
 * They keep their ids, and builtinKey keeps their built-in photos attached.
 */
export async function copyBuiltins(coll, builtins, existingIds = []) {
  const { fs, db } = await getDb()
  const have = new Set(existingIds)
  const missing = builtins.filter((b) => !have.has(b.id))
  const batch = fs.writeBatch(db)
  missing.forEach(({ id, ...rest }, i) => {
    batch.set(fs.doc(db, coll, id), { ...rest, builtinKey: id, status: 'published', order: i, createdAt: fs.serverTimestamp() })
  })
  if (missing.length) await batch.commit()
  return missing.length
}

/** Remove the imported photos that belong to an event or project. */
export async function deleteLinkedPhotos(id) {
  const { fs, db } = await getDb()
  const snap = await fs.getDocs(fs.query(fs.collection(db, 'gallery'), fs.where('linkId', '==', id)))
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = fs.writeBatch(db)
    snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
  return snap.docs.length
}
