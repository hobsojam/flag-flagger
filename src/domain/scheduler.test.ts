import { describe, expect, it } from 'vitest'
import type { Country } from '../data/countries'
import { updateRecord, type ProgressMap } from './progress'
import { selectNextFlag } from './scheduler'

function makeCountry(code: string, name = code): Country {
  return {
    id: `country:${code}`,
    category: 'country',
    code,
    name,
    continent: 'Europe',
    colorCount: 3,
    layout: 'other',
    areaKm2: 100,
  }
}

const countries = [makeCountry('de'), makeCountry('fr'), makeCountry('it')]

describe('selectNextFlag', () => {
  it('picks a country from the given list', () => {
    const picked = selectNextFlag(countries, {}, [], 0)
    expect(countries.map((c) => c.id)).toContain(picked.id)
  })

  it('excludes recently shown flags when other options exist', () => {
    for (let i = 0; i < 50; i++) {
      const picked = selectNextFlag(countries, {}, ['country:de', 'country:fr'], 0)
      expect(picked.id).toBe('country:it')
    }
  })

  it('falls back to the full list when everything was recently shown', () => {
    const allRecent = countries.map((c) => c.id)
    const picked = selectNextFlag(countries, {}, allRecent, 0)
    expect(countries.map((c) => c.id)).toContain(picked.id)
  })

  it('biases selection toward the lowest-confidence flag', () => {
    const progress: ProgressMap = {}
    // "de" is well known; "fr" and "it" have never been seen.
    let known = updateRecord(
      { id: 'country:de', confidence: 0, lastSeenAt: 0, seen: 0, correct: 0 },
      true,
      0,
    )
    for (let i = 0; i < 5; i++) known = updateRecord(known, true, 0)
    progress['country:de'] = known

    const counts = { de: 0, fr: 0, it: 0 }
    const trials = 500
    for (let i = 0; i < trials; i++) {
      const picked = selectNextFlag(countries, progress, [], 0)
      counts[picked.code as keyof typeof counts]++
    }

    // "de" is near max confidence, so it should be picked far less often
    // than either unseen flag.
    expect(counts.de).toBeLessThan(counts.fr)
    expect(counts.de).toBeLessThan(counts.it)
    expect(counts.de / trials).toBeLessThan(0.15)
  })
})
