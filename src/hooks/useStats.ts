import { useEffect, useState } from 'react'

export interface Stats {
  answered: number
  correct: number
  streak: number
  bestStreak: number
}

const STORAGE_KEY = 'flag-flagger:stats'

const defaultStats: Stats = {
  answered: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
}

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultStats
    return { ...defaultStats, ...JSON.parse(raw) }
  } catch {
    return defaultStats
  }
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(loadStats)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  }, [stats])

  function recordAnswer(isCorrect: boolean) {
    setStats((prev) => {
      const streak = isCorrect ? prev.streak + 1 : 0
      return {
        answered: prev.answered + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        streak,
        bestStreak: Math.max(prev.bestStreak, streak),
      }
    })
  }

  function reset() {
    setStats(defaultStats)
  }

  return { stats, recordAnswer, reset }
}
