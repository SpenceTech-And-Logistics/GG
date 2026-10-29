import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Lightbox from '../components/Lightbox.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { money } from '../lib/media.js'
import { useContent } from '../lib/useContent.js'
import NotFound from './NotFound.jsx'

export default function ProjectDetail() {
  const { id } = useParams()
  const { projects } = useContent()
  const [open, setOpen] = useState(-1)
  const project = projects.find((p) => p.id === id)
  const photos = (project?.photos || []).map((src) => ({ src, title: project?.title }))
  const move = (d) => setOpen((i) => (i < 0 ? i : (i + d + photos.length) % photos.length))
  const close = () => setOpen(-1)

  if (!project) return <NotFound />
  const facts = [
    ['Category', project.category],
    ['Year', project.year],
    ['Ward', project.ward],
    ['Amount', money(project.amount)],
  ].filter(([, v]) => v)

  return (
    <>
      <section className="wrap page-head">
        <Link to="/projects" className="link-arrow rise" style={{ '--d': '0ms' }}>← All projects</Link>
        <h1 className="rise" style={{ '--d': '80ms', marginTop: 20 }}>{project.title}</h1>
        {project.description && <p className="lead rise" style={{ '--d': '160ms' }}>{project.description}</p>}
      </section>
      <section className="wrap section-tight">
        <Reveal className="glance">
          {facts.map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}
        </Reveal>
      </section>
      {photos.length > 0 && (
        <section className="wrap section-tight">
          <div className="mosaic">
            {photos.map((p, i) => (
              <Reveal key={i} delay={(i % 3) * 90}>
                <button type="button" className="tileimg" onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1} of ${photos.length}`}>
                  <img src={p.src} alt={`${project.title}, photo ${i + 1}`} loading="lazy" />
                </button>
              </Reveal>
            ))}
          </div>
        </section>
      )}
      {open >= 0 && <Lightbox items={photos} index={open} onClose={close} onMove={move} />}
    </>
  )
}
