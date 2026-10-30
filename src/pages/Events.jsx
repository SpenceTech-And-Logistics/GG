import { useState } from 'react'
import { Link } from 'react-router-dom'
import Empty from '../components/Empty.jsx'
import PageHead from '../components/PageHead.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { formatDate } from '../lib/media.js'
import { bundledPhotos, coverOf } from '../lib/photos.js'
import { useContent } from '../lib/useContent.js'

export default function Events() {
  const { events } = useContent()
  const [cat, setCat] = useState('All')
  const cats = ['All', ...new Set(events.map((e) => e.category).filter(Boolean))]
  const shown = cat === 'All' ? events : events.filter((e) => e.category === cat)

  return (
    <>
      <PageHead
        eyebrow="Events"
        title="Out and about with Hon. Kagombe"
        lead="Launches, conferences, community gatherings and official visits, with photos from each."
      />
      <section className="wrap section-tight">
        {events.length === 0 ? (
          <Empty title="Events are on the way" text="Photos and notes from recent events will appear here as soon as the office publishes them." />
        ) : (
          <>
            {cats.length > 2 && (
              <div className="chips" role="group" aria-label="Filter events" style={{ marginBottom: 28 }}>
                {cats.map((c) => <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
              </div>
            )}
            <div className="grid grid-3">
              {shown.map((e, i) => {
                const cover = coverOf('events', e)
                const count = bundledPhotos('events', e).length + (e.photos?.length || 0)
                return (
                  <Reveal key={e.id} delay={(i % 3) * 100}>
                    <Link to={`/events/${e.id}`} className="card card-link">
                      <div className="card-img">
                        {cover ? <img src={cover} alt="" loading="lazy" /> : <div className="img-fallback">{e.category?.[0] || 'E'}</div>}
                        {count > 1 && <span className="img-count">{count} photos</span>}
                      </div>
                      <div className="card-body">
                        <span className="tag">{e.category || 'Event'}</span>
                        <h3>{e.title}</h3>
                        <span className="meta">{[formatDate(e.date), e.venue].filter(Boolean).join(' · ')}</span>
                      </div>
                    </Link>
                  </Reveal>
                )
              })}
            </div>
          </>
        )}
      </section>
    </>
  )
}
