import { useState } from 'react'
import { Link } from 'react-router-dom'
import { POSITION_CATEGORIES } from '../data/content.js'
import { useContent } from '../lib/useContent.js'
import { Reveal } from './Reveal.jsx'

/** Offices, boards and roles, with a filter by group. Shown on the About page. */
export default function PositionsSection() {
  const { positions } = useContent()
  const [cat, setCat] = useState('All')
  if (!positions.length) return null
  const cats = ['All', ...POSITION_CATEGORIES.filter((c) => positions.some((p) => p.category === c))]
  const list = positions.filter((p) => cat === 'All' || p.category === cat)

  return (
    <section className="wrap section" id="positions">
      <Reveal>
        <span className="eyebrow">Positions</span>
        <h2 className="title" style={{ marginBottom: 12 }}>Offices, boards and responsibilities</h2>
        <p className="muted" style={{ maxWidth: 640, marginBottom: 24 }}>The seats he holds in Parliament and the boards, businesses and community bodies he serves.</p>
      </Reveal>
      {cats.length > 2 && (
        <div className="chips" style={{ marginBottom: 28 }} role="group" aria-label="Filter positions">
          {cats.map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      )}
      <div className="grid grid-3">
        {list.map((p, i) => (
          <Reveal key={p.id || p.title + p.organisation} className="card pos-card" delay={(i % 3) * 70}>
            <div className="pos-top">
              <span className="tag">{p.category}</span>
              {p.period && <span className="pos-when">{p.period}</span>}
            </div>
            <h3>{p.title}</h3>
            <b className="pos-org">{p.organisation}</b>
            {p.description && <p>{p.description}</p>}
          </Reveal>
        ))}
      </div>
      <p className="note">Committee membership also appears with the full record on the <Link to="/parliament" className="link-arrow">Parliament page</Link>.</p>
    </section>
  )
}
