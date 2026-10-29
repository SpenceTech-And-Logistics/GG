import { useRef } from 'react'
import { useScroll } from '../lib/hooks.js'
import { useContent } from '../lib/useContent.js'

// Drop image files into src/assets/images and they are used automatically:
//   portrait.jpg       the main portrait, used anywhere without its own photo
//   portrait-hero.jpg  the Home page hero
//   portrait-home.jpg  the About section on the Home page
//   portrait-about.jpg the About page
// (.png and .webp work too.) Photos uploaded in the dashboard take priority.
const files = import.meta.glob('../assets/images/portrait*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' })
const bundledFor = (name) => Object.entries(files).find(([path]) => new RegExp(`/${name}\\.\\w+$`).test(path))?.[1] || ''

// Which dashboard field each spot reads.
const FIELD = { hero: 'heroPhoto', home: 'homeAboutPhoto', about: 'aboutPhoto' }
const FILE = { hero: 'portrait-hero', home: 'portrait-home', about: 'portrait-about' }

export default function Portrait({ className = '', parallax = true, eager = false, slot = 'hero' }) {
  const { profile } = useContent()
  const ref = useRef(null)
  const src = profile[FIELD[slot]] || bundledFor(FILE[slot]) || profile.photo || bundledFor('portrait')

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
