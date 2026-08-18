import { useEffect, useState } from 'react'

const STORAGE_KEY = 'flag-flagger:sound-enabled'

function loadSoundEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function useSoundPreference() {
  const [enabled, setEnabled] = useState<boolean>(loadSoundEnabled)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled))
  }, [enabled])

  return [enabled, setEnabled] as const
}
