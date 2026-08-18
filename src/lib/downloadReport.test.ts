import { describe, expect, it } from 'vitest'
import type { ProgressReport } from '../domain/report'
import { renderReportHtml } from './downloadReport'

function makeReport(overrides: Partial<ProgressReport> = {}): ProgressReport {
  return {
    generatedAt: Date.UTC(2026, 0, 15, 12, 0, 0),
    totalFlags: 5,
    practicedFlags: 2,
    totalAnswers: 3,
    totalCorrect: 2,
    overallAccuracy: 2 / 3,
    overallConfidence: 0.5,
    byContinent: [],
    byLayout: [],
    byTag: [],
    strongestFlags: [],
    weakestFlags: [],
    neverPracticed: [],
    ...overrides,
  }
}

describe('renderReportHtml', () => {
  it('produces a self-contained HTML document with the overview stats', () => {
    const html = renderReportHtml(makeReport())
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('Flag Flagger — Progress Report')
    expect(html).toContain('2/5') // practiced/total
    expect(html).toContain('67%') // accuracy rounded
  })

  it('escapes flag names so an ampersand cannot break the markup', () => {
    const html = renderReportHtml(
      makeReport({
        weakestFlags: [
          { id: 'country:tt', name: 'Trinidad & Tobago', seen: 1, correct: 0, accuracy: 0, confidence: 0 },
        ],
      }),
    )
    expect(html).toContain('Trinidad &amp; Tobago')
    expect(html).not.toContain('Trinidad & Tobago<')
  })

  it('omits sections that have no data', () => {
    const html = renderReportHtml(makeReport())
    expect(html).not.toContain('Never practiced')
    expect(html).not.toContain('Strongest flags')
    expect(html).not.toContain('By continent')
  })

  it('marks low-sample groups without dropping them', () => {
    const html = renderReportHtml(
      makeReport({
        byContinent: [
          {
            key: 'Oceania',
            flagCount: 1,
            practicedCount: 1,
            seen: 1,
            correct: 1,
            accuracy: 1,
            avgConfidence: 1,
            lowSample: true,
          },
        ],
      }),
    )
    expect(html).toContain('Oceania')
    expect(html).toContain('low sample')
  })

  it('lists every never-practiced flag by name', () => {
    const html = renderReportHtml(
      makeReport({
        neverPracticed: [
          { id: 'country:jp', name: 'Japan', seen: 0, correct: 0, accuracy: 0, confidence: 0 },
          { id: 'country:mx', name: 'Mexico', seen: 0, correct: 0, accuracy: 0, confidence: 0 },
        ],
      }),
    )
    expect(html).toContain('Never practiced (2)')
    expect(html).toContain('Japan')
    expect(html).toContain('Mexico')
  })
})
