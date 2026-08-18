import { describe, expect, it } from 'vitest'
import { countries } from './countries'

describe('countries flag ratios', () => {
  it('gives every country a positive width and height', () => {
    for (const c of countries) {
      expect(c.flagRatioW, c.name).toBeGreaterThan(0)
      expect(c.flagRatioH, c.name).toBeGreaterThan(0)
    }
  })

  it('only Switzerland and Vatican City are true 1:1 squares', () => {
    const squares = countries.filter((c) => c.flagRatioW === c.flagRatioH)
    expect(squares.map((c) => c.code).sort()).toEqual(['ch', 'va'])
  })

  it('only flags Nepal as non-rectangular', () => {
    const flagged = countries.filter((c) => c.nonRectangularFlag)
    expect(flagged.map((c) => c.code)).toEqual(['np'])
  })
})
