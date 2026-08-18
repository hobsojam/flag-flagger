import type { Country } from '../data/countries'

const COMBINING_MARKS = /[̀-ͯ]/g

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function levenshtein(a: string, b: string): number {
  const prevRow = Array.from({ length: b.length + 1 }, (_, j) => j)

  for (let i = 1; i <= a.length; i++) {
    let diagonal = prevRow[0]
    prevRow[0] = i
    for (let j = 1; j <= b.length; j++) {
      const temp = prevRow[j]
      prevRow[j] =
        a[i - 1] === b[j - 1] ? diagonal : 1 + Math.min(diagonal, prevRow[j], prevRow[j - 1])
      diagonal = temp
    }
  }

  return prevRow[b.length]
}

/**
 * How many typos to forgive, scaled to name length so short names (where a
 * single edit changes the word entirely) still require an exact match.
 */
function typoBudget(length: number): number {
  if (length <= 3) return 0
  if (length <= 7) return 1
  return 2
}

export function isCorrectGuess(guess: string, country: Country): boolean {
  const normalizedGuess = normalize(guess)
  if (!normalizedGuess) return false

  const candidates = [country.name, ...(country.aliases ?? [])]
  return candidates.some((candidate) => {
    const normalizedCandidate = normalize(candidate)
    if (normalizedGuess === normalizedCandidate) return true

    const budget = typoBudget(normalizedCandidate.length)
    return budget > 0 && levenshtein(normalizedGuess, normalizedCandidate) <= budget
  })
}
