import { Link } from 'react-router-dom'
import { CountUp, Reveal } from '../components/Reveal.jsx'
import Marquee from '../components/Marquee.jsx'
import Portrait from '../components/Portrait.jsx'
import { useContent } from '../lib/useContent.js'
import { formatDate } from '../lib/media.js'

export default function Home() {
  const { profile, parliament, press, projects, positions, contact } = useContent()
  const socials = (contact.social || []).filter((l) => l.url)
  const news = press.slice(0, 3)

  const stats = [
    { n: 17815, label: 'Votes at the August 2022 election' },
    { n: parliament.committees.length, label: 'Committees and caucuses' },
    { n: parliament.stats.find((s) => /contribution/i.test(s.label))?.value ?? 47, label: 'Contributions in the House' },
    { n: parliament.stats.find((s) => /report/i.test(s.label))?.value ?? 25, label: 'Committee reports' },
  ]

  return (
    <>
      <section className="wrap hero">
        <div>
          <span className="eyebrow rise" style={{ '--d': '0ms' }}>Member of Parliament · Gatundu South</span>
          <h1 className="rise" style={{ '--d': '100ms' }}>
            Hon. Gabriel <em>Gathuka</em> Kagombe
          </h1>
          <p className="lead rise" style={{ '--d': '220ms' }}>{profile.intro}</p>
          <div className="hero-actions rise" style={{ '--d': '340ms' }}>
            <Link to="/parliament" className="btn btn-solid">See the record</Link>
            <Link to="/about" className="btn btn-ghost">About Hon. Kagombe</Link>
          </div>
          <div className="hero-meta rise" style={{ '--d': '460ms' }}>
            <span><b>{profile.party}</b>Party</span>
            <span><b>{profile.elected}</b>Elected</span>
            <span><b>{profile.parliament}</b>Parliament</span>
          </div>
        </div>
        <div className="rise" style={{ '--d': '300ms' }}>
          <Portrait eager slot="hero" />
        </div>
      </section>

      <Marquee items={profile.interests} />

      <section className="stat-strip" aria-label="Key figures">
        <div className="wrap stat-strip-in">
          {stats.map((s, i) => (
            <Reveal key={s.label} className="stat" delay={i * 110}>
              <b><CountUp to={s.n} /></b>
              <span>{s.label}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow">Focus areas</span>
            <h2 className="title">What he works on</h2>
          </div>
          <Link to="/parliament" className="link-arrow">Committees and record <span>→</span></Link>
        </Reveal>
        <div className="grid grid-4">
          {profile.focus.map((f, i) => (
            <Reveal key={f.title} className="card" delay={i * 100}>
              <span className="num">0{i + 1}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap section-tight">
        <div className="split">
          <Reveal variant="left"><Portrait parallax={false} slot="home" /></Reveal>
          <Reveal variant="right" className="prose">
            <span className="eyebrow">About</span>
            <h2 className="title" style={{ marginBottom: 20 }}>From economics and tea to the National Assembly</h2>
            <p>{profile.bio[0]}</p>
            <p style={{ marginBottom: 24 }}>{profile.bio[1]}</p>
            <Link to="/about" className="link-arrow">Read the full profile <span>→</span></Link>
          </Reveal>
        </div>
      </section>

      <section className="wrap section-tight">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow">Positions</span>
            <h2 className="title">Where he serves</h2>
          </div>
          <Link to="/positions" className="link-arrow">All positions <span>→</span></Link>
        </Reveal>
        <div className="grid grid-4">
          {positions.slice(0, 4).map((p, i) => (
            <Reveal key={p.id || p.title} className="card" delay={i * 90}>
              <span className="tag">{p.category}</span>
              <h3>{p.title}</h3>
              <p>{p.organisation}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow">Legislation</span>
            <h2 className="title">Bills and votes</h2>
          </div>
          <Link to="/parliament" className="link-arrow">All parliamentary work <span>→</span></Link>
        </Reveal>
        <Reveal className="list">
          {parliament.bills.map((b) => (
            <div className="list-row" key={b.title}>
              <h3>{b.title}</h3>
              <span className={`pill ${b.status ? 'ok' : ''}`}>{b.status || b.year}</span>
            </div>
          ))}
        </Reveal>
      </section>

      {projects.length > 0 && (
        <section className="wrap section-tight">
          <Reveal className="section-head">
            <div>
              <span className="eyebrow">Projects</span>
              <h2 className="title">Delivered in Gatundu South</h2>
            </div>
            <Link to="/projects" className="link-arrow">All projects <span>→</span></Link>
          </Reveal>
          <div className="grid grid-3">
            {projects.slice(0, 3).map((p, i) => (
              <Reveal key={p.id} delay={i * 100}>
                <Link to={`/projects/${p.id}`} className="card card-link">
                  <div className="card-img">{p.photos?.[0] ? <img src={p.photos[0]} alt={p.title} loading="lazy" /> : <div className="img-fallback">{p.category?.[0]}</div>}</div>
                  <div className="card-body">
                    <span className="tag">{p.category}</span>
                    <h3>{p.title}</h3>
                    <span className="meta">{[p.ward, p.year].filter(Boolean).join(' · ')}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="wrap section">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow">News</span>
            <h2 className="title">Latest</h2>
          </div>
          <Link to="/news" className="link-arrow">All news <span>→</span></Link>
        </Reveal>
        <div className="grid grid-3">
          {news.map((n, i) => (
            <Reveal key={n.id} className="card" delay={i * 100}>
              <span className="tag">{n.category || 'News'}</span>
              <h3>{n.title}</h3>
              <span className="meta">{[n.outlet, formatDate(n.date)].filter(Boolean).join(' · ')}</span>
              {n.url && <a href={n.url} target="_blank" rel="noreferrer" className="link-arrow">Read <span>→</span></a>}
            </Reveal>
          ))}
        </div>
      </section>

      {socials.length > 0 && (
        <section className="wrap section-tight">
          <Reveal className="follow-band">
            <h2>Follow the Member</h2>
            <div className="chips">
              {socials.map((l) => <a key={l.url} className="chip" href={l.url} target="_blank" rel="noreferrer">{l.label || l.url}</a>)}
            </div>
          </Reveal>
        </section>
      )}

      <section className="wrap">
        <Reveal variant="scale" className="cta">
          <div>
            <h2>Have an issue for the Member for Gatundu South?</h2>
            <p>Write to the office. A member of the team will respond.</p>
          </div>
          <Link to="/contact" className="btn btn-light">Get in touch</Link>
        </Reveal>
      </section>
    </>
  )
}
