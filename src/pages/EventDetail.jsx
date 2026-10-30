import { Link, useParams } from 'react-router-dom'
import PhotoGrid from '../components/PhotoGrid.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { formatDate } from '../lib/media.js'
import { useItemPhotos } from '../lib/photos.js'
import { useContent } from '../lib/useContent.js'
import NotFound from './NotFound.jsx'

export default function EventDetail() {
  const { id } = useParams()
  const { events } = useContent()
  const event = events.find((e) => e.id === id)
  const photos = useItemPhotos('events', event)

  if (!event) return <NotFound />
  const facts = [
    ['Date', formatDate(event.date)],
    ['Venue', event.venue],
    ['Category', event.category],
    ['Photos', photos.length || ''],
  ].filter(([, v]) => v)

  return (
    <>
      <section className="wrap page-head">
        <Link to="/events" className="link-arrow rise" style={{ '--d': '0ms' }}>← All events</Link>
        <h1 className="rise" style={{ '--d': '80ms', marginTop: 20 }}>{event.title}</h1>
        {event.summary && <p className="lead rise" style={{ '--d': '160ms' }}>{event.summary}</p>}
        {event.source && (
          <a href={event.source} target="_blank" rel="noreferrer" className="link-arrow rise" style={{ '--d': '220ms', marginTop: 16 }}>
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
        <PhotoGrid photos={photos} title={event.title} />
      </section>
    </>
  )
}
