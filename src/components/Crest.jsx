import colour from '../assets/brand/crest-colour.webp'
import navy from '../assets/brand/crest-navy.webp'

/**
 * The Kenya coat of arms used in the office's logo.
 * "navy" is a line version for light backgrounds; "colour" is the full-colour crest for dark ones.
 */
export default function Crest({ tone = 'navy', className = '' }) {
  return <img src={tone === 'colour' ? colour : navy} alt="" aria-hidden="true" className={`crest ${className}`} />
}

/** The office lockup from the logo: crest, HON., GG KAGOMBE, rule in flag colours, MP GATUNDU SOUTH. */
export function Lockup({ tone = 'colour', stacked = false }) {
  return (
    <span className={`lockup ${stacked ? 'is-stacked' : ''}`}>
      <Crest tone={tone} />
      <span className="lockup-text">
        <small>Hon.</small>
        <b>GG Kagombe</b>
        <i className="lockup-rule" aria-hidden="true"><span /><span /><span /></i>
        <em>MP Gatundu South</em>
      </span>
    </span>
  )
}
