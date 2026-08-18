import { describe, expect, it } from 'vitest'
import { countries } from './countries'
import { historicalFlags } from './historicalFlags'

describe('historicalFlags', () => {
  it('gives every entry a positive width and height', () => {
    for (const f of historicalFlags) {
      expect(f.flagRatioW, f.name).toBeGreaterThan(0)
      expect(f.flagRatioH, f.name).toBeGreaterThan(0)
    }
  })

  it('gives every entry category "historical" and an id prefixed historical:', () => {
    for (const f of historicalFlags) {
      expect(f.category, f.name).toBe('historical')
      expect(f.id, f.name).toBe(`historical:${f.code}`)
    }
  })

  it('gives every entry a resolvable imageUrl under historical-flags/', () => {
    for (const f of historicalFlags) {
      expect(f.imageUrl, f.name).toMatch(/^historical-flags\/.+\.svg$/)
    }
  })

  it('flags exactly the 3 politically-sensitive entries as sensitive', () => {
    expect(historicalFlags.filter((f) => f.sensitive).map((f) => f.name).sort()).toEqual([
      'Apartheid-era South Africa',
      'Confederate States of America',
      'Nazi Germany',
    ])
  })

  it('has no id or code collisions with the current countries list', () => {
    const countryIds = new Set(countries.map((c) => c.id))
    const countryCodes = new Set(countries.map((c) => c.code))
    for (const f of historicalFlags) {
      expect(countryIds.has(f.id), f.id).toBe(false)
      expect(countryCodes.has(f.code), f.code).toBe(false)
    }
  })

  it('has no internal id or code collisions', () => {
    const ids = historicalFlags.map((f) => f.id)
    const codes = historicalFlags.map((f) => f.code)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(codes).size).toBe(codes.length)
  })
})
