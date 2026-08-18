import { describe, expect, it } from 'vitest'
import type { Country } from '../data/countries'
import { isCorrectGuess } from './match'

function makeCountry(name: string, aliases?: string[]): Country {
  return {
    id: 'country:xx',
    category: 'country',
    code: 'xx',
    name,
    continent: 'Europe',
    colorCount: 3,
    layout: 'other',
    areaKm2: 100,
    aliases,
  }
}

describe('isCorrectGuess', () => {
  it('matches the exact name', () => {
    expect(isCorrectGuess('Germany', makeCountry('Germany'))).toBe(true)
  })

  it('is case-insensitive and trims whitespace', () => {
    expect(isCorrectGuess('  germany  ', makeCountry('Germany'))).toBe(true)
  })

  it('ignores punctuation and accents', () => {
    expect(isCorrectGuess('Cote d Ivoire', makeCountry("Cote d'Ivoire"))).toBe(true)
    expect(isCorrectGuess('Côte d’Ivoire', makeCountry("Cote d'Ivoire"))).toBe(true)
  })

  it('accepts a listed alias', () => {
    expect(isCorrectGuess('USA', makeCountry('United States', ['USA', 'US']))).toBe(true)
    expect(isCorrectGuess('us', makeCountry('United States', ['USA', 'US']))).toBe(true)
  })

  it('rejects an unrelated guess', () => {
    expect(isCorrectGuess('France', makeCountry('Germany'))).toBe(false)
  })

  it('rejects an empty guess', () => {
    expect(isCorrectGuess('   ', makeCountry('Germany'))).toBe(false)
  })

  it('forgives a single typo in a mid-length name', () => {
    expect(isCorrectGuess('Jermany', makeCountry('Germany'))).toBe(true)
  })

  it('forgives up to two typos in a long name', () => {
    // "kyrgzystan" vs "kyrgyzstan": the y/z pair is transposed, which costs
    // 2 substitutions under plain Levenshtein — exactly at budget for a
    // 10-letter name.
    expect(isCorrectGuess('Kyrgzystan', makeCountry('Kyrgyzstan'))).toBe(true)
  })

  it('rejects a guess that exceeds the typo budget for its length', () => {
    // "portugal" (8 letters, budget 2) vs "xyztugal": first 3 letters
    // substituted, rest identical — exactly 3 edits, one over budget.
    expect(isCorrectGuess('Xyztugal', makeCountry('Portugal'))).toBe(false)
  })

  it('requires an exact match for short names/aliases', () => {
    expect(isCorrectGuess('UD', makeCountry('United States', ['USA', 'US']))).toBe(false)
  })
})
