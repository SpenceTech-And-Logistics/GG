import { words } from './photoGroups.js'

/** Same title, ignoring case and spacing. */
export const sameKey = (text) => String(text || '').replace(/\s+/g, ' ').trim().toLowerCase()

/**
 * How alike two titles are: the share of the shorter title's words found in the other.
 * "Gathage–Kahuguini road" and "Gathage–Kahuguini–Kwa Magemio–Gwa Kimanga road" score 1;
 * "Classrooms at Gathiru Primary School" and "…Gatitu Primary School" score 0.75.
 */
export function likeness(a, b) {
  const A = new Set(words(a))
  const B = new Set(words(b))
  const small = Math.min(A.size, B.size)
  if (small < 2) return 0
  let shared = 0
  for (const w of A) if (B.has(w)) shared++
  return shared / small
}

export const SIMILAR = 0.8

/**
 * Groups of items that look like the same thing.
 * keyOf(item) gives the text compared (the title, or title + organisation for positions).
 * Returns [{ items, exact }] where exact means every item has exactly the same text.
 */
export function findDuplicates(items, keyOf = (x) => x.title, ignored = new Set()) {
  const list = (items || []).filter((it) => sameKey(keyOf(it)))
  const parent = list.map((_, i) => i)
  const root = (i) => (parent[i] === i ? i : (parent[i] = root(parent[i])))
  const pairKey = (a, b) => [a.id, b.id].sort().join('|')
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      if (ignored.has(pairKey(list[i], list[j]))) continue
      const a = keyOf(list[i])
      const b = keyOf(list[j])
      if (sameKey(a) === sameKey(b) || likeness(a, b) >= SIMILAR) parent[root(j)] = root(i)
    }
  }
  const groups = {}
  list.forEach((it, i) => (groups[root(i)] ||= []).push(it))
  return Object.values(groups)
    .filter((g) => g.length > 1)
    .map((g) => ({ items: g, exact: g.every((it) => sameKey(keyOf(it)) === sameKey(keyOf(g[0]))) }))
}

/** Items already in the list that match a title being saved (other than the item itself). */
export function matchesFor(title, items, selfId, keyOf = (x) => x.title) {
  if (!sameKey(title)) return []
  return (items || []).filter((it) => it.id !== selfId && (sameKey(keyOf(it)) === sameKey(title) || likeness(keyOf(it), title) >= SIMILAR))
}

/** Which copy to suggest keeping: the built-in one, then the one with more photos and detail, then the oldest. */
export function suggestKeep(group) {
  const score = (it) => (it.builtinKey ? 1000 : 0) + (it.photos || []).length * 10 + (it.cover ? 5 : 0) + String(it.description || it.summary || '').length / 1000
  return [...group].sort((a, b) => score(b) - score(a) || (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))[0]
}
