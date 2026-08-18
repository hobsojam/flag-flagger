import { describe, expect, it } from 'vitest'
import type { Country } from '../data/countries'
import { updateRecord, type ProgressMap } from './progress'
import { selectNextFlag, selectWeakFlag } from './scheduler'

function makeCountry(code: string, name = code): Country {
  return {
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
    expect(countries.map((c) => c.code)).toContain(picked.code)
  })

  it('excludes recently shown flags when other options exist', () => {
    for (let i = 0; i < 50; i++) {
      const picked = selectNextFlag(countries, {}, ['de', 'fr'], 0)
      expect(picked.code).toBe('it')
    }
  })

  it('falls back to the full list when everything was recently shown', () => {
    const allRecent = countries.map((c) => c.code)
    const picked = selectNextFlag(countries, {}, allRecent, 0)
    expect(countries.map((c) => c.code)).toContain(picked.code)
  })

  it('biases selection toward the lowest-confidence flag', () => {
    const progress: ProgressMap = {}
    // "de" is well known; "fr" and "it" have never been seen.
    let known = updateRecord({ code: 'de', confidence: 0, lastSeenAt: 0, seen: 0, correct: 0 }, true, 0)
    for (let i = 0; i < 5; i++) known = updateRecord(known, true, 0)
    progress.de = known

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

function knownRecord(code: string) {
  let record = updateRecord({ code, confidence: 0, lastSeenAt: 0, seen: 0, correct: 0 }, true, 0)
  for (let i = 0; i < 5; i++) record = updateRecord(record, true, 0)
  return record
}

describe('selectWeakFlag', () => {
  it('never picks a well-known flag when enough weak flags exist', () => {
    const many = Array.from({ length: 25 }, (_, i) => makeCountry(`c${i}`))
    const progress: ProgressMap = {}
    // First 5 are well known; the remaining 20 are unseen.
    for (let i = 0; i < 5; i++) progress[`c${i}`] = knownRecord(`c${i}`)

    for (let i = 0; i < 200; i++) {
      const picked = selectWeakFlag(many, progress, [], 0)
      expect(Number(picked.code.slice(1))).toBeGreaterThanOrEqual(5)
    }
  })

  it('pads the pool up to a minimum size when few flags are below the threshold', () => {
    const many = Array.from({ length: 25 }, (_, i) => makeCountry(`c${i}`))
    const progress: ProgressMap = {}
    // Only 3 flags are weak; the other 22 are well known.
    for (let i = 3; i < 25; i++) progress[`c${i}`] = knownRecord(`c${i}`)

    // The pool should pad out to 20 flags (the lowest-confidence 20 overall),
    // so the 5 highest-confidence flags (indices 20-24) should never appear.
    for (let i = 0; i < 200; i++) {
      const picked = selectWeakFlag(many, progress, [], 0)
      expect(Number(picked.code.slice(1))).toBeLessThan(20)
    }
  })

  it('excludes recently shown flags when other weak options exist', () => {
    const countries4 = [makeCountry('a'), makeCountry('b'), makeCountry('c'), makeCountry('d')]
    for (let i = 0; i < 50; i++) {
      const picked = selectWeakFlag(countries4, {}, ['a', 'b', 'c'], 0)
      expect(picked.code).toBe('d')
    }
  })

  it('falls back within the weak pool, never escaping to a well-known flag', () => {
    // Exactly WEAK_POOL_SIZE (20) weak flags, so the pool is precisely
    // those 20 with no padding from well-known ones.
    const many = Array.from({ length: 30 }, (_, i) => makeCountry(`c${i}`))
    const progress: ProgressMap = {}
    for (let i = 20; i < 30; i++) progress[`c${i}`] = knownRecord(`c${i}`)
    const weakCodes = Array.from({ length: 20 }, (_, i) => `c${i}`)

    // All weak flags were "just shown" — should still return one of them,
    // not spill into the well-known 10.
    const picked = selectWeakFlag(many, progress, weakCodes, 0)
    expect(weakCodes).toContain(picked.code)
  })
})
