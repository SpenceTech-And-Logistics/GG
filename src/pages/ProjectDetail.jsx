import { Link, useParams } from 'react-router-dom'
import FundingTable from '../components/FundingTable.jsx'
import PhotoGrid from '../components/PhotoGrid.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { money, yearLabel } from '../lib/media.js'
import { bundledPoster, bundledVideos, useItemPhotos } from '../lib/photos.js'
import { useContent } from '../lib/useContent.js'
import NotFound from './NotFound.jsx'

export default function ProjectDetail() {
  const { id } = useParams()
  const { projects } = useContent()
  const project = projects.find((p) => p.id === id)
  const photos = useItemPhotos('projects', project)
  const videos = bundledVideos('projects', project)

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
      {(project.items || []).filter(Boolean).length > 0 && (
        <section className="wrap section-tight">
          <Reveal>
            <span className="eyebrow">{project.itemsTitle || 'Included'}</span>
            <h2 className="title" style={{ marginBottom: 24 }}>{project.items.filter(Boolean).length} {(project.itemsTitle || 'items').toLowerCase()}</h2>
          </Reveal>
          <Reveal className="item-list">
            <ol>{project.items.filter(Boolean).map((x) => <li key={x}>{x}</li>)}</ol>
          </Reveal>
        </section>
      )}
      {(project.funding || []).length > 0 && (
        <section className="wrap section-tight">
          <FundingTable rows={project.funding} />
        </section>
      )}
      {videos.length > 0 && (
        <section className="wrap section-tight">
          <Reveal className="video-row">
            {videos.map((src, i) => (
              <video key={src} src={src} controls playsInline preload="metadata" onLoadedMetadata={(e) => { const v = e.currentTarget; v.dataset.shape = v.videoHeight > v.videoWidth ? 'tall' : 'wide'; v.style.aspectRatio = `${v.videoWidth} / ${v.videoHeight}` }} poster={bundledPoster('projects', project) || photos[0]?.src} aria-label={`${project.title}, video ${i + 1}`} />
            ))}
          </Reveal>
        </section>
      )}
      <section className="wrap section-tight">
        <PhotoGrid photos={photos} title={project.title} />
      </section>
    </>
  )
}
