import { useCallback, useRef, useState } from 'react'
import { countries, type Country } from '../data/countries'
import { selectNextFlag, selectWeakFlag } from '../domain/scheduler'
import { localProgressStorage } from '../domain/storage'
import { createRecord, updateRecord, type ProgressMap } from '../domain/progress'

const RECENT_HISTORY = 4

export type SelectionMode = 'adaptive' | 'weak'

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>(() =>
    localProgressStorage.load(),
  )
  const recentRef = useRef<string[]>([])

  const nextFlag = useCallback(
    (mode: SelectionMode = 'adaptive', pool: Country[] = countries): Country => {
      const select = mode === 'weak' ? selectWeakFlag : selectNextFlag
      const flag = select(pool, progress, recentRef.current, Date.now())
      recentRef.current = [flag.id, ...recentRef.current].slice(0, RECENT_HISTORY)
      return flag
    },
    [progress],
  )

  const recordAnswer = useCallback((id: string, isCorrect: boolean) => {
    setProgress((prev) => {
      const existing = prev[id] ?? createRecord(id)
      const next = { ...prev, [id]: updateRecord(existing, isCorrect, Date.now()) }
      localProgressStorage.save(next)
      return next
    })
  }, [])

  return { progress, nextFlag, recordAnswer }
}
