import type { Country } from '../data/countries'
import { effectiveConfidence, type ProgressMap } from './progress'

const MIN_WEIGHT = 0.05

/**
 * Weighted-random pick biased toward low-confidence flags, so weak flags
 * surface more often without making the quiz fully predictable.
 * `recentCodes` are excluded to avoid immediate repeats.
 */
export function selectNextFlag(
  countries: Country[],
  progress: ProgressMap,
  recentCodes: string[],
  now: number,
): Country {
  const candidates = countries.filter((c) => !recentCodes.includes(c.code))
  const pool = candidates.length > 0 ? candidates : countries

  const weights = pool.map((c) => {
    const record = progress[c.code]
    const confidence = record ? effectiveConfidence(record, now) : 0
    return Math.max(MIN_WEIGHT, 1 - confidence)
  })

  const total = weights.reduce((sum, w) => sum + w, 0)
  let roll = Math.random() * total
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}
