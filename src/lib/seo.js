/*
 * Search and sharing information for every page: title, description, share image and structured data.
 * Used in two places, so they always agree:
 *   - in the browser (lib/useSeo.js), which also covers anything added later in the dashboard
 *   - at build time (scripts/prerender.mjs), which writes a ready HTML file per page plus sitemap.xml,
 *     because WhatsApp, Facebook and X do not run JavaScript when they build a link preview.
 * Plain JavaScript only (no Vite features), so Node can run it.
 */
import { siteConfig } from '../../site.config.js'

export const SITE_NAME = 'Hon. Gabriel Gathuka Kagombe'
const SHORT = 'Hon. Kagombe, MP Gatundu South'
export const DEFAULT_IMAGE = '/og-default.jpg'
const DEFAULT_DESC =
  'Official website of Hon. Gabriel Gathuka Kagombe, Member of Parliament for Gatundu South, Kiambu County: profile, parliamentary record, NG-CDF projects, events, news and contact.'

export const siteUrl = () => String(siteConfig.siteUrl || '').replace(/\/+$/, '')

/** Absolute address for a path, when the site address is known. */
export function absolute(path = '/') {
  if (!path || /^(https?:|data:)/.test(path)) return path
  return siteUrl() + (path.startsWith('/') ? path : `/${path}`)
}

/** Trim to a search-result-sized sentence, cutting at a word. */
export function clip(text, max = 158) {
  const t = String(text || '').replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.]$/, '')}…`
}

const list = (items, n) => {
  const xs = items.filter(Boolean).slice(0, n)
  return xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : xs[0] || ''
}

function person(content, image) {
  const { profile = {}, contact = {} } = content
  const links = [...(contact.social || []), ...(contact.links || [])].map((l) => l.url).filter((u) => /^https?:/.test(u || ''))
  return {
    '@type': 'Person',
    '@id': absolute('/#person'),
    name: 'Gabriel Gathuka Kagombe',
    honorificPrefix: 'Hon.',
    alternateName: ['GG Kagombe', 'Gabriel Kagombe', profile.officialName].filter(Boolean),
    jobTitle: profile.title || 'Member of Parliament for Gatundu South',
    description: clip(profile.intro || DEFAULT_DESC, 300),
    memberOf: { '@type': 'GovernmentOrganization', name: 'National Assembly of Kenya', url: 'https://www.parliament.go.ke' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Nairobi' },
    nationality: { '@type': 'Country', name: 'Kenya' },
    workLocation: { '@type': 'Place', name: 'Gatundu South Constituency, Kiambu County, Kenya' },
    url: absolute('/'),
    image: absolute(image || DEFAULT_IMAGE),
    sameAs: [...new Set(links)],
  }
}

const crumbs = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(path) })),
})

const STATIC = {
  '/about': (c) => ({
    title: `About | ${SHORT}`,
    heading: 'About Hon. Gabriel Gathuka Kagombe',
    description: clip(c.profile?.bio?.[0] || DEFAULT_DESC),
  }),
  '/parliament': (c) => ({
    title: `Parliamentary record | ${SHORT}`,
    heading: 'Record in the National Assembly',
    description: clip(
      `Hon. Gabriel Kagombe in the ${c.profile?.parliament || '13th Parliament'}: ${list((c.parliament?.committees || []).map((x) => `${x.name} Committee`), 3)}, Bills, votes, motions and questions to Cabinet Secretaries.`,
    ),
  }),
  '/positions': (c) => ({
    title: `Positions and roles | ${SHORT}`,
    heading: 'Positions and roles',
    description: clip(`Offices and roles held by Hon. Gabriel Kagombe: ${list((c.positions || []).map((p) => p.organisation && p.title ? `${p.title.replace(/^Member, /, '')}${p.organisation.includes('National Assembly') ? '' : `, ${p.organisation}`}` : p.title), 4)}.`),
  }),
  '/projects': (c) => ({
    title: `Projects in Gatundu South | ${SHORT}`,
    heading: 'Projects in Gatundu South',
    description: clip(
      `${(c.projects || []).length} NG-CDF and government projects in Gatundu South: school classrooms, toilets and laboratories, roads, water, housing, bursaries and skills training.`,
    ),
  }),
  '/events': () => ({
    title: `Events | ${SHORT}`,
    heading: 'Events',
    description: 'Launches, conferences, community gatherings and official visits with Hon. Gabriel Kagombe, MP for Gatundu South, with photos from each.',
  }),
  '/news': () => ({
    title: `News and press | ${SHORT}`,
    heading: 'Hon. Kagombe in the news',
    description: 'Press coverage of Hon. Gabriel Kagombe, Member of Parliament for Gatundu South, with links to the original articles.',
  }),
  '/gallery': () => ({
    title: `Photo gallery | ${SHORT}`,
    heading: 'Photos and video from the work',
    description: 'Photos and video of NG-CDF projects, events and the work of Hon. Gabriel Kagombe in Gatundu South and the National Assembly.',
  }),
  '/contact': () => ({
    title: `Contact the office | ${SHORT}`,
    heading: 'Contact the office',
    description: 'Contact the office of Hon. Gabriel Kagombe, MP for Gatundu South: constituency office, Parliament Buildings and social media.',
  }),
}

/**
 * Everything search engines and link previews need for one page.
 * imageFor(type, item) returns the first photo of a project or event ('' if none).
 */
export function pageMeta(pathname, content, imageFor = () => '') {
  const path = (pathname || '/').replace(/\/+$/, '') || '/'
  const portrait = content.profile?.heroPhoto || content.profile?.photo || ''
  const base = { path, image: DEFAULT_IMAGE, type: 'website', noindex: false, jsonld: [] }

  if (path === '/') {
    return {
      ...base,
      title: `${SITE_NAME} | MP for Gatundu South`,
      heading: SITE_NAME,
      description: DEFAULT_DESC,
      jsonld: [
        { '@type': 'WebSite', '@id': absolute('/#website'), url: absolute('/'), name: SITE_NAME, inLanguage: 'en-KE', about: { '@id': absolute('/#person') } },
        person(content, portrait.startsWith('data:') ? '' : portrait),
      ],
    }
  }
  if (STATIC[path]) {
    const m = STATIC[path](content)
    const extra = path === '/about' ? [person(content, portrait.startsWith('data:') ? '' : portrait)] : []
    return { ...base, ...m, jsonld: [...extra, crumbs([['Home', '/'], [m.heading, path]])] }
  }

  const detail = path.match(/^\/(projects|events)\/([^/]+)$/)
  if (detail) {
    const [, type, id] = detail
    const item = (content[type] || []).find((x) => x.id === id)
    if (item) {
      const image = imageFor(type, item) || DEFAULT_IMAGE
      const listName = type === 'projects' ? 'Projects' : 'Events'
      const description = clip(item.description || item.summary || '') || DEFAULT_DESC
      const jsonld = [crumbs([['Home', '/'], [listName, `/${type}`], [item.title, path]])]
      if (type === 'events' && item.date) {
        jsonld.push({
          '@type': 'Event',
          name: item.title,
          startDate: item.date,
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          location: { '@type': 'Place', name: item.venue || 'Kenya', address: { '@type': 'PostalAddress', addressCountry: 'KE' } },
          image: [absolute(image)],
          description,
          performer: { '@id': absolute('/#person') },
        })
      }
      return {
        ...base,
        type: 'article',
        title: `${item.seoTitle || item.title} | Hon. Kagombe`,
        heading: item.title,
        description,
        image,
        jsonld,
      }
    }
  }

  return { ...base, title: `Page not found | ${SHORT}`, heading: 'Page not found', description: DEFAULT_DESC, noindex: true }
}

/** Every public address, for the sitemap and the prerendered files. */
export function allPaths(content) {
  return [
    '/',
    ...Object.keys(STATIC),
    ...(content.projects || []).map((p) => `/projects/${p.id}`),
    ...(content.events || []).map((e) => `/events/${e.id}`),
  ]
}

/** The <head> tags for a page, as HTML (build time) — the browser version sets the same tags directly. */
export function headTags(meta) {
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const url = siteUrl() ? absolute(meta.path) : ''
  const image = absolute(meta.image)
  const v = siteConfig.seo || {}
  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    meta.noindex ? '<meta name="robots" content="noindex" />' : '<meta name="robots" content="index, follow, max-image-preview:large" />',
    url && `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:locale" content="en_KE" />`,
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    url && `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    v.googleSiteVerification && `<meta name="google-site-verification" content="${esc(v.googleSiteVerification)}" />`,
    v.bingSiteVerification && `<meta name="msvalidate.01" content="${esc(v.bingSiteVerification)}" />`,
    meta.jsonld.length && `<script type="application/ld+json" id="seo-jsonld">${JSON.stringify({ '@context': 'https://schema.org', '@graph': meta.jsonld }).replace(/</g, '\\u003c')}</script>`,
  ]
  return tags.filter(Boolean).join('\n    ')
}
