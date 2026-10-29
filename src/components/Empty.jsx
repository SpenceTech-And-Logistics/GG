import { Link } from 'react-router-dom'

export default function Empty({ title, text, cta }) {
  return (
    <div className="empty">
      <div className="empty-mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 36V16l16-8 16 8v20M8 36h32M16 36V22m8 14V22m8 14V22" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {cta && (
        <Link to={cta.to} className="btn btn-ghost">
          {cta.label}
        </Link>
      )}
    </div>
  )
}
