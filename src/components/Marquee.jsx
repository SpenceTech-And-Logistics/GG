export default function Marquee({ items }) {
  if (!items?.length) return null
  const row = [...items, ...items]
  return (
    <div className="marquee" aria-label={`Areas of focus: ${items.join(', ')}`}>
      <div className="marquee-track" aria-hidden="true">
        {row.map((t, i) => (
          <span key={i}>
            {t}
            <i />
          </span>
        ))}
      </div>
    </div>
  )
}
