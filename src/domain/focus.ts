import type { Continent, Country, FlagLayout, FlagTag } from '../data/countries'

export type Focus =
  | { type: 'continent'; value: Continent }
  | { type: 'layout'; value: FlagLayout }
  | { type: 'tag'; value: FlagTag }
  | null

export const CONTINENTS: Continent[] = [
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'Oceania',
  'South America',
]

export const LAYOUTS: FlagLayout[] = [
  'horizontal-stripes',
  'vertical-stripes',
  'diagonal',
  'cross',
  'canton',
  'central-emblem',
  'other',
]

// What's depicted on a flag, independent of its layout/geometry -- e.g. a
// flag can be 'central-emblem' layout and also tagged 'animal' if that
// emblem is a creature. Most flags have no tags at all (plain stripes/bands
// with no distinguishing content), so this is a much sparser filter than
// continent or layout.
export const TAGS: FlagTag[] = [
  'emblem',
  'crescent',
  'star',
  'sun',
  'animal',
  'plant',
  'weapon',
  'text',
  'map-silhouette',
]

// Shared by layout ('central-emblem') and tag ('map-silhouette') values,
// the only two families with hyphenated slugs.
export function formatSlugLabel(value: string): string {
  return value.replace(/-/g, ' ')
}

export function filterByFocus(countries: Country[], focus: Focus): Country[] {
  if (!focus) return countries
  if (focus.type === 'continent') return countries.filter((c) => c.continent === focus.value)
  if (focus.type === 'layout') return countries.filter((c) => c.layout === focus.value)
  return countries.filter((c) => c.tags?.includes(focus.value))
}
