import { words } from './photoGroups.js'

/** Same title, ignoring case and spacing. */
export const sameKey = (text) => String(text || '').replace(/\s+/g, ' ').trim().toLowerCase()

/**
 * How alike two titles are: the share of the shorter title's words found in the other, with rare words
 * (names) weighted more than common ones. "Gathage–Kahuguini road" and the full road name score 1;
 * two schools' toilet blocks that differ only by the school's name score low.
 */
export function likeness(a, b, df = {}) {
  const A = new Set(words(a))
  const B = new Set(words(b))
  if (Math.min(A.size, B.size) < 2) return 0
  // Words found in many titles ("primary", "school", "toilets") count for little; names count for a lot.
  const weight = (w) => 1 / (df[w] || 1)
  const [small, big] = A.size <= B.size ? [A, B] : [B, A]
  let shared = 0
  let total = 0
  for (const w of small) {
    total += weight(w)
    if (big.has(w)) shared += weight(w)
  }
  return total ? shared / total : 0
}

/** How many titles each word appears in. */
export function wordCounts(texts) {
  const df = {}
  for (const t of texts) for (const w of new Set(words(t))) df[w] = (df[w] || 0) + 1
  return df
}

export const SIMILAR = 0.8

/**
 * Near-matches only count when nothing marks them as different things:
 * a different category (a road and a school at the same place), or a primary and a secondary school.
 */
function plausible(x, y, textX, textY) {
  if (x.category && y.category && sameKey(x.category) !== sameKey(y.category)) return false
  const level = (t) => (/\bprimary\b/i.test(t) ? 'primary' : /\bsecondary\b/i.test(t) ? 'secondary' : '')
  const lx = level(textX)
  const ly = level(textY)
  return !(lx && ly && lx !== ly)
}

/**
 * Groups of items that look like the same thing.
 * keyOf(item) gives the text compared (the title, or title + organisation for positions).
 * Returns [{ items, exact }] where exact means every item has exactly the same text.
 */
export function findDuplicates(items, keyOf = (x) => x.title, ignored = new Set()) {
  const list = (items || []).filter((it) => sameKey(keyOf(it)))
  const df = wordCounts(list.map(keyOf))
  const parent = list.map((_, i) => i)
  const root = (i) => (parent[i] === i ? i : (parent[i] = root(parent[i])))
  const pairKey = (a, b) => [a.id, b.id].sort().join('|')
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      if (ignored.has(pairKey(list[i], list[j]))) continue
      const a = keyOf(list[i])
      const b = keyOf(list[j])
      if (sameKey(a) === sameKey(b) || (plausible(list[i], list[j], a, b) && likeness(a, b, df) >= SIMILAR)) parent[root(j)] = root(i)
    }
  }
  const groups = {}
  list.forEach((it, i) => (groups[root(i)] ||= []).push(it))
  return Object.values(groups)
    .filter((g) => g.length > 1)
    .map((g) => ({ items: g, exact: g.every((it) => sameKey(keyOf(it)) === sameKey(keyOf(g[0]))) }))
}

/** Items already in the list that match a title being saved (other than the item itself). */
export function matchesFor(title, items, selfId, keyOf = (x) => x.title, draft = {}) {
  if (!sameKey(title)) return []
  const df = wordCounts([...(items || []).map(keyOf), title])
  return (items || []).filter(
    (it) => it.id !== selfId && (sameKey(keyOf(it)) === sameKey(title) || (plausible(it, draft, keyOf(it), title) && likeness(keyOf(it), title, df) >= SIMILAR)),
  )
}

/** Which copy to suggest keeping: the built-in one, then the one with more photos and detail, then the oldest. */
export function suggestKeep(group) {
  const score = (it) => (it.builtinKey ? 1000 : 0) + (it.photos || []).length * 10 + (it.cover ? 5 : 0) + String(it.description || it.summary || '').length / 1000
  return [...group].sort((a, b) => score(b) - score(a) || (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))[0]
}
