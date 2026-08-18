import { useEffect, useState } from 'react'

const STORAGE_KEY = 'flag-flagger:flag-categories'

export interface FlagCategoryPreferences {
  includeHistorical: boolean
  includeSensitive: boolean
}

const DEFAULTS: FlagCategoryPreferences = {
  includeHistorical: false,
  includeSensitive: false,
}

function loadPreferences(): FlagCategoryPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw)
    return {
      includeHistorical: parsed.includeHistorical === true,
      // Enforced on load too, in case localStorage was hand-edited or left
      // over from a different app version: sensitive can never be true
      // without historical also true.
      includeSensitive: parsed.includeHistorical === true && parsed.includeSensitive === true,
    }
  } catch {
    return DEFAULTS
  }
}

function savePreferences(prefs: FlagCategoryPreferences) {
  // Explicitly coerced to booleans (rather than writing `prefs` through
  // directly) so only known-clean true/false values ever reach storage,
  // regardless of what shape upstream state happened to carry.
  const sanitized: FlagCategoryPreferences = {
    includeHistorical: prefs.includeHistorical === true,
    includeSensitive: prefs.includeHistorical === true && prefs.includeSensitive === true,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized))
}

export function useFlagCategoryPreferences() {
  const [prefs, setPrefs] = useState<FlagCategoryPreferences>(loadPreferences)

  useEffect(() => {
    savePreferences(prefs)
  }, [prefs])

  function setIncludeHistorical(next: boolean) {
    setPrefs((prev) => ({
      includeHistorical: next,
      // Unchecking historical always clears sensitive too — it's a nested
      // sub-option, never independently enabled.
      includeSensitive: next ? prev.includeSensitive : false,
    }))
  }

  function setIncludeSensitive(next: boolean) {
    setPrefs((prev) => (prev.includeHistorical ? { ...prev, includeSensitive: next } : prev))
  }

  return { ...prefs, setIncludeHistorical, setIncludeSensitive }
}
