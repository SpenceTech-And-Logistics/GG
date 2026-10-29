import { useState } from 'react'
import PageHead from '../components/PageHead.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { formatDate } from '../lib/media.js'
import { useContent } from '../lib/useContent.js'

export default function News() {
  const { press } = useContent()
  const [cat, setCat] = useState('All')
  const cats = ['All', ...new Set(press.map((n) => n.category).filter(Boolean))]
  const shown = cat === 'All' ? press : press.filter((n) => n.category === cat)
  const [first, ...rest] = shown
  const meta = (n) => [n.outlet, formatDate(n.date)].filter(Boolean).join(' · ')

  return (
    <>
      <PageHead eyebrow="News and press" title="Hon. Kagombe in the news" />
      <section className="wrap section-tight">
        {cats.length > 2 && (
          <div className="chips" role="group" aria-label="Filter news" style={{ marginBottom: 28 }}>
            {cats.map((c) => <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
          </div>
        )}
        {first && (
          <Reveal className="card card-link" style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
            <div className="card-img" style={{ flex: '1 1 340px', minHeight: 260, aspectRatio: 'auto' }}>
              {first.image ? <img src={first.image} alt="" loading="lazy" /> : <div className="img-fallback">GK</div>}
            </div>
            <div style={{ flex: '1 1 380px', padding: 'clamp(24px,4vw,44px)', display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
              <span className="meta">{meta(first)}</span>
              <h2 style={{ font: '500 clamp(26px,3vw,36px)/1.15 var(--serif)' }}>{first.title}</h2>
              {first.summary && <p className="muted" style={{ lineHeight: 1.6 }}>{first.summary}</p>}
              {first.url && <a href={first.url} target="_blank" rel="noreferrer" className="link-arrow">Read the post <span>→</span></a>}
            </div>
          </Reveal>
        )}
        {rest.length > 0 && (
          <div className="list">
            {rest.map((n) => (
              <Reveal className="list-row" key={n.id}>
                {n.image && <img src={n.image} alt="" loading="lazy" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6 }} />}
                <div style={{ flex: '1 1 340px', minWidth: 0 }}>
                  <span className="meta">{meta(n)}</span>
                  <h3 style={{ fontSize: 22, marginTop: 4 }}>{n.title}</h3>
                </div>
                {n.url && <a href={n.url} target="_blank" rel="noreferrer" className="link-arrow">Open <span>→</span></a>}
              </Reveal>
            ))}
          </div>
        )}
        <p className="note">Each item links to the original article. Coverage is added from the dashboard.</p>
      </section>
    </>
  )
}
