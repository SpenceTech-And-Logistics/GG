import { useCallback, useMemo, useState } from 'react'
import Empty from '../components/Empty.jsx'
import Lightbox from '../components/Lightbox.jsx'
import PageHead from '../components/PageHead.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { videoInfo } from '../lib/media.js'
import { allBundled, useGalleryDocs } from '../lib/photos.js'
import { useContent } from '../lib/useContent.js'

const LINK = {
  events: { path: '/events/', label: 'See the event', category: 'Events' },
  projects: { path: '/projects/', label: 'See the project', category: 'Projects' },
}

export default function Gallery() {
  const { projects, press, events } = useContent()
  const docs = useGalleryDocs()
  const [cat, setCat] = useState('All')
  const [open, setOpen] = useState(-1)

  // Standalone photos and videos, imported photos, built-in event and project photos, and press images.
  const all = useMemo(() => {
    const titles = Object.fromEntries([...events.map((e) => [e.id, e.title]), ...projects.map((p) => [p.id, p.title])])
    const own = docs.map((g) => {
      if (g.type === 'video') {
        const v = videoInfo(g.url)
        return { id: g.id, kind: 'video', title: g.title, category: 'Videos', thumb: g.thumb || v.thumb, embed: v.embed, url: g.url }
      }
      const link = LINK[g.linkType]
      return {
        id: g.id, kind: 'photo', src: g.src, thumb: g.src,
        title: g.title || titles[g.linkId] || '',
        category: link?.category || g.category,
        ...(link && g.linkId ? { href: link.path + g.linkId, hrefLabel: link.label } : {}),
      }
    })
    const built = (type, items) =>
      allBundled(type, items).map(({ src, item, i }) => ({
        id: `${type}-${item.id}-${i}`, kind: 'photo', src, thumb: src, title: item.title,
        category: LINK[type].category, href: LINK[type].path + item.id, hrefLabel: LINK[type].label,
      }))
    const saved = projects.flatMap((p) =>
      (p.photos || []).map((src, i) => ({ id: `${p.id}-${i}`, kind: 'photo', title: p.title, category: 'Projects', src, thumb: src, href: `/projects/${p.id}`, hrefLabel: 'See the project' })),
    )
    const savedEvents = events.flatMap((e) =>
      (e.photos || []).map((src, i) => ({ id: `${e.id}-${i}`, kind: 'photo', title: e.title, category: 'Events', src, thumb: src, href: `/events/${e.id}`, hrefLabel: 'See the event' })),
    )
    const fromPress = press.filter((n) => n.image).map((n) => ({ id: `press-${n.id}`, kind: 'photo', title: n.title, category: 'Press', src: n.image, thumb: n.image }))
    const seen = new Set()
    return [...own, ...built('events', events), ...savedEvents, ...built('projects', projects), ...saved, ...fromPress]
      .filter((i) => i.thumb || i.kind === 'video')
      .filter((i) => (i.kind === 'video' ? true : !seen.has(i.src) && seen.add(i.src)))
  }, [docs, projects, press, events])

  const cats = ['All', ...new Set(all.map((i) => i.category).filter(Boolean))]
  const shown = cat === 'All' ? all : all.filter((i) => i.category === cat)
  const viewable = shown.filter((i) => i.kind === 'photo' || i.embed)
  const move = useCallback((d) => setOpen((i) => (i < 0 ? i : (i + d + viewable.length) % viewable.length)), [viewable.length])
  const close = useCallback(() => setOpen(-1), [])

  return (
    <>
      <PageHead eyebrow="Gallery" title="Photos and video from the work" />
      <section className="wrap section-tight">
        {all.length === 0 ? (
          <Empty title="Photos and video are coming" text="The office is gathering pictures from Parliament, the constituency and events. They will appear here when published." />
        ) : (
          <>
            <div className="chips" role="group" aria-label="Filter gallery" style={{ marginBottom: 28 }}>
              {cats.map((c) => <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => { setCat(c); setOpen(-1) }}>{c}</button>)}
            </div>
            <div className="mosaic">
              {shown.map((item, i) => {
                const idx = viewable.indexOf(item)
                const inner = (
                  <>
                    {item.thumb ? <img src={item.thumb} alt={item.title || ''} loading="lazy" /> : <span className="vid-fallback" />}
                    {item.kind === 'video' && <><span className="play" aria-hidden="true">▶</span><span className="badge">Video</span></>}
                  </>
                )
                return (
                  <Reveal key={item.id} delay={(i % 3) * 80}>
                    {idx >= 0 ? (
                      <button type="button" className="tileimg" onClick={() => setOpen(idx)} aria-label={item.title || 'Open'}>{inner}</button>
                    ) : (
                      <a className="tileimg" href={item.url} target="_blank" rel="noreferrer" aria-label={`${item.title || 'Video'} (opens in a new tab)`}>{inner}</a>
                    )}
                  </Reveal>
                )
              })}
            </div>
            <p className="note">Photos open in a larger viewer, with a link to the event or project they come from.</p>
          </>
        )}
      </section>
      {open >= 0 && viewable[open] && <Lightbox items={viewable} index={open} onClose={close} onMove={move} />}
    </>
  )
}
