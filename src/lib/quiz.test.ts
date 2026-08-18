import { describe, expect, it } from 'vitest'
import type { Country } from '../data/countries'
import { rankDistractors } from './quiz'

function makeCountry(overrides: Partial<Country> & { code: string }): Country {
  return {
    name: overrides.code,
    continent: 'Europe',
    colorCount: 3,
    layout: 'other',
    areaKm2: 100,
    ...overrides,
  }
}

describe('rankDistractors', () => {
  it('ranks a same-layout-and-continent candidate above a same-layout-only one', () => {
    const answer = makeCountry({ code: 'de', layout: 'horizontal-stripes', continent: 'Europe' })
    const sameLayoutSameContinent = makeCountry({
      code: 'nl',
      layout: 'horizontal-stripes',
      continent: 'Europe',
    })
    const sameLayoutOnly = makeCountry({
      code: 'ye',
      layout: 'horizontal-stripes',
      continent: 'Asia',
    })
    const unrelated = makeCountry({ code: 'jp', layout: 'central-emblem', continent: 'Asia' })

    const ranked = rankDistractors(answer, [unrelated, sameLayoutOnly, sameLayoutSameContinent])

    expect(ranked[0].code).toBe('nl')
    expect(ranked[1].code).toBe('ye')
    expect(ranked[2].code).toBe('jp')
  })

  it('ranks a same-continent-only candidate above an unrelated one', () => {
    const answer = makeCountry({ code: 'de', layout: 'horizontal-stripes', continent: 'Europe' })
    const sameContinentOnly = makeCountry({
      code: 'fr',
      layout: 'vertical-stripes',
      continent: 'Europe',
    })
    const unrelated = makeCountry({ code: 'jp', layout: 'central-emblem', continent: 'Asia' })

    const ranked = rankDistractors(answer, [unrelated, sameContinentOnly])

    expect(ranked[0].code).toBe('fr')
    expect(ranked[1].code).toBe('jp')
  })

  it('returns every candidate even when none share any traits', () => {
    const answer = makeCountry({ code: 'de', layout: 'horizontal-stripes', continent: 'Europe' })
    const pool = [
      makeCountry({ code: 'jp', layout: 'central-emblem', continent: 'Asia' }),
      makeCountry({ code: 'au', layout: 'canton', continent: 'Oceania' }),
    ]

    expect(rankDistractors(answer, pool)).toHaveLength(2)
  })
})
