import type { ProgressMap } from './progress'

export interface ProgressStorage {
  load(): ProgressMap
  save(progress: ProgressMap): void
}

const STORAGE_KEY = 'flag-flagger:progress'

export const localProgressStorage: ProgressStorage = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  },
  save(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  },
}
