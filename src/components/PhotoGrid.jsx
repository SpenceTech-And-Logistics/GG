import { useCallback, useState } from 'react'
import Lightbox from './Lightbox.jsx'
import { Reveal } from './Reveal.jsx'

export default function PhotoGrid({ photos, title }) {
  const [open, setOpen] = useState(-1)
  const move = useCallback((d) => setOpen((i) => (i < 0 ? i : (i + d + photos.length) % photos.length)), [photos.length])
  const close = useCallback(() => setOpen(-1), [])
  if (!photos.length) return null
  return (
    <>
      <div className="mosaic">
        {photos.map((p, i) => (
          <Reveal key={p.src} delay={(i % 3) * 90}>
            <button type="button" className="tileimg" onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1} of ${photos.length}`}>
              <img src={p.src} alt={`${title}, photo ${i + 1}`} loading={i < 3 ? 'eager' : 'lazy'} />
            </button>
          </Reveal>
        ))}
      </div>
      {open >= 0 && <Lightbox items={photos} index={open} onClose={close} onMove={move} />}
    </>
  )
}
