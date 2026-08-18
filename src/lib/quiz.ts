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

export function buildQuestion(answer: Country): Question {
  const distractors = shuffle(
    countries.filter((c) => c.code !== answer.code),
  ).slice(0, 3)

  return {
    answer,
    options: shuffle([answer, ...distractors]),
  }
}
