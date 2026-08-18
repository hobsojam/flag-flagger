import { describe, expect, it } from 'vitest'
import type { Country } from '../data/countries'
import { createRecord, updateRecord, type ProgressMap } from './progress'
import { buildProgressReport } from './report'

const NOW = 1_000_000_000_000

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

const pool = [
  makeCountry({ code: 'de', name: 'Germany', continent: 'Europe', layout: 'horizontal-stripes' }),
  makeCountry({ code: 'fr', name: 'France', continent: 'Europe', layout: 'vertical-stripes' }),
  makeCountry({ code: 'nl', name: 'Netherlands', continent: 'Europe', layout: 'horizontal-stripes' }),
  makeCountry({
    code: 'jp',
    name: 'Japan',
    continent: 'Asia',
    layout: 'central-emblem',
    tags: ['sun'],
  }),
  makeCountry({
    code: 'mx',
    name: 'Mexico',
    continent: 'North America',
    layout: 'vertical-stripes',
    tags: ['emblem', 'animal'],
  }),
]

// Answers a flag `n` times with a fixed correctness, building up a
// realistic ProgressRecord the way recordAnswer would in the app.
function practiced(progress: ProgressMap, id: string, results: boolean[]): ProgressMap {
  let record = progress[id] ?? createRecord(id)
  for (const isCorrect of results) {
    record = updateRecord(record, isCorrect, NOW)
  }
  return { ...progress, [id]: record }
}

describe('buildProgressReport', () => {
  it('reports everything unpracticed when progress is empty', () => {
    const report = buildProgressReport(pool, {}, NOW)
    expect(report.totalFlags).toBe(5)
    expect(report.practicedFlags).toBe(0)
    expect(report.totalAnswers).toBe(0)
    expect(report.overallAccuracy).toBe(0)
    expect(report.overallConfidence).toBe(0)
    expect(report.strongestFlags).toEqual([])
    expect(report.weakestFlags).toEqual([])
    expect(report.neverPracticed.map((f) => f.name)).toEqual([
      'France',
      'Germany',
      'Japan',
      'Mexico',
      'Netherlands',
    ])
  })

  it('computes overall totals across every practiced flag', () => {
    let progress: ProgressMap = {}
    progress = practiced(progress, 'country:de', [true, true])
    progress = practiced(progress, 'country:fr', [false])

    const report = buildProgressReport(pool, progress, NOW)
    expect(report.practicedFlags).toBe(2)
    expect(report.totalAnswers).toBe(3)
    expect(report.totalCorrect).toBe(2)
    expect(report.overallAccuracy).toBeCloseTo(2 / 3)
    expect(report.neverPracticed.map((f) => f.name)).toEqual(['Japan', 'Mexico', 'Netherlands'])
  })

  it('groups by continent, summing across every flag in the group', () => {
    let progress: ProgressMap = {}
    progress = practiced(progress, 'country:de', [true])
    progress = practiced(progress, 'country:fr', [true])
    progress = practiced(progress, 'country:jp', [false])

    const report = buildProgressReport(pool, progress, NOW)
    const europe = report.byContinent.find((g) => g.key === 'Europe')
    const asia = report.byContinent.find((g) => g.key === 'Asia')
    expect(europe).toMatchObject({ flagCount: 3, practicedCount: 2, seen: 2, correct: 2, accuracy: 1 })
    expect(asia).toMatchObject({ flagCount: 1, practicedCount: 1, seen: 1, correct: 0, accuracy: 0 })
  })

  it('flags small groups as low-sample without excluding them', () => {
    const report = buildProgressReport(pool, {}, NOW)
    const asia = report.byContinent.find((g) => g.key === 'Asia')
    const europe = report.byContinent.find((g) => g.key === 'Europe')
    expect(asia?.lowSample).toBe(true) // only 1 flag
    expect(europe?.lowSample).toBe(false) // 3 flags
  })

  it('counts a multi-tagged flag toward every one of its tag groups', () => {
    const report = buildProgressReport(pool, {}, NOW)
    const emblem = report.byTag.find((g) => g.key === 'emblem')
    const animal = report.byTag.find((g) => g.key === 'animal')
    expect(emblem?.flagCount).toBe(1)
    expect(animal?.flagCount).toBe(1)
    expect(emblem?.flagCount).toBe(animal?.flagCount)
  })

  it('ranks strongest and weakest flags by effective confidence, not raw accuracy', () => {
    let progress: ProgressMap = {}
    // One right answer sets confidence to 1 immediately (matches
    // MasteryGrid/scheduler semantics) — de becomes maximally "strong".
    progress = practiced(progress, 'country:de', [true])
    progress = practiced(progress, 'country:fr', [false])

    const report = buildProgressReport(pool, progress, NOW)
    expect(report.strongestFlags[0].name).toBe('Germany')
    expect(report.weakestFlags[0].name).toBe('France')
  })
})
