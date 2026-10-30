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
    const projects = r && r.projects.length ? published(r.projects).sort(byDateDesc) : defaults.projects
    const press = r && r.press.length ? published(r.press).sort(byDateDesc) : defaults.press
    const events = r && r.events.length ? published(r.events).sort(byDateDesc) : defaults.events
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
