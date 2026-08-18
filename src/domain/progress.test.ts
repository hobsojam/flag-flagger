import { describe, expect, it } from 'vitest'
import { createRecord, effectiveConfidence, updateRecord } from './progress'

describe('createRecord', () => {
  it('starts at zero confidence and zero history', () => {
    const record = createRecord('de')
    expect(record).toEqual({
      code: 'de',
      confidence: 0,
      lastSeenAt: 0,
      seen: 0,
      correct: 0,
    })
  })
})

describe('updateRecord', () => {
  it('sets confidence to 1 on a first-ever correct answer', () => {
    const record = updateRecord(createRecord('de'), true, 1000)
    expect(record.confidence).toBe(1)
    expect(record.seen).toBe(1)
    expect(record.correct).toBe(1)
    expect(record.lastSeenAt).toBe(1000)
  })

  it('sets confidence to 0 on a first-ever wrong answer', () => {
    const record = updateRecord(createRecord('de'), false, 1000)
    expect(record.confidence).toBe(0)
    expect(record.seen).toBe(1)
    expect(record.correct).toBe(0)
  })

  it('blends subsequent answers as a 0.7/0.3 EMA', () => {
    let record = updateRecord(createRecord('de'), true, 0) // confidence 1
    record = updateRecord(record, false, 1) // 1*0.7 + 0*0.3
    expect(record.confidence).toBeCloseTo(0.7)
    expect(record.seen).toBe(2)
    expect(record.correct).toBe(1)
  })

  it('accumulates seen/correct counts across many answers', () => {
    let record = createRecord('de')
    record = updateRecord(record, true, 0)
    record = updateRecord(record, true, 1)
    record = updateRecord(record, false, 2)
    expect(record.seen).toBe(3)
    expect(record.correct).toBe(2)
  })
})

describe('effectiveConfidence', () => {
  it('is 0 for a flag never seen', () => {
    expect(effectiveConfidence(createRecord('de'), 1000)).toBe(0)
  })

  it('returns the raw confidence when queried at the moment it was last seen', () => {
    const record = updateRecord(createRecord('de'), true, 1000)
    expect(effectiveConfidence(record, 1000)).toBeCloseTo(1)
  })

  it('decays as more time passes since last seen', () => {
    const record = updateRecord(createRecord('de'), true, 0)
    const oneDay = 1000 * 60 * 60 * 24
    const soon = effectiveConfidence(record, oneDay)
    const later = effectiveConfidence(record, oneDay * 30)
    expect(soon).toBeLessThan(1)
    expect(later).toBeLessThan(soon)
  })

  it('decays a well-known flag slower than a shaky one over the same elapsed time', () => {
    const oneDay = 1000 * 60 * 60 * 24

    // Build a high-confidence record (several correct answers in a row).
    let strong = createRecord('de')
    for (let i = 0; i < 5; i++) strong = updateRecord(strong, true, 0)

    // Build a low-but-nonzero-confidence record.
    let shaky = createRecord('fr')
    shaky = updateRecord(shaky, true, 0)
    shaky = updateRecord(shaky, false, 0)

    const elapsed = oneDay * 10
    const strongRatio = effectiveConfidence(strong, elapsed) / strong.confidence
    const shakyRatio = effectiveConfidence(shaky, elapsed) / shaky.confidence
    expect(strongRatio).toBeGreaterThan(shakyRatio)
  })
})
