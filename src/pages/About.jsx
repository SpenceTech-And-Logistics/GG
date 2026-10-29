import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead.jsx'
import Portrait from '../components/Portrait.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { useContent } from '../lib/useContent.js'

export default function About() {
  const { profile } = useContent()
  return (
    <>
      <PageHead eyebrow="About" title={profile.title} lead={`${profile.name} (${profile.officialName} in the Parliament of Kenya records).`} />

      <section className="wrap section-tight">
        <div className="split">
          <Reveal variant="left"><Portrait slot="about" /></Reveal>
          <Reveal variant="right" className="prose">
            {profile.bio.map((p, i) => <p key={i}>{p}</p>)}
          </Reveal>
        </div>
      </section>

      <section className="wrap section-tight">
        <Reveal className="glance">
          <div><small>Constituency</small><b>Gatundu South</b></div>
          <div><small>Party</small><b>{profile.party}</b></div>
          <div><small>Elected</small><b>{profile.elected}</b></div>
          <div><small>Parliament</small><b>{profile.parliament}</b></div>
        </Reveal>
      </section>

      <section className="wrap section">
        <Reveal><span className="eyebrow">Career</span><h2 className="title" style={{ marginBottom: 32 }}>Public service and profession</h2></Reveal>
        <Reveal className="timeline">
          {profile.timeline.map((t) => (
            <div className="t-item" key={t.title}>
              {t.when && <span className="t-when">{t.when}</span>}
              <h3>{t.title}</h3>
              {t.detail && <p>{t.detail}</p>}
            </div>
          ))}
        </Reveal>
      </section>

      <section className="wrap section-tight">
        <Reveal><span className="eyebrow">Education</span><h2 className="title" style={{ marginBottom: 28 }}>Qualifications</h2></Reveal>
        <div className="grid grid-3">
          {profile.education.map((e, i) => (
            <Reveal key={e.title} className="card" delay={i * 90}>
              {e.when && <span className="num">{e.when}</span>}
              <h3>{e.title}</h3>
              {e.detail && <p>{e.detail}</p>}
            </Reveal>
          ))}
        </div>
      </section>

      {profile.vision && (
        <section className="wrap section">
          <Reveal className="cta">
            <div><span className="eyebrow" style={{ color: '#f0b9a8' }}>Vision</span><h2 style={{ marginTop: 12 }}>{profile.vision}</h2></div>
          </Reveal>
        </section>
      )}

      <section className="wrap section">
        <Reveal className="cta">
          <div><h2>See his work in Parliament</h2><p>Committees, Bills, motions and voting record.</p></div>
          <Link to="/parliament" className="btn btn-light">Parliamentary record</Link>
        </Reveal>
      </section>
    </>
  )
}
