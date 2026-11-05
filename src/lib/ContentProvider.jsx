import { useCallback, useEffect, useMemo, useState } from 'react'
import { defaults } from '../data/content.js'
import { getDb } from './firebase.js'
import { ContentContext } from './useContent.js'

const nonEmpty = (v) => (Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && v !== '')

function merge(base, over) {
  if (!over) return base
  const out = { ...base }
  for (const k of Object.keys(over)) if (nonEmpty(over[k])) out[k] = over[k]
  return out
}

const byOrder = (a, b) => Number(a.order ?? 999) - Number(b.order ?? 999)

/** Visitors never see the same title twice: keep the fuller copy (built-in, more photos) where the dashboard has duplicates. */
function uniqueByTitle(items) {
  const key = (it) => String(it.title || '').replace(/\s+/g, ' ').trim().toLowerCase()
  const rank = (it) => (it.builtinKey ? 100 : 0) + (it.photos || []).length + (it.cover ? 1 : 0)
  const best = new Map()
  for (const it of items) {
    const k = key(it) || it.id
    if (!best.has(k) || rank(it) > rank(best.get(k))) best.set(k, it)
  }
  return items.filter((it) => best.get(key(it) || it.id) === it)
}
/**
 * Dashboard copies of built-in items keep up with fields added to the site later (e.g. the bursary allocations,
 * a project's list of roads): anything the copy leaves empty is filled from the built-in item.
 */
function withBuiltin(items, builtins) {
  const byKey = new Map(builtins.map((b) => [b.id, b]))
  return items.map((it) => {
    const b = byKey.get(it.builtinKey || it.id)
    if (!b) return it
    const out = { ...it }
    for (const k of ['funding', 'items', 'itemsTitle', 'seoTitle']) if (!nonEmpty(out[k]) && nonEmpty(b[k])) out[k] = b[k]
    return out
  })
}
const titleKey = (t) => String(t || '').replace(/\s+/g, ' ').trim().toLowerCase()

/**
 * Dashboard items, plus the built-in ones the dashboard does not have (so projects added to the site later show
 * without copying), minus built-in ones the office deleted (site/removed).
 */
function combine(all, builtins, removed = []) {
  if (!all.length && !removed.length) return builtins
  const have = new Set(all.flatMap((i) => [i.id, i.builtinKey]).filter(Boolean))
  const titles = new Set(all.map((i) => titleKey(i.title)))
  const gone = new Set(removed)
  const extra = builtins.filter((b) => !have.has(b.id) && !gone.has(b.id) && !titles.has(titleKey(b.title)))
  const published = withBuiltin(all.filter((i) => i.status !== 'draft'), builtins)
  return uniqueByTitle([...published, ...extra]).sort(byDateDesc)
}
const byDateDesc = (a, b) => String(b.date || b.year || '').localeCompare(String(a.date || a.year || ''))

export function ContentProvider({ children }) {
  const [remote, setRemote] = useState(null)
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const kit = await getDb()
      if (!kit) return
      const { fs, db } = kit
      try {
        // The gallery is not loaded here: it holds the photos, so pages that need it load it themselves (lib/photos.js).
        const [site, projects, press, positions, events] = await Promise.all(
          // Each collection loads on its own, so one failing (e.g. rules not yet published) does not hide the rest.
          ['site', 'projects', 'press', 'positions', 'events'].map((c) =>
            fs.getDocs(fs.collection(db, c)).catch((err) => {
              console.warn(`Could not load ${c}; showing built-in content for it.`, err)
              return { docs: [] }
            }),
          ),
        )
        const list = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        const docs = Object.fromEntries(site.docs.map((d) => [d.id, d.data()]))
        if (alive) setRemote({ docs, projects: list(projects), press: list(press), positions: list(positions), events: list(events) })
      } catch (err) {
        console.warn('Could not load content from Firebase; showing built-in content.', err)
      }
    })()
    return () => {
      alive = false
    }
  }, [tick])

  const value = useMemo(() => {
    const r = remote
    const published = (items) => items.filter((i) => i.status !== 'draft')
    const removed = r?.docs.removed || {}
    const projects = r ? combine(r.projects, defaults.projects, removed.projects) : defaults.projects
    const press = r && r.press.length ? published(r.press).sort(byDateDesc) : defaults.press
    const events = r ? combine(r.events, defaults.events, removed.events) : defaults.events
    const positions = r && r.positions.length ? published(r.positions).sort(byOrder) : defaults.positions
    return {
      positions,
      profile: merge(defaults.profile, r?.docs.profile),
      parliament: merge(defaults.parliament, r?.docs.parliament),
      contact: merge(defaults.contact, r?.docs.contact),
      projects,
      press,
      events,
      live: Boolean(r),
      refresh,
    }
  }, [remote, refresh])

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}
