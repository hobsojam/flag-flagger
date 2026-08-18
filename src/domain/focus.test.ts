import { describe, expect, it } from 'vitest'
import type { Country } from '../data/countries'
import { filterByFocus, formatSlugLabel } from './focus'

function makeCountry(overrides: Partial<Country> & { code: string }): Country {
  return {
    id: `country:${overrides.code}`,
    category: 'country',
    name: overrides.code,
    continent: 'Europe',
    colorCount: 3,
    layout: 'other',
    areaKm2: 100,
    flagRatioW: 3,
    flagRatioH: 2,
    ...overrides,
  }
}

const countries = [
  makeCountry({ code: 'de', continent: 'Europe', layout: 'horizontal-stripes', tags: ['star'] }),
  makeCountry({ code: 'mx', continent: 'North America', layout: 'vertical-stripes', tags: ['emblem', 'animal'] }),
  makeCountry({ code: 'cy', continent: 'Europe', layout: 'other', tags: ['map-silhouette'] }),
  makeCountry({ code: 'fr', continent: 'Europe', layout: 'vertical-stripes' }),
]

describe('filterByFocus', () => {
  it('returns every country when focus is null', () => {
    expect(filterByFocus(countries, null)).toHaveLength(4)
  })

  it('filters by continent', () => {
    const result = filterByFocus(countries, { type: 'continent', value: 'Europe' })
    expect(result.map((c) => c.code)).toEqual(['de', 'cy', 'fr'])
  })

  it('filters by layout', () => {
    const result = filterByFocus(countries, { type: 'layout', value: 'vertical-stripes' })
    expect(result.map((c) => c.code)).toEqual(['mx', 'fr'])
  })

  it('filters by tag, excluding untagged countries', () => {
    const result = filterByFocus(countries, { type: 'tag', value: 'emblem' })
    expect(result.map((c) => c.code)).toEqual(['mx'])
  })

  it('matches a country with multiple tags on any one of them', () => {
    const result = filterByFocus(countries, { type: 'tag', value: 'animal' })
    expect(result.map((c) => c.code)).toEqual(['mx'])
  })
})

describe('formatSlugLabel', () => {
  it('replaces hyphens with spaces', () => {
    expect(formatSlugLabel('central-emblem')).toBe('central emblem')
    expect(formatSlugLabel('map-silhouette')).toBe('map silhouette')
  })

  it('leaves non-hyphenated values unchanged', () => {
    expect(formatSlugLabel('star')).toBe('star')
    expect(formatSlugLabel('North America')).toBe('North America')
  })
})
