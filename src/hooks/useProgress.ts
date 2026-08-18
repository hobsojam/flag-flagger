import { useCallback, useRef, useState } from 'react'
import { countries, type Country } from '../data/countries'
import { selectNextFlag } from '../domain/scheduler'
import { localProgressStorage } from '../domain/storage'
import { createRecord, updateRecord, type ProgressMap } from '../domain/progress'

const RECENT_HISTORY = 4

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>(() =>
    localProgressStorage.load(),
  )
  const recentRef = useRef<string[]>([])

  const nextFlag = useCallback((): Country => {
    const flag = selectNextFlag(countries, progress, recentRef.current, Date.now())
    recentRef.current = [flag.id, ...recentRef.current].slice(0, RECENT_HISTORY)
    return flag
  }, [progress])

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
