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

export function isCorrectGuess(guess: string, country: Country): boolean {
  const normalizedGuess = normalize(guess)
  if (!normalizedGuess) return false

  const candidates = [country.name, ...(country.aliases ?? [])]
  return candidates.some((candidate) => normalize(candidate) === normalizedGuess)
}
