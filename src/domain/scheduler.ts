import type { Country } from '../data/countries'
import { effectiveConfidence, type ProgressMap } from './progress'

const MIN_WEIGHT = 0.05

/**
 * Weighted-random pick biased toward low-confidence flags, so weak flags
 * surface more often without making the quiz fully predictable.
 * `recentIds` are excluded to avoid immediate repeats.
 */
export function selectNextFlag(
  countries: Country[],
  progress: ProgressMap,
  recentIds: string[],
  now: number,
): Country {
  const candidates = countries.filter((c) => !recentIds.includes(c.id))
  const pool = candidates.length > 0 ? candidates : countries

  const weights = pool.map((c) => {
    const record = progress[c.id]
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

const WEAK_POOL_SIZE = 20
const WEAK_CONFIDENCE_THRESHOLD = 0.4

/**
 * Uniform-random pick from the lowest-confidence flags only, for a dedicated
 * "practice what I'm bad at" mode — unlike selectNextFlag, this never
 * interleaves well-known flags. The pool is everything below the confidence
 * threshold, but at least WEAK_POOL_SIZE flags so it doesn't shrink to
 * nothing once most flags are well known.
 */
export function selectWeakFlag(
  countries: Country[],
  progress: ProgressMap,
  recentIds: string[],
  now: number,
): Country {
  const confidenceOf = (c: Country) => {
    const record = progress[c.id]
    return record ? effectiveConfidence(record, now) : 0
  }

  const ranked = [...countries].sort((a, b) => confidenceOf(a) - confidenceOf(b))
  const belowThreshold = ranked.filter((c) => confidenceOf(c) < WEAK_CONFIDENCE_THRESHOLD)
  const weakPool = belowThreshold.length >= WEAK_POOL_SIZE ? belowThreshold : ranked.slice(0, WEAK_POOL_SIZE)

  const candidates = weakPool.filter((c) => !recentIds.includes(c.id))
  const pool = candidates.length > 0 ? candidates : weakPool

  return pool[Math.floor(Math.random() * pool.length)] // NOSONAR - not security-sensitive, just picking a quiz question
}
