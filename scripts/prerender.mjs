/*
 * Runs after `vite build` (see package.json). For every public page it writes an HTML file with that page's
 * title, description, share image and structured data already in place, plus sitemap.xml and robots.txt.
 * Search engines and link previews (WhatsApp, Facebook, X) then see the right information without running JavaScript.
 * Pages come from the built-in content; items added only in the dashboard are covered in the browser by lib/useSeo.js.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defaults } from '../src/data/content.js'
import { absolute, allPaths, headTags, pageMeta, siteUrl } from '../src/lib/seo.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const manifestPath = join(dist, '.vite', 'manifest.json')
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {}

// Built-in photos for a project or event, as published addresses (01.jpg first).
const photosFor = (type, item) =>
  Object.keys(manifest)
    .filter((k) => k.startsWith(`src/assets/${type}/${item.builtinKey || item.id}/`))
    .sort()
    .map((k) => `/${manifest[k].file}`)
const imageFor = (type, item) => photosFor(type, item)[0] || ''

const template = readFileSync(join(dist, 'index.html'), 'utf8')
if (!template.includes('<!--seo')) throw new Error('index.html is missing the <!--seo--> block')
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const content = { ...defaults }
const paths = allPaths(content)
const seenTitles = new Map()
const seenDescriptions = new Map()
const warnings = []

for (const path of paths) {
  const meta = pageMeta(path, content, imageFor)
  // A plain version of the page heading, shown for a moment before the app takes over (and read by crawlers).
  const fallback = `<section class="wrap page-head"><h1>${esc(meta.heading || meta.title)}</h1><p class="lead">${esc(meta.description)}</p></section>`
  const html = template
    .replace(/<!--seo[\s\S]*?<!--\/seo-->/, `<!--seo-->\n    ${headTags(meta)}\n    <!--/seo-->`)
    .replace('<div id="root"></div>', `<div id="root">${fallback}</div>`)
  const file = path === '/' ? join(dist, 'index.html') : join(dist, `${path.slice(1)}.html`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)

  if (meta.title.length > 70) warnings.push(`Long title (${meta.title.length}): ${path}`)
  if (meta.description.length < 70) warnings.push(`Short description (${meta.description.length}): ${path}`)
  for (const [map, value, label] of [[seenTitles, meta.title, 'title'], [seenDescriptions, meta.description, 'description']]) {
    if (map.has(value)) warnings.push(`Same ${label} as ${map.get(value)}: ${path}`)
    else map.set(value, path)
  }
}

// sitemap.xml and robots.txt need the live address.
const robots = ['User-agent: *', 'Allow: /', 'Disallow: /admin']
if (siteUrl()) {
  const urls = paths.map((path) => {
    const detail = path.match(/^\/(projects|events)\/(.+)$/)
    const item = detail && content[detail[1]].find((x) => x.id === detail[2])
    const images = item ? photosFor(detail[1], item) : path === '/' ? ['/og-default.jpg'] : []
    const imgs = images.map((src) => `\n    <image:image><image:loc>${esc(absolute(src))}</image:loc></image:image>`).join('')
    return `  <url>\n    <loc>${esc(absolute(path))}</loc>${imgs}\n  </url>`
  })
  writeFileSync(
    join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`,
  )
  robots.push('', `Sitemap: ${absolute('/sitemap.xml')}`)
} else {
  warnings.push('siteUrl is empty in site.config.js: no sitemap.xml, canonical links or full share-image addresses until it is set.')
}
writeFileSync(join(dist, 'robots.txt'), `${robots.join('\n')}\n`)

// The manifest was only needed here; do not publish it.
rmSync(join(dist, '.vite'), { recursive: true, force: true })

console.log(`SEO: ${paths.length} pages prerendered${siteUrl() ? ', sitemap.xml written' : ''}.`)
for (const w of warnings) console.log(`  · ${w}`)
