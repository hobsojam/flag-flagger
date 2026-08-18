import { describe, expect, it } from 'vitest'
import { INITIAL_STREAK, recordPractice } from './streak'

describe('recordPractice', () => {
  it('starts a new streak at 1 on the first ever practice', () => {
    const result = recordPractice(INITIAL_STREAK, '2026-08-18')
    expect(result).toEqual({
      lastPracticedDate: '2026-08-18',
      currentStreak: 1,
      longestStreak: 1,
    })
  })

  it('is a no-op if today was already recorded', () => {
    const prev = { lastPracticedDate: '2026-08-18', currentStreak: 3, longestStreak: 5 }
    expect(recordPractice(prev, '2026-08-18')).toBe(prev)
  })

  it('increments the streak on the very next calendar day', () => {
    const prev = { lastPracticedDate: '2026-08-18', currentStreak: 3, longestStreak: 5 }
    const result = recordPractice(prev, '2026-08-19')
    expect(result).toEqual({
      lastPracticedDate: '2026-08-19',
      currentStreak: 4,
      longestStreak: 5,
    })
  })

  it('raises the longest streak once the current streak passes it', () => {
    const prev = { lastPracticedDate: '2026-08-18', currentStreak: 5, longestStreak: 5 }
    const result = recordPractice(prev, '2026-08-19')
    expect(result.currentStreak).toBe(6)
    expect(result.longestStreak).toBe(6)
  })

  it('resets to 1 when a day is skipped', () => {
    const prev = { lastPracticedDate: '2026-08-18', currentStreak: 7, longestStreak: 7 }
    const result = recordPractice(prev, '2026-08-20')
    expect(result).toEqual({
      lastPracticedDate: '2026-08-20',
      currentStreak: 1,
      longestStreak: 7,
    })
  })

  it('handles a month boundary as a normal one-day gap', () => {
    const prev = { lastPracticedDate: '2026-08-31', currentStreak: 2, longestStreak: 2 }
    const result = recordPractice(prev, '2026-09-01')
    expect(result.currentStreak).toBe(3)
  })
})
