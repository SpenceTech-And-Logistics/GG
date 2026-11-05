import PageHead from '../components/PageHead.jsx'
import { CountUp, Reveal } from '../components/Reveal.jsx'
import { useContent } from '../lib/useContent.js'

export default function Parliament() {
  const { parliament: p } = useContent()

  return (
    <>
      <PageHead
        eyebrow="Parliament"
        title="The record in the National Assembly"
        lead="Committees, Bills, motions and questions of the Member for Gatundu South in the 13th Parliament."
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

      {((p.bills || []).length > 0 || p.billsNote) && (
      <section className="wrap section-tight">
        <Reveal><span className="eyebrow">Legislation</span><h2 className="title" style={{ marginBottom: 28 }}>Bills</h2></Reveal>
        {(p.bills || []).length > 0 && <Reveal className="table-wrap">
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
      )}

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
                <div className="q-side">
                  {x.status && <span className="pill">{x.status}</span>}
                  {x.url && (
                    <a href={x.url} target="_blank" rel="noreferrer" className="link-arrow">
                      {/mzalendo\.com\/legislative-trends\/questions/.test(x.url) ? 'Read the question' : /mzalendo/.test(x.url) ? 'On Mzalendo' : 'Read more'} <span>→</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </Reveal>
        </section>
      )}

      <section className="wrap section">
        <div>
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
