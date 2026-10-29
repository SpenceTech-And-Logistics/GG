import { createElement, useEffect, useState } from 'react'
import { useInView } from '../lib/hooks.js'

/** Fades and slides its children in once they scroll into view. */
export function Reveal({ as = 'div', variant = 'up', delay = 0, className = '', style, children, ...rest }) {
  const [ref, seen] = useInView()
  return createElement(
    as,
    { ref, className: `rv ${variant} ${seen ? 'in' : ''} ${className}`.trim(), style: { '--d': `${delay}ms`, ...style }, ...rest },
    children,
  )
}

/** Counts up to a number the first time it is seen. */
export function CountUp({ to, duration = 1600 }) {
  const [ref, seen] = useInView()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!seen) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    if (reduce) {
      raf = requestAnimationFrame(() => setN(to))
      return () => cancelAnimationFrame(raf)
    }
    let start
    const tick = (t) => {
      start ??= t
      const p = Math.min(1, (t - start) / duration)
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, to, duration])
  return <span ref={ref}>{Number(n).toLocaleString('en-KE')}</span>
}
