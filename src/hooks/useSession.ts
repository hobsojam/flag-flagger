import { useCallback, useState } from 'react'
import type { SessionAnswer } from '../domain/session'

export const SESSION_LENGTH = 10

export function useSession() {
  const [active, setActive] = useState(false)
  const [answers, setAnswers] = useState<SessionAnswer[]>([])

  const start = useCallback(() => {
    setAnswers([])
    setActive(true)
  }, [])

  const stop = useCallback(() => {
    setActive(false)
    setAnswers([])
  }, [])

  const recordAnswer = useCallback((id: string, isCorrect: boolean) => {
    setAnswers((prev) => (prev.length >= SESSION_LENGTH ? prev : [...prev, { id, isCorrect }]))
  }, [])

  return {
    active,
    answers,
    isComplete: active && answers.length >= SESSION_LENGTH,
    start,
    stop,
    recordAnswer,
  }
}
