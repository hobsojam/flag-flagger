import { useCallback, useRef, useState } from 'react'
import { countries, type Country } from '../data/countries'
import { selectNextFlag, selectWeakFlag } from '../domain/scheduler'
import { localProgressStorage } from '../domain/storage'
import { createRecord, updateRecord, type ProgressMap } from '../domain/progress'

const RECENT_HISTORY = 4

export type QuizMode = 'adaptive' | 'weak'

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>(() =>
    localProgressStorage.load(),
  )
  const recentRef = useRef<string[]>([])

  const nextFlag = useCallback((mode: QuizMode = 'adaptive'): Country => {
    const select = mode === 'weak' ? selectWeakFlag : selectNextFlag
    const flag = select(countries, progress, recentRef.current, Date.now())
    recentRef.current = [flag.code, ...recentRef.current].slice(0, RECENT_HISTORY)
    return flag
  }, [progress])

  const recordAnswer = useCallback((code: string, isCorrect: boolean) => {
    setProgress((prev) => {
      const existing = prev[code] ?? createRecord(code)
      const next = { ...prev, [code]: updateRecord(existing, isCorrect, Date.now()) }
      localProgressStorage.save(next)
      return next
    })
  }, [])

  return { progress, nextFlag, recordAnswer }
}
