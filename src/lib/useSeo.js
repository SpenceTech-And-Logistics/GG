import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { coverOf } from './photos.js'
import { absolute, pageMeta, siteUrl } from './seo.js'
import { useContent } from './useContent.js'

function setTag(selector, create, attr, value) {
  let el = document.head.querySelector(selector)
  if (!value) return el?.remove()
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}
/** attr is 'name' or 'property' (Open Graph tags use property). */
function meta(attr, key, value) {
  const create = () => {
    const el = document.createElement('meta')
    el.setAttribute(attr, key)
    return el
  }
  setTag(`meta[${attr}="${key}"]`, create, 'content', value)
}

/** Keeps the page title, description, share tags and structured data in step with the page being viewed. */
export function useSeo() {
  const { pathname } = useLocation()
  const content = useContent()

  useEffect(() => {
    // Photos stored inside the database (data: addresses) cannot be shared as link previews; the default image is used instead.
    const imageFor = (type, item) => {
      const src = coverOf(type, item)
      return src && !src.startsWith('data:') ? src : ''
    }
    const m = pageMeta(pathname, content, imageFor)
    const url = siteUrl() ? absolute(m.path) : ''
    document.title = m.title
    meta('name', 'description', m.description)
    meta('name', 'robots', m.noindex ? 'noindex' : 'index, follow, max-image-preview:large')
    meta('property', 'og:type', m.type)
    meta('property', 'og:title', m.title)
    meta('property', 'og:description', m.description)
    meta('property', 'og:url', url)
    meta('property', 'og:image', absolute(m.image))
    meta('name', 'twitter:title', m.title)
    meta('name', 'twitter:description', m.description)
    meta('name', 'twitter:image', absolute(m.image))
    setTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', url)

    let ld = document.getElementById('seo-jsonld')
    if (!m.jsonld.length) ld?.remove()
    else {
      if (!ld) {
        ld = Object.assign(document.createElement('script'), { type: 'application/ld+json', id: 'seo-jsonld' })
        document.head.appendChild(ld)
      }
      ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': m.jsonld })
    }
  }, [pathname, content])
}
