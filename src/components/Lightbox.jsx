import { useEffect, useRef } from 'react'

export default function Lightbox({ items, index, onClose, onMove }) {
  const closeRef = useRef(null)
  const item = items[index]

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onMove(1)
      if (e.key === 'ArrowLeft') onMove(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onMove])

  if (!item) return null
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={item.title || 'Gallery viewer'} onClick={onClose}>
      <button ref={closeRef} type="button" className="lb-close" onClick={onClose} aria-label="Close viewer">
        ×
      </button>
      {items.length > 1 && (
        <>
          <button type="button" className="lb-nav lb-prev" onClick={(e) => { e.stopPropagation(); onMove(-1) }} aria-label="Previous">‹</button>
          <button type="button" className="lb-nav lb-next" onClick={(e) => { e.stopPropagation(); onMove(1) }} aria-label="Next">›</button>
        </>
      )}
      <figure className="lb-body" onClick={(e) => e.stopPropagation()}>
        {item.embed ? (
          <iframe src={item.embed} title={item.title || 'Video'} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        ) : (
          <img src={item.src} alt={item.title || 'Gallery photo'} />
        )}
        {(item.title || item.caption) && <figcaption>{item.title}{item.caption ? ` · ${item.caption}` : ''}</figcaption>}
      </figure>
    </div>
  )
}
