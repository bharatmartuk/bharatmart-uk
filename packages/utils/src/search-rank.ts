/**
 * Lightweight fuzzy + regex ranking for marketplace search.
 * Higher score = better match. Returns 0 when there is no usable match.
 */
export function fuzzyScore(query: string, ...fields: Array<string | null | undefined>): number {
  const q = query.trim().toLowerCase()
  if (!q) return 0

  const haystack = fields
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  if (!haystack) return 0

  let score = 0

  for (const field of fields) {
    if (!field) continue
    const value = field.toLowerCase()
    if (value === q) score += 120
    else if (value.startsWith(q)) score += 80
    else if (value.includes(q)) score += 50
  }

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  try {
    const wordRe = new RegExp(`\\b${escaped}`, 'i')
    if (wordRe.test(haystack)) score += 40

    const tokens = q.split(/\s+/).filter(Boolean)
    for (const token of tokens) {
      const tokenEsc = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const tokenRe = new RegExp(tokenEsc, 'i')
      if (tokenRe.test(haystack)) score += 15
    }
  } catch {
    // ignore invalid regex edge cases
  }

  let qi = 0
  let gaps = 0
  for (let i = 0; i < haystack.length && qi < q.length; i++) {
    if (haystack[i] === q[qi]) {
      qi += 1
    } else if (qi > 0) {
      gaps += 1
    }
  }
  if (qi === q.length) {
    score += Math.max(10, 35 - gaps)
  }

  return score
}

export function rankByFuzzy<T>(
  items: T[],
  query: string,
  getFields: (item: T) => Array<string | null | undefined>,
  limit = 8,
): T[] {
  const q = query.trim()
  if (!q) return items.slice(0, limit)

  return items
    .map((item) => ({ item, score: fuzzyScore(q, ...getFields(item)) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item)
}
