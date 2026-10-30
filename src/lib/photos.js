import { useEffect, useState } from 'react'
import { getDb } from './firebase.js'

/*
 * Where an event's or project's photos come from, in display order:
 *   1. built-in photos shipped with the site: src/assets/<projects|events>/<id>/01.jpg, 02.jpg…
 *   2. photos saved on the item itself in the dashboard (item.photos)
 *   3. photos added with the dashboard's Photo import: one Gallery entry per photo, linked by linkId
 */

const files = import.meta.glob('../assets/{projects,events}/*/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' })
const bundled = {}
for (const [path, url] of Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) {
  const m = path.match(/assets\/(projects|events)\/([^/]+)\//)
  if (m) (bundled[`${m[1]}/${m[2]}`] ||= []).push(url)
}

/** type is 'projects' or 'events'. */
export function bundledPhotos(type, item) {
  const key = item?.builtinKey || item?.id
  return (key && bundled[`${type}/${key}`]) || []
}

/** The picture for cards: the dashboard cover, else the first built-in photo, else the first saved photo. */
export function coverOf(type, item) {
  return item?.cover || bundledPhotos(type, item)[0] || item?.photos?.[0] || ''
}

/** Every built-in photo, for the Gallery page. */
export function allBundled(type, items) {
  return items.flatMap((item) => bundledPhotos(type, item).map((src, i) => ({ src, item, i })))
}

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0)
const linkedCache = new Map()

/** Photos imported for one event or project (Gallery entries whose linkId is this item's id). */
export function useLinkedPhotos(id) {
  const [list, setList] = useState(() => linkedCache.get(id) || [])
  useEffect(() => {
    if (!id) return undefined
    let alive = true
    ;(async () => {
      const kit = await getDb()
      if (!kit) return
      const { fs, db } = kit
      try {
        const snap = await fs.getDocs(fs.query(fs.collection(db, 'gallery'), fs.where('linkId', '==', id)))
        const found = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((g) => g.status !== 'draft' && g.src).sort(byOrder)
        linkedCache.set(id, found)
        if (alive) setList(found)
      } catch (err) {
        console.warn('Could not load photos for this page.', err)
      }
    })()
    return () => {
      alive = false
    }
  }, [id])
  return list
}

/** Every photo for an event or project: built-in, saved on the item, then imported. */
export function useItemPhotos(type, item) {
  const linked = useLinkedPhotos(item?.id)
  if (!item) return []
  const srcs = [...bundledPhotos(type, item), ...(item.photos || []), ...linked.map((g) => g.src)]
  return [...new Set(srcs)].map((src) => ({ src, title: item.title }))
}

let galleryPromise
/** All Gallery entries. Loaded only when a page needs them, because photos make this the heaviest collection. */
export function useGalleryDocs() {
  const [list, setList] = useState([])
  useEffect(() => {
    let alive = true
    galleryPromise ||= (async () => {
      const kit = await getDb()
      if (!kit) return []
      const { fs, db } = kit
      const snap = await fs.getDocs(fs.collection(db, 'gallery'))
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((g) => g.status !== 'draft')
    })().catch((err) => {
      console.warn('Could not load the gallery.', err)
      galleryPromise = null
      return []
    })
    galleryPromise.then((l) => alive && setList(l))
    return () => {
      alive = false
    }
  }, [])
  return list
}

/** Call after the dashboard changes photos, so the public pages fetch them again. */
export function forgetPhotoCache() {
  linkedCache.clear()
  galleryPromise = null
}
