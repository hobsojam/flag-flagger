import { countries, type Country } from '../data/countries'

export interface Question {
  answer: Country
  options: Country[]
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function similarityScore(a: Country, b: Country): number {
  let score = 0
  if (a.layout === b.layout) score += 2
  if (a.continent === b.continent) score += 1
  return score
}

/**
 * Ranks candidates by visual confusability with `answer` (same flag layout,
 * same continent), most confusable first. Ties are broken randomly, and
 * candidates with no shared traits still rank — just last — so callers
 * always get a full list rather than needing a separate random fallback.
 */
export function rankDistractors(answer: Country, pool: Country[]): Country[] {
  return shuffle(pool).sort(
    (a, b) => similarityScore(answer, b) - similarityScore(answer, a),
  )
}

export function buildQuestion(answer: Country): Question {
  const pool = countries.filter((c) => c.code !== answer.code)
  const distractors = rankDistractors(answer, pool).slice(0, 3)

  return {
    answer,
    options: shuffle([answer, ...distractors]),
  }
}
