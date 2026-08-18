import { useEffect, useState } from 'react'

const STORAGE_KEY = 'flag-flagger:sound-enabled'

function loadSoundEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function saveSoundEnabled(enabled: boolean) {
  // enabled is only ever flipped by a boolean negation (see the toggle
  // button in App.tsx), but this guard pins it to a literal 'true'/'false'
  // right at the storage write, rather than trusting the caller's type.
  if (typeof enabled !== 'boolean') return
  localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false')
}

export function useSoundPreference() {
  const [enabled, setEnabled] = useState<boolean>(loadSoundEnabled)

  useEffect(() => {
    saveSoundEnabled(enabled)
  }, [enabled])

  return [enabled, setEnabled] as const
}
