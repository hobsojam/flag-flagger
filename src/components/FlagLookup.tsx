import { useState } from 'react'
import { countries, type Country } from '../data/countries'
import { fetchFlagSummary, type FlagSummary } from '../lib/wikipedia'
import { Flag } from './Flag'

type SummaryState = 'loading' | 'error' | FlagSummary

export function FlagLookup() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Country | null>(null)
  const [summary, setSummary] = useState<SummaryState | null>(null)

  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  async function selectCountry(country: Country) {
    setSelected(country)
    setSummary('loading')
    const result = await fetchFlagSummary(country.name)
    setSummary(result ?? 'error')
  }

  if (selected) {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => {
            setSelected(null)
            setSummary(null)
          }}
          className="self-start text-sm text-gray-500 underline decoration-dotted hover:text-gray-800"
        >
          ← Back to list
        </button>

        <div className="w-full">
          <Flag code={selected.code} label={selected.name} />
        </div>
        <h2 className="text-2xl font-semibold">{selected.name}</h2>

        <div role="status" aria-live="polite" className="w-full text-center">
          {summary === 'loading' && <p className="text-sm text-gray-500">Loading…</p>}
          {summary === 'error' && (
            <p className="text-sm text-gray-500">Couldn't load information for this flag.</p>
          )}
          {summary && typeof summary === 'object' && (
            <div className="flex flex-col gap-2">
              <p className="text-left text-sm">{summary.extract}</p>
              <p className="text-xs text-gray-500">
                Source:{' '}
                <a
                  href={summary.articleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Wikipedia
                </a>
                {' · '}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  CC BY-SA 4.0
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <label htmlFor="lookup-search" className="sr-only">
        Search countries
      </label>
      <input
        id="lookup-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search countries…"
        className="w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 font-medium focus:outline-none dark:border-gray-700 dark:bg-gray-900"
      />

      <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-4">
        {filtered.map((country) => (
          <button
            key={country.id}
            type="button"
            onClick={() => selectCountry(country)}
            className="flex flex-col items-center gap-1 rounded-lg border-2 border-gray-200 p-2 text-center hover:border-gray-400 dark:border-gray-800"
          >
            <Flag code={country.code} label={country.name} />
            <span className="text-xs font-medium">{country.name}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-4 text-center text-sm text-gray-500">
            No countries match "{query}".
          </p>
        )}
      </div>
    </div>
  )
}
