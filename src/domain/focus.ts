import type { Continent, Country, FlagLayout } from '../data/countries'

export type Focus =
  | { type: 'continent'; value: Continent }
  | { type: 'layout'; value: FlagLayout }
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

export function formatLayoutLabel(layout: FlagLayout): string {
  return layout.replace(/-/g, ' ')
}

export function filterByFocus(countries: Country[], focus: Focus): Country[] {
  if (!focus) return countries
  return countries.filter((c) =>
    focus.type === 'continent' ? c.continent === focus.value : c.layout === focus.value,
  )
}
