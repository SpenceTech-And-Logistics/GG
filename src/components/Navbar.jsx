import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useScroll } from '../lib/hooks.js'
import { useContent } from '../lib/useContent.js'
import Crest from './Crest.jsx'

const links = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/parliament', 'Parliament'],
  ['/projects', 'Projects'],
  ['/events', 'Events'],
  ['/news', 'News'],
  ['/gallery', 'Gallery'],
  ['/contact', 'Contact'],
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { profile } = useContent()
  useScroll((y) => setScrolled(y > 24))
  const close = () => setOpen(false)

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="wrap site-header-in">
        <Link to="/" className={`brand ${profile.logoHeader !== false ? 'has-crest' : ''}`} onClick={close} aria-label="Hon. GG Kagombe, home">
          {profile.logoHeader !== false ? (
            <>
              <Crest tone="navy" />
              <span className="brand-name">
                <small>Hon.</small>
                GG Kagombe
                <em>MP Gatundu South</em>
              </span>
            </>
          ) : (
            <>
              <span className="monogram">GG</span>
              <span className="brand-name">
                Hon. GG
                <br />
                Kagombe
              </span>
            </>
          )}
        </Link>
        <nav className="nav" id="main-nav" aria-label="Main">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={close}>
              {label}
            </NavLink>
          ))}
        </nav>
        <Link to="/contact" className="btn btn-solid nav-cta" onClick={close}>
          Get in touch
        </Link>
        <button
          type="button"
          className="burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
