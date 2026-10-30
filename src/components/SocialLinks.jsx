import { siFacebook, siInstagram, siTelegram, siThreads, siTiktok, siWhatsapp, siX, siYoutube } from 'simple-icons'

// LinkedIn is not in simple-icons, so it uses a plain "in" mark.
const LINKEDIN = 'M3.2 8.8h3.7V21H3.2zM5.05 2.9a2.15 2.15 0 1 1 0 4.3 2.15 2.15 0 0 1 0-4.3zM9.6 8.8h3.55v1.67h.05c.5-.94 1.7-1.93 3.5-1.93 3.75 0 4.45 2.47 4.45 5.68V21h-3.7v-5.9c0-1.4-.03-3.22-1.96-3.22-1.97 0-2.27 1.53-2.27 3.12V21H9.6z'
const LINK = 'M10.6 13.4a1 1 0 0 0 1.4 0l4-4a3 3 0 1 0-4.2-4.2l-1.3 1.3a1 1 0 0 0 1.4 1.4l1.3-1.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 0 0 1.4zm2.8-2.8a1 1 0 0 0-1.4 0l-4 4a3 3 0 1 0 4.2 4.2l1.3-1.3a1 1 0 1 0-1.4-1.4l-1.3 1.3a1 1 0 1 1-1.4-1.4l4-4a1 1 0 0 0 0-1.4z'

const ICONS = [
  [/facebook\.com|fb\.(com|me|watch)/i, /facebook/i, siFacebook.path],
  [/instagram\.com/i, /instagram/i, siInstagram.path],
  [/(^|\.)x\.com|twitter\.com/i, /^(x|twitter)$/i, siX.path],
  [/linkedin\.com/i, /linkedin/i, LINKEDIN],
  [/youtube\.com|youtu\.be/i, /youtube/i, siYoutube.path],
  [/tiktok\.com/i, /tiktok/i, siTiktok.path],
  [/wa\.me|whatsapp\.com/i, /whatsapp/i, siWhatsapp.path],
  [/threads\.(net|com)/i, /threads/i, siThreads.path],
  [/t\.me|telegram/i, /telegram/i, siTelegram.path],
]

function iconFor(link) {
  let host = ''
  try {
    host = new URL(link.url).hostname
  } catch {
    /* not a full address */
  }
  const hit = ICONS.find(([byHost, byLabel]) => byHost.test(host) || byLabel.test(String(link.label || '').trim()))
  return hit ? hit[2] : LINK
}

/** Social links as round icon buttons. The name is kept for screen readers and shows on hover. */
export default function SocialLinks({ links, className = '' }) {
  const list = (links || []).filter((l) => l.url)
  if (!list.length) return null
  return (
    <ul className={`social-icons ${className}`}>
      {list.map((l) => (
        <li key={l.url}>
          <a href={l.url} target="_blank" rel="noreferrer" aria-label={`${l.label || 'Social media'} (opens in a new tab)`} title={l.label}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={iconFor(l)} /></svg>
          </a>
        </li>
      ))}
    </ul>
  )
}
