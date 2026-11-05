import { useState } from 'react'
import { Link } from 'react-router-dom'
import Empty from '../components/Empty.jsx'
import PageHead from '../components/PageHead.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { money, yearLabel } from '../lib/media.js'
import { coverOf } from '../lib/photos.js'
import { useContent } from '../lib/useContent.js'

const BURSARIES = 'Bursaries'
const isBursary = (p) => /bursar/i.test(p.category || '') || /bursar/i.test(p.title || '')
const ksh = (n) => `KES ${Number(n).toLocaleString('en-KE')}`
const totalOf = (p) => (p.funding || []).reduce((n, r) => n + (Number(r.amount) || 0), 0) || Number(p.amount) || 0

/** As in the bursary spreadsheet: one list per category (Secondary, Tertiary…), each financial year with its allocation, then the total. */
function AllocationLists({ rows }) {
  const list = rows.filter((r) => r.category && r.year && Number(r.amount))
  const cats = [...new Set(list.map((r) => String(r.category).trim()))]
  return (
    <div className="alloc-grid">
      {cats.map((c, i) => {
        const items = list.filter((r) => String(r.category).trim() === c).sort((a, b) => String(a.year).localeCompare(String(b.year)))
        const total = items.reduce((n, r) => n + Number(r.amount), 0)
        return (
          <Reveal key={c} delay={(i % 4) * 80} className="alloc">
            <h4>{c}</h4>
            <table>
              <thead><tr><th scope="col">FY</th><th scope="col" className="num">Allocation (KES)</th></tr></thead>
              <tbody>{items.map((r) => <tr key={r.year}><td>{fyLabel(r.year)}</td><td className="num">{Number(r.amount).toLocaleString('en-KE')}</td></tr>)}</tbody>
              <tfoot><tr><th scope="row">Total</th><td className="num">{total.toLocaleString('en-KE')}</td></tr></tfoot>
            </table>
          </Reveal>
        )
      })}
    </div>
  )
}

// "2022/23" → "2022/2023", as written in the spreadsheet.
const fyLabel = (y) => String(y).replace(/^(\d{2})(\d{2})\/(\d{2})$/, (_, c, a, b) => `${c}${a}/${c}${b}`)

function BursaryList({ items, spaced }) {
  const total = items.reduce((n, p) => n + totalOf(p), 0)
  return (
    <div className="bursary-list" style={spaced ? { marginTop: 72 } : undefined}>
      <Reveal>
        <span className="eyebrow">{BURSARIES}</span>
        <h2 className="title">{total ? `${ksh(total)} in bursaries` : 'Bursaries'}</h2>
      </Reveal>
      {items.map((p) => (
        <div key={p.id} className="bursary-item">
          <Reveal className="bursary-head">
            <div>
              <h3><Link to={`/projects/${p.id}`}>{p.title}</Link></h3>
              <span className="meta">{[p.ward, yearLabel(p.year), totalOf(p) ? ksh(totalOf(p)) : ''].filter(Boolean).join(' · ')}</span>
            </div>
            <Link to={`/projects/${p.id}`} className="link-arrow">Details <span>→</span></Link>
          </Reveal>
          {(p.funding || []).length > 0 ? <AllocationLists rows={p.funding} /> : p.description && <p className="lead">{p.description}</p>}
        </div>
      ))}
    </div>
  )
}

export default function Projects() {
  const { projects } = useContent()
  const [cat, setCat] = useState('All')
  // Bursaries are listed as allocations (a table per bursary programme) rather than as cards.
  const bursaries = projects.filter(isBursary)
  const others = projects.filter((p) => !isBursary(p))
  const cats = ['All', ...new Set(others.map((p) => p.category).filter(Boolean)), ...(bursaries.length ? [BURSARIES] : [])]
  const shown = cat === 'All' ? others : cat === BURSARIES ? [] : others.filter((p) => p.category === cat)
  const showBursaries = bursaries.length > 0 && (cat === 'All' || cat === BURSARIES)

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
            {showBursaries && <BursaryList items={bursaries} spaced={shown.length > 0} />}
          </>
        )}
      </section>
    </>
  )
}
