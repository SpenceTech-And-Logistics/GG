import PageHead from '../components/PageHead.jsx'
import { CountUp, Reveal } from '../components/Reveal.jsx'
import { useContent } from '../lib/useContent.js'

export default function Parliament() {
  const { parliament: p } = useContent()
  const total = (p.votes.aye || 0) + (p.votes.no || 0) + (p.votes.absent || 0) || 1
  const pct = (n) => `${((n || 0) / total) * 100}%`

  return (
    <>
      <PageHead
        eyebrow="Parliament"
        title="The record in the National Assembly"
        lead="Committees, Bills, motions and votes and questions of the Member for Gatundu South in the 13th Parliament."
      />

      <section className="wrap section-tight">
        <div className="tiles">
          {p.stats.map((s, i) => (
            <Reveal key={s.label} className="tile" delay={i * 80}>
              <b><CountUp to={Number(s.value) || 0} /></b>
              <span>{s.label}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <Reveal><span className="eyebrow">Committees</span><h2 className="title" style={{ marginBottom: 28 }}>Where he sits</h2></Reveal>
        <div className="grid grid-2">
          {p.committees.map((c, i) => (
            <Reveal key={c.name} className="card" delay={i * 90}>
              <span className="tag">{c.role}</span>
              <h3>{c.name}</h3>
              {c.note && <p>{c.note}</p>}
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap section-tight">
        <Reveal><span className="eyebrow">Legislation</span><h2 className="title" style={{ marginBottom: 28 }}>Bills and votes</h2></Reveal>
        {p.bills.length > 0 && <Reveal className="table-wrap">
          <table>
            <thead><tr><th>Bill</th><th>Year</th><th>Status</th></tr></thead>
            <tbody>
              {p.bills.map((b) => (
                <tr key={b.title}>
                  <td className="t-title">{b.title}</td>
                  <td>{b.year}</td>
                  <td>{b.status ? <span className="pill ok">{b.status}</span> : <span className="muted">To be confirmed</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>}
        {p.billsNote && <p className="note">{p.billsNote}</p>}
      </section>

      {(p.questions || []).length > 0 && (
        <section className="wrap section-tight">
          <Reveal><span className="eyebrow">Questions</span><h2 className="title" style={{ marginBottom: 28 }}>Questions to Cabinet Secretaries</h2></Reveal>
          <Reveal className="list">
            {p.questions.map((x) => (
              <div className="list-row" key={x.title}>
                <div style={{ flex: '1 1 260px' }}>
                  <span className="meta">{[x.date, x.to].filter(Boolean).join(' · ')}</span>
                  <h3 style={{ fontSize: 20, marginTop: 4 }}>{x.title}</h3>
                </div>
                {x.status && <span className="pill">{x.status}</span>}
              </div>
            ))}
          </Reveal>
        </section>
      )}

      <section className="wrap section">
        <div className="split" style={{ alignItems: 'start' }}>
          <Reveal variant="left">
            <span className="eyebrow">Voting</span>
            <h2 className="title" style={{ marginBottom: 24 }}>How he has voted</h2>
            <Reveal className="votebar" variant="scale" aria-label="Voting record">
              <i className="a" style={{ '--w': pct(p.votes.aye) }} />
              <i className="n" style={{ '--w': pct(p.votes.no) }} />
              <i className="x" style={{ '--w': pct(p.votes.absent) }} />
            </Reveal>
            <div className="legend">
              <span><b>{p.votes.aye}</b> Aye</span>
              <span><b>{p.votes.no}</b> No</span>
              <span><b>{p.votes.absent}</b> Absent</span>
            </div>
          </Reveal>
          <Reveal variant="right">
            <span className="eyebrow">Recent motions</span>
            <h2 className="title" style={{ marginBottom: 24 }}>In the House</h2>
            <div className="list">
              {p.motions.map((m) => (
                <div className="list-row" key={m.title}>
                  <div style={{ flex: '1 1 260px' }}>
                    <span className="meta">{m.date}</span>
                    <h3 style={{ fontSize: 20, marginTop: 4 }}>{m.title}</h3>
                  </div>
                  <span className="pill ok">{m.outcome}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        {p.source && <p className="note">{p.source}</p>}
      </section>
    </>
  )
}
