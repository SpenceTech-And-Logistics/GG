import { Link, useParams } from 'react-router-dom'
import PhotoGrid from '../components/PhotoGrid.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { money, yearLabel } from '../lib/media.js'
import { useItemPhotos } from '../lib/photos.js'
import { useContent } from '../lib/useContent.js'
import NotFound from './NotFound.jsx'

export default function ProjectDetail() {
  const { id } = useParams()
  const { projects } = useContent()
  const project = projects.find((p) => p.id === id)
  const photos = useItemPhotos('projects', project)

  if (!project) return <NotFound />
  const facts = [
    ['Category', project.category],
    ['Year', yearLabel(project.year)],
    ['Status', project.progress],
    ['Ward', project.ward],
    ['Amount', money(project.amount)],
  ].filter(([, v]) => v)

  return (
    <>
      <section className="wrap page-head">
        <Link to="/projects" className="link-arrow rise" style={{ '--d': '0ms' }}>← All projects</Link>
        <h1 className="rise" style={{ '--d': '80ms', marginTop: 20 }}>{project.title}</h1>
        {project.description && <p className="lead rise" style={{ '--d': '160ms' }}>{project.description}</p>}
        {project.source && (
          <a href={project.source} target="_blank" rel="noreferrer" className="link-arrow rise" style={{ '--d': '220ms', marginTop: 16 }}>
            Read the report <span>→</span>
          </a>
        )}
      </section>
      {facts.length > 0 && (
        <section className="wrap section-tight">
          <Reveal className="glance">{facts.map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}</Reveal>
        </section>
      )}
      <section className="wrap section-tight">
        <PhotoGrid photos={photos} title={project.title} />
      </section>
    </>
  )
}
