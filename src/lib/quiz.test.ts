import { describe, expect, it } from 'vitest'
import type { Country } from '../data/countries'
import { buildQuestion, rankDistractors } from './quiz'

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

describe('buildQuestion', () => {
  it('only draws distractors from the given candidate pool, e.g. for a region-focused session', () => {
    const answer = makeCountry({ code: 'ng', layout: 'horizontal-stripes', continent: 'Africa' })
    const africanPool = [
      answer,
      makeCountry({ code: 'ml', layout: 'vertical-stripes', continent: 'Africa' }),
      makeCountry({ code: 'gh', layout: 'other', continent: 'Africa' }),
      makeCountry({ code: 'ke', layout: 'other', continent: 'Africa' }),
    ]
    // A flag with a matching layout would normally rank above every African
    // candidate here, but it must never appear since it's outside the pool.
    const outsidePool = makeCountry({
      code: 'ye',
      layout: 'horizontal-stripes',
      continent: 'Asia',
    })

    const question = buildQuestion(answer, africanPool)

    expect(question.options).toHaveLength(4)
    expect(question.options.every((c) => c.continent === 'Africa')).toBe(true)
    expect(question.options.map((c) => c.code)).not.toContain(outsidePool.code)
  })

  it('defaults to the full country list when no pool is given', () => {
    const answer = makeCountry({ code: 'de', layout: 'horizontal-stripes', continent: 'Europe' })
    const question = buildQuestion(answer)

    expect(question.options).toHaveLength(4)
    expect(question.options.map((c) => c.code)).toContain('de')
  })
})
