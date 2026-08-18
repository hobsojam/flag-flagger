import type { Country } from '../data/countries'

export interface SessionAnswer {
  id: string
  isCorrect: boolean
}

export interface GroupStat {
  dimension: 'continent' | 'layout'
  key: string
  correct: number
  total: number
  accuracy: number
}

export interface SessionSummary {
  total: number
  correct: number
  accuracy: number
  byContinent: GroupStat[]
  byLayout: GroupStat[]
  strongest: GroupStat | null
  weakest: GroupStat | null
}

// Below this many answers in a group, accuracy is too noisy to call out as a
// pattern (e.g. "100% strong in Oceania" from a single lucky guess).
const MIN_SAMPLE_SIZE = 2

function groupBy(
  answers: SessionAnswer[],
  countriesById: Map<string, Country>,
  dimension: GroupStat['dimension'],
  keyOf: (country: Country) => string,
): GroupStat[] {
  const totals = new Map<string, { correct: number; total: number }>()

  for (const answer of answers) {
    const country = countriesById.get(answer.id)
    if (!country) continue
    const key = keyOf(country)
    const entry = totals.get(key) ?? { correct: 0, total: 0 }
    entry.total += 1
    if (answer.isCorrect) entry.correct += 1
    totals.set(key, entry)
  }

  return [...totals.entries()].map(([key, { correct, total }]) => ({
    dimension,
    key,
    correct,
    total,
    accuracy: correct / total,
  }))
}

function pickExtreme(
  groups: GroupStat[],
  comparator: (a: GroupStat, b: GroupStat) => number,
): GroupStat | null {
  const eligible = groups.filter((g) => g.total >= MIN_SAMPLE_SIZE)
  if (eligible.length === 0) return null
  return [...eligible].sort(comparator)[0]
}

export function summarizeSession(answers: SessionAnswer[], countries: Country[]): SessionSummary {
  const countriesById = new Map(countries.map((c) => [c.id, c]))
  const byContinent = groupBy(answers, countriesById, 'continent', (c) => c.continent)
  const byLayout = groupBy(answers, countriesById, 'layout', (c) => c.layout)
  const allGroups = [...byContinent, ...byLayout]

  const strongest = pickExtreme(allGroups, (a, b) => b.accuracy - a.accuracy)
  let weakest = pickExtreme(allGroups, (a, b) => a.accuracy - b.accuracy)
  // A single group can't be both — if it's the only one with enough
  // samples, call out that it's strong rather than contradicting ourselves.
  if (weakest && strongest && weakest.dimension === strongest.dimension && weakest.key === strongest.key) {
    weakest = null
  }

  const correct = answers.filter((a) => a.isCorrect).length

  return {
    total: answers.length,
    correct,
    accuracy: answers.length === 0 ? 0 : correct / answers.length,
    byContinent,
    byLayout,
    strongest,
    weakest,
  }
}
