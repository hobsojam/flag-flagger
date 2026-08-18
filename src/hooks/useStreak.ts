import { useEffect, useState } from 'react'
import { INITIAL_STREAK, recordPractice as advanceStreak, type Streak } from '../domain/streak'

const STORAGE_KEY = 'flag-flagger:streak'

function loadStreak(): Streak {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_STREAK
    return { ...INITIAL_STREAK, ...JSON.parse(raw) }
  } catch {
    return INITIAL_STREAK
  }
}

function todayLocal(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function useStreak() {
  const [streak, setStreak] = useState<Streak>(loadStreak)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(streak))
  }, [streak])

  function recordPractice() {
    setStreak((prev) => advanceStreak(prev, todayLocal()))
  }

  return { streak, recordPractice }
}
