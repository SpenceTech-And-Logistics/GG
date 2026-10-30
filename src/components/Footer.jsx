import { Link } from 'react-router-dom'
import { useContent } from '../lib/useContent.js'
import SocialLinks from './SocialLinks.jsx'

export default function Footer() {
  const { contact } = useContent()
  const socials = (contact.social || []).filter((l) => l.url)
  return (
    <footer className="site-footer">
      <div className="wrap footer-top">
        <div>
          <div className="brand brand-light">
            <span className="monogram">GK</span>
            <span className="brand-name">
              Hon. Gabriel
              <br />
              Gathuka Kagombe
            </span>
          </div>
          <p className="footer-blurb">Member of Parliament for Gatundu South, 13th Parliament of Kenya.</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link to="/about">About</Link>
          <Link to="/parliament">Parliament</Link>
          <Link to="/positions">Positions</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/events">Events</Link>
          <Link to="/news">News</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <div className="footer-contact">
          <span>{contact.parliament}</span>
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>{contact.phone}</span>}
          <SocialLinks links={socials} className="on-dark" />
        </div>
      </div>
      <div className="footer-bar">
        <div className="wrap footer-bar-in">
          <span>© Hon. Gabriel Gathuka Kagombe, MP for Gatundu South</span>
          <span>Built by SpenceTec and Logistics Limited</span>
        </div>
      </div>
    </footer>
  )
}
