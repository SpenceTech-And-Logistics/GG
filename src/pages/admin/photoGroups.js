/**
 * Sorting photos by file name: "KMTC (3).jpg", "Kibiru pri school 2.jpg" and "events/KMTC/IMG_0042.jpg"
 * all become a group ("KMTC", "Kibiru pri school"), then each group is matched to an event or project.
 */

export const IMAGE = /\.(jpe?g|png|webp|gif|avif)$/i
export const RAW = /\.(cr2|cr3|nef|arw|dng|raf|orf|rw2|heic|heif)$/i

/** The group a photo belongs to: its file name without the number, or its folder when the name is just a camera number. */
export function groupKey(path) {
  const parts = String(path).split(/[\\/]/).filter(Boolean)
  const name = parts.pop() || ''
  const stem = name.replace(/\.[^.]+$/, '')
  const key = stem.replace(/[\s_-]*\(?\d+\)?$/, '').replace(/\s+/g, ' ').trim()
  const generic = !key || /^\d[\d\s_-]*$/.test(key) || /^(img|dsc|dscn|dsc_|dji|pxl|photo|image|whatsapp image|screenshot)\b/i.test(key)
  if (generic) return parts.length ? parts[parts.length - 1].replace(/\s+/g, ' ').trim() : key || 'Photos'
  return key
}

/** The number in "KMTC (3).jpg", for keeping photos in order. */
export const photoNumber = (path) => Number(String(path).match(/(\d+)\)?\.[^.]+$/)?.[1] || 0)

const ABBR = { pri: 'primary', pry: 'primary', prim: 'primary', sch: 'school', sec: 'secondary', secconstruction: 'secondary', center: 'centre', govt: 'government', inovation: 'innovation', kiridi: 'kirdi' }
const STOP = new Set(['of', 'the', 'and', 'at', 'a', 'an', 'to', 'for', 'in', 'on', 'ongoing', 'completed', 'proposed', 'before', 'after', 'new', 'construction', 'renovation', 'photos', 'pics'])

export function words(text) {
  return String(text || '')
    .replace(/([A-Z]{2,})([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .map((w) => ABBR[w] || w)
    .filter((w) => w.length > 1 && !STOP.has(w))
}

const norm = (s) => words(s).join(' ')
const keysOf = (item) => String(item.photoKey || '').split(';').map((k) => k.trim()).filter(Boolean)

/**
 * Best event or project for a group, or null. Rare words (a school's name) count for much more than
 * common ones ("primary", "school"), so "Kibiru pri school" does not land on "Kiganjo Primary School".
 */
export function bestMatch(key, candidates) {
  const exact = candidates.find((c) => keysOf(c).some((k) => norm(k) === norm(key)))
  if (exact) return { item: exact, score: 1, exact: true }
  const df = {}
  for (const c of candidates) for (const w of new Set(words(`${c.title} ${keysOf(c).join(' ')}`))) df[w] = (df[w] || 0) + 1
  const mine = [...new Set(words(key))]
  if (!mine.length) return null
  const weight = (w) => 1 / (df[w] || 1)
  const total = mine.reduce((n, w) => n + weight(w), 0)
  let best = null
  for (const c of candidates) {
    const theirs = new Set(words(`${c.title} ${keysOf(c).join(' ')}`))
    const score = mine.filter((w) => theirs.has(w)).reduce((n, w) => n + weight(w), 0) / total
    if (!best || score > best.score) best = { item: c, score }
  }
  return best && best.score >= 0.5 ? best : null
}

/** "GATHIRU PRY SCH" → "Gathiru Primary School", for new items made from a group. */
export function prettyTitle(key) {
  const expand = { pri: 'Primary', pry: 'Primary', prim: 'Primary', sch: 'School', sec: 'Secondary' }
  const split = String(key).replace(/([A-Z]{2,})([A-Z][a-z])/g, '$1 $2').replace(/([a-z])([A-Z])/g, '$1 $2').split(/\s+/).filter(Boolean)
  const upper = split.filter((w) => /[A-Z]/.test(w) && w === w.toUpperCase()).length
  const shouting = split.length > 1 && upper / split.length >= 0.6
  return split
    .map((w) => expand[w.toLowerCase()] || (shouting && w === w.toUpperCase() ? w[0] + w.slice(1).toLowerCase() : w))
    .join(' ')
}
