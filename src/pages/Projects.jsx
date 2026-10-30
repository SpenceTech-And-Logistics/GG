import { useState } from 'react'
import { Link } from 'react-router-dom'
import Empty from '../components/Empty.jsx'
import PageHead from '../components/PageHead.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { money, yearLabel } from '../lib/media.js'
import { coverOf } from '../lib/photos.js'
import { useContent } from '../lib/useContent.js'

export default function Projects() {
  const { projects } = useContent()
  const [cat, setCat] = useState('All')
  const cats = ['All', ...new Set(projects.map((p) => p.category).filter(Boolean))]
  const shown = cat === 'All' ? projects : projects.filter((p) => p.category === cat)

  return (
    <>
      <PageHead
        eyebrow="Projects"
        title="Work delivered in Gatundu South"
        lead="NG-CDF school works, roads and water, housing, skills and bursaries: what has been done in Gatundu South, where and for whom."
      />
      <section className="wrap section-tight">
        {projects.length === 0 ? (
          <Empty
            title="Project updates are on the way"
            text="The office is preparing the list of projects delivered in Gatundu South. They will appear here, with photos, as soon as they are published."
            cta={{ to: '/contact', label: 'Tell the office about a project' }}
          />
        ) : (
          <>
            <div className="chips" role="group" aria-label="Filter projects" style={{ marginBottom: 28 }}>
              {cats.map((c) => (
                <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
            <div className="grid grid-3">
              {shown.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 100}>
                  <Link to={`/projects/${p.id}`} className="card card-link">
                    <div className="card-img">
                      {coverOf('projects', p) ? <img src={coverOf('projects', p)} alt="" loading="lazy" /> : <div className="img-fallback">{p.category?.[0]}</div>}
                      {p.progress && <span className={`img-count status-${p.progress.toLowerCase()}`}>{p.progress}</span>}
                    </div>
                    <div className="card-body">
                      <span className="tag">{p.category}</span>
                      <h3>{p.title}</h3>
                      {p.description && <p>{p.description.length > 120 ? `${p.description.slice(0, 117)}…` : p.description}</p>}
                      <span className="meta">{[p.ward, yearLabel(p.year), money(p.amount)].filter(Boolean).join(' · ')}</span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  )
}
