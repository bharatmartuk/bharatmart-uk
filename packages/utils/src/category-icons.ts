export type CategoryIconKey =
  | 'utensils'
  | 'sparkles'
  | 'shirt'
  | 'wheat'
  | 'package'
  | 'leaf'
  | 'flower-2'
  | 'shopping-basket'
  | 'gem'
  | 'home'
  | 'store'

const SLUG_ICON_MAP: Record<string, CategoryIconKey> = {
  'homemade-foods': 'utensils',
  'homemade-pickles': 'utensils',
  'homemade-snacks': 'utensils',
  'festive-collections': 'sparkles',
  'indian-clothing': 'shirt',
  'indian-food': 'wheat',
  rice: 'wheat',
  'seasonal-stuff': 'package',
  ayurveda: 'flower-2',
  'organic-store': 'leaf',
}

const KEYWORD_RULES: Array<[RegExp, CategoryIconKey]> = [
  [/food|pickle|snack|kitchen|spice|masala|curry|meal/, 'utensils'],
  [/festive|diwali|holi|celebration|festival|light|decor/, 'sparkles'],
  [/cloth|saree|fashion|wear|kurta|dress/, 'shirt'],
  [/rice|grain|basmati|wheat|flour|dal/, 'wheat'],
  [/organic|green|natural|eco/, 'leaf'],
  [/ayur|herb|wellness|health|medicine/, 'flower-2'],
  [/season|winter|summer|monsoon|holiday/, 'package'],
  [/jewel|gem|gold|silver/, 'gem'],
  [/home|house/, 'home'],
  [/shop|store|bazaar|mart|market/, 'shopping-basket'],
]

const FALLBACK_ICONS: CategoryIconKey[] = [
  'package',
  'shopping-basket',
  'gem',
  'home',
  'sparkles',
  'store',
]

export function resolveCategoryIconKey(slug: string, name = ''): CategoryIconKey {
  const normalizedSlug = slug.toLowerCase().trim()
  const mapped = SLUG_ICON_MAP[normalizedSlug]
  if (mapped) return mapped

  const text = `${normalizedSlug} ${name}`.toLowerCase()
  for (const [pattern, key] of KEYWORD_RULES) {
    if (pattern.test(text)) return key
  }

  const hash = [...normalizedSlug].reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return FALLBACK_ICONS[hash % FALLBACK_ICONS.length] ?? 'package'
}
