import { useState } from 'react'
import type { Continent, FlagLayout } from '../data/countries'
import { CONTINENTS, LAYOUTS, formatLayoutLabel, type Focus } from '../domain/focus'

export type SessionInputMode = 'multiple-choice' | 'typed'

export interface SessionConfig {
  length: number
  focus: Focus
  inputMode: SessionInputMode
}

interface SessionSetupProps {
  defaultConfig: SessionConfig
  onStart: (config: SessionConfig) => void
  onCancel: () => void
}

const LENGTH_OPTIONS = [5, 10, 15, 20, 30]

function focusToOptionValue(focus: Focus): string {
  return focus ? `${focus.type}:${focus.value}` : 'all'
}

function optionValueToFocus(value: string): Focus {
  if (value === 'all') return null
  const [type, focusValue] = value.split(':') as ['continent' | 'layout', string]
  return type === 'continent'
    ? { type, value: focusValue as Continent }
    : { type, value: focusValue as FlagLayout }
}

export function SessionSetup({ defaultConfig, onStart, onCancel }: SessionSetupProps) {
  const [length, setLength] = useState(defaultConfig.length)
  const [focus, setFocus] = useState<Focus>(defaultConfig.focus)
  const [inputMode, setInputMode] = useState<SessionInputMode>(defaultConfig.inputMode)

  function handleSubmit() {
    onStart({ length, focus, inputMode })
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <h2 className="text-xl font-semibold">Start a session</h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="session-length" className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Number of flags
        </label>
        <select
          id="session-length"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 font-medium focus:outline-none dark:border-gray-700 dark:bg-gray-900"
        >
          {LENGTH_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="session-focus" className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Focus area
        </label>
        <select
          id="session-focus"
          value={focusToOptionValue(focus)}
          onChange={(e) => setFocus(optionValueToFocus(e.target.value))}
          className="w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 font-medium capitalize focus:outline-none dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="all">All flags</option>
          <optgroup label="Region">
            {CONTINENTS.map((c) => (
              <option key={c} value={`continent:${c}`}>
                {c}
              </option>
            ))}
          </optgroup>
          <optgroup label="Flag style">
            {LAYOUTS.map((l) => (
              <option key={l} value={`layout:${l}`}>
                {formatLayoutLabel(l)}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Answer mode</span>
        <div className="flex gap-2">
          <button
            type="button"
            aria-pressed={inputMode === 'multiple-choice'}
            onClick={() => setInputMode('multiple-choice')}
            className={`flex-1 rounded-lg border-2 px-4 py-2.5 font-medium transition-colors ${
              inputMode === 'multiple-choice'
                ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-700'
            }`}
          >
            Multiple choice
          </button>
          <button
            type="button"
            aria-pressed={inputMode === 'typed'}
            onClick={() => setInputMode('typed')}
            className={`flex-1 rounded-lg border-2 px-4 py-2.5 font-medium transition-colors ${
              inputMode === 'typed'
                ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-700'
            }`}
          >
            Type the answer
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-lg bg-gray-900 px-6 py-2.5 font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
        >
          Start
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border-2 border-gray-300 px-6 py-2.5 font-medium hover:border-gray-400 dark:border-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
