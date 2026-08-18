import { useCallback, useState } from 'react'
import type { SessionAnswer } from '../domain/session'

export const DEFAULT_SESSION_LENGTH = 10

export function useSession() {
  const [active, setActive] = useState(false)
  const [length, setLength] = useState(DEFAULT_SESSION_LENGTH)
  const [answers, setAnswers] = useState<SessionAnswer[]>([])

  const start = useCallback((sessionLength: number = DEFAULT_SESSION_LENGTH) => {
    setLength(sessionLength)
    setAnswers([])
    setActive(true)
  }, [])

  const stop = useCallback(() => {
    setActive(false)
    setAnswers([])
  }, [])

  const recordAnswer = useCallback(
    (id: string, isCorrect: boolean) => {
      setAnswers((prev) => (prev.length >= length ? prev : [...prev, { id, isCorrect }]))
    },
    [length],
  )

  return {
    active,
    length,
    answers,
    isComplete: active && answers.length >= length,
    start,
    stop,
    recordAnswer,
  }
}
