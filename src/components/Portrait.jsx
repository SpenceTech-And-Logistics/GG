import { useRef } from 'react'
import { useScroll } from '../lib/hooks.js'
import { useContent } from '../lib/useContent.js'

// Drop a file called portrait.jpg (or .png / .webp) into src/assets/images and it is used automatically.
const files = import.meta.glob('../assets/images/portrait.*', { eager: true, query: '?url', import: 'default' })
const bundled = Object.values(files)[0] || ''

export default function Portrait({ className = '', parallax = true, eager = false }) {
  const { profile } = useContent()
  const ref = useRef(null)
  const src = profile.photo || bundled

  useScroll((y) => {
    if (!parallax || !ref.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    ref.current.style.setProperty('--py', `${Math.min(y, 900) * -0.06}px`)
  })

  return (
    <div className={`portrait ${className}`} ref={ref}>
      <div className="portrait-frame" aria-hidden="true" />
      <div className="portrait-card">
        {src ? (
          <img src={src} alt={`Portrait of ${profile.name}`} loading={eager ? 'eager' : 'lazy'} />
        ) : (
          <div className="portrait-mono" role="img" aria-label={`Monogram of ${profile.name}`}>
            <span>GK</span>
            <small>Gatundu South</small>
          </div>
        )}
      </div>
    </div>
  )
}
