export default function PageHead({ eyebrow, title, lead }) {
  return (
    <section className="wrap page-head">
      <span className="eyebrow rise" style={{ '--d': '0ms' }}>{eyebrow}</span>
      <h1 className="rise" style={{ '--d': '90ms' }}>{title}</h1>
      {lead && <p className="lead rise" style={{ '--d': '180ms' }}>{lead}</p>}
    </section>
  )
}
