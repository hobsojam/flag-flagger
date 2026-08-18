import { describe, expect, it } from 'vitest'
import type { Country } from '../data/countries'
import { isCorrectGuess } from './match'

function makeCountry(name: string, aliases?: string[]): Country {
  return {
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
})
