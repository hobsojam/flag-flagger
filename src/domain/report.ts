import type { Country } from '../data/countries'
import { effectiveConfidence, type ProgressMap } from './progress'

export interface FlagStat {
  id: string
  name: string
  seen: number
  correct: number
  accuracy: number
  confidence: number
}

export interface GroupStat {
  key: string
  flagCount: number
  practicedCount: number
  seen: number
  correct: number
  accuracy: number
  avgConfidence: number
  // Too few flags in this group for its numbers to mean much (e.g. a
  // content tag only two flags carry) — shown in the report, but not worth
  // calling out as a real strength/weakness.
  lowSample: boolean
}

export interface ProgressReport {
  generatedAt: number
  totalFlags: number
  practicedFlags: number
  totalAnswers: number
  totalCorrect: number
  overallAccuracy: number
  overallConfidence: number
  byContinent: GroupStat[]
  byLayout: GroupStat[]
  byTag: GroupStat[]
  strongestFlags: FlagStat[]
  weakestFlags: FlagStat[]
  neverPracticed: FlagStat[]
}

const TOP_N = 10
const MIN_GROUP_SIZE = 3

function flagStat(country: Country, progress: ProgressMap, now: number): FlagStat {
  const record = progress[country.id]
  const seen = record?.seen ?? 0
  const correct = record?.correct ?? 0
  return {
    id: country.id,
    name: country.name,
    seen,
    correct,
    accuracy: seen === 0 ? 0 : correct / seen,
    confidence: record ? effectiveConfidence(record, now) : 0,
  }
}

function groupBy(
  pool: Country[],
  statsById: Map<string, FlagStat>,
  keysOf: (country: Country) => string[],
): GroupStat[] {
  const membersByKey = new Map<string, Country[]>()
  for (const country of pool) {
    for (const key of keysOf(country)) {
      const members = membersByKey.get(key) ?? []
      members.push(country)
      membersByKey.set(key, members)
    }
  }

  return [...membersByKey.entries()]
    .map(([key, members]) => {
      let seen = 0
      let correct = 0
      let confidenceSum = 0
      let practicedCount = 0
      for (const country of members) {
        const stat = statsById.get(country.id)
        if (!stat) continue
        seen += stat.seen
        correct += stat.correct
        confidenceSum += stat.confidence
        if (stat.seen > 0) practicedCount += 1
      }
      return {
        key,
        flagCount: members.length,
        practicedCount,
        seen,
        correct,
        accuracy: seen === 0 ? 0 : correct / seen,
        avgConfidence: confidenceSum / members.length,
        lowSample: members.length < MIN_GROUP_SIZE,
      }
    })
    .sort((a, b) => b.avgConfidence - a.avgConfidence)
}

/**
 * Builds a full-history strengths/weaknesses report from every flag ever
 * seen, not just one session (contrast with domain/session.ts's
 * summarizeSession, which is scoped to a single session's answers).
 *
 * Ranks by effectiveConfidence rather than raw accuracy, deliberately
 * matching the same metric MasteryGrid already colors tiles by — so a flag
 * called "weak" here is exactly a red/yellow tile there, not a subtly
 * different definition.
 */
export function buildProgressReport(pool: Country[], progress: ProgressMap, now: number): ProgressReport {
  const statsById = new Map(pool.map((c) => [c.id, flagStat(c, progress, now)]))
  const allStats = [...statsById.values()]

  const practiced = allStats.filter((s) => s.seen > 0)
  const neverPracticed = allStats
    .filter((s) => s.seen === 0)
    .sort((a, b) => a.name.localeCompare(b.name))

  const totalAnswers = allStats.reduce((sum, s) => sum + s.seen, 0)
  const totalCorrect = allStats.reduce((sum, s) => sum + s.correct, 0)
  const overallConfidence =
    allStats.length === 0 ? 0 : allStats.reduce((sum, s) => sum + s.confidence, 0) / allStats.length

  const byConfidenceDesc = [...practiced].sort((a, b) => b.confidence - a.confidence)
  const byConfidenceAsc = [...practiced].sort((a, b) => a.confidence - b.confidence)

  return {
    generatedAt: now,
    totalFlags: pool.length,
    practicedFlags: practiced.length,
    totalAnswers,
    totalCorrect,
    overallAccuracy: totalAnswers === 0 ? 0 : totalCorrect / totalAnswers,
    overallConfidence,
    byContinent: groupBy(pool, statsById, (c) => [c.continent]),
    byLayout: groupBy(pool, statsById, (c) => [c.layout]),
    byTag: groupBy(pool, statsById, (c) => c.tags ?? []),
    strongestFlags: byConfidenceDesc.slice(0, TOP_N),
    weakestFlags: byConfidenceAsc.slice(0, TOP_N),
    neverPracticed,
  }
}
