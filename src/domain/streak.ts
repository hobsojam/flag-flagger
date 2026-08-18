export interface Streak {
  lastPracticedDate: string | null // local calendar date, 'YYYY-MM-DD'
  currentStreak: number
  longestStreak: number
}

export const INITIAL_STREAK: Streak = {
  lastPracticedDate: null,
  currentStreak: 0,
  longestStreak: 0,
}

// Both inputs are plain 'YYYY-MM-DD' calendar dates (already resolved to the
// user's local day by the caller), so parsing them as UTC and diffing is
// safe here -- it's just counting whole calendar days apart, not real
// elapsed time, so there's no DST/timezone drift to worry about.
function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000)
}

/**
 * Given the streak as of the last practice and today's local date, returns
 * the streak after practicing today. A no-op if today was already recorded,
 * so callers can call this on every answer rather than just the day's first.
 */
export function recordPractice(prev: Streak, today: string): Streak {
  if (prev.lastPracticedDate === today) return prev

  const gap = prev.lastPracticedDate ? daysBetween(prev.lastPracticedDate, today) : null
  const currentStreak = gap === 1 ? prev.currentStreak + 1 : 1

  return {
    lastPracticedDate: today,
    currentStreak,
    longestStreak: Math.max(prev.longestStreak, currentStreak),
  }
}
