import { describe, expect, it } from 'vitest'
import type { Country } from '../data/countries'
import { summarizeSession, type SessionAnswer } from './session'

function makeCountry(overrides: Partial<Country> & { code: string }): Country {
  return {
    id: `country:${overrides.code}`,
    category: 'country',
    name: overrides.code,
    continent: 'Europe',
    colorCount: 3,
    layout: 'other',
    areaKm2: 100,
    ...overrides,
  }
}

const countries = [
  makeCountry({ code: 'de', continent: 'Europe', layout: 'horizontal-stripes' }),
  makeCountry({ code: 'fr', continent: 'Europe', layout: 'vertical-stripes' }),
  makeCountry({ code: 'nl', continent: 'Europe', layout: 'horizontal-stripes' }),
  makeCountry({ code: 'jp', continent: 'Asia', layout: 'central-emblem' }),
  makeCountry({ code: 'cn', continent: 'Asia', layout: 'central-emblem' }),
]

function answer(code: string, isCorrect: boolean): SessionAnswer {
  return { id: `country:${code}`, isCorrect }
}

describe('summarizeSession', () => {
  it('returns zeroed stats and no extremes for an empty session', () => {
    const summary = summarizeSession([], countries)
    expect(summary.total).toBe(0)
    expect(summary.accuracy).toBe(0)
    expect(summary.strongest).toBeNull()
    expect(summary.weakest).toBeNull()
  })

  it('computes overall accuracy', () => {
    const answers = [answer('de', true), answer('fr', true), answer('jp', false)]
    const summary = summarizeSession(answers, countries)
    expect(summary.total).toBe(3)
    expect(summary.correct).toBe(2)
    expect(summary.accuracy).toBeCloseTo(2 / 3)
  })

  it('identifies the strongest and weakest continent', () => {
    const answers = [
      answer('de', true),
      answer('fr', true),
      answer('nl', true), // Europe: 3/3
      answer('jp', false),
      answer('cn', false), // Asia: 0/2
    ]
    const summary = summarizeSession(answers, countries)
    expect(summary.strongest).toMatchObject({ dimension: 'continent', key: 'Europe', accuracy: 1 })
    expect(summary.weakest).toMatchObject({ dimension: 'continent', key: 'Asia', accuracy: 0 })
  })

  it('also breaks down by layout', () => {
    const answers = [answer('de', true), answer('nl', true), answer('fr', false)]
    const summary = summarizeSession(answers, countries)
    const horizontal = summary.byLayout.find((g) => g.key === 'horizontal-stripes')
    const vertical = summary.byLayout.find((g) => g.key === 'vertical-stripes')
    expect(horizontal).toMatchObject({ correct: 2, total: 2, accuracy: 1 })
    expect(vertical).toMatchObject({ correct: 0, total: 1, accuracy: 0 })
  })

  it('ignores groups below the minimum sample size for strongest/weakest', () => {
    // Only one Europe answer (100%) and one Asia answer (0%) — too few to
    // call out as a pattern.
    const answers = [answer('de', true), answer('jp', false)]
    const summary = summarizeSession(answers, countries)
    expect(summary.strongest).toBeNull()
    expect(summary.weakest).toBeNull()
  })

  it('does not contradict itself when only one group has enough samples', () => {
    // Europe has 2 samples (100%); Asia only has 1 (excluded). Weakest
    // should not also resolve to Europe.
    const answers = [answer('de', true), answer('fr', true), answer('jp', false)]
    const summary = summarizeSession(answers, countries)
    expect(summary.strongest).toMatchObject({ dimension: 'continent', key: 'Europe' })
    expect(summary.weakest).toBeNull()
  })
})
