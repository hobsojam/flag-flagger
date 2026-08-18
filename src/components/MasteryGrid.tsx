import type { Country } from '../data/countries'
import { createRecord, effectiveConfidence, type ProgressMap } from '../domain/progress'
import { buildProgressReport } from '../domain/report'
import { downloadReport } from '../lib/downloadReport'
import { Flag } from './Flag'

interface MasteryGridProps {
  readonly progress: ProgressMap
  readonly pool: Country[]
}

function tierClass(seen: number, confidence: number): string {
  if (seen === 0) return 'border-gray-300 dark:border-gray-700'
  if (confidence >= 0.7) return 'border-green-500'
  if (confidence >= 0.3) return 'border-yellow-500'
  return 'border-red-500'
}

export function MasteryGrid({ progress, pool }: MasteryGridProps) {
  const now = Date.now()

  return (
    <div className="flex w-full flex-col gap-3">
      <button
        type="button"
        onClick={() => downloadReport(buildProgressReport(pool, progress, Date.now()))}
        className="self-end rounded px-1 py-1.5 text-sm text-gray-500 underline decoration-dotted hover:text-gray-800"
      >
        Download report
      </button>

      <div className="grid w-full grid-cols-6 items-start gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-[repeat(14,minmax(0,1fr))] 2xl:grid-cols-[repeat(16,minmax(0,1fr))]">
        {pool.map((country) => {
          const record = progress[country.id] ?? createRecord(country.id)
          const confidence = effectiveConfidence(record, now)
          const status =
            record.seen === 0 ? 'not seen yet' : `${Math.round(confidence * 100)}% confidence`

          return (
            <div
              key={country.id}
              title={`${country.name} — ${status}`}
              className={`overflow-hidden rounded border-2 ${tierClass(record.seen, confidence)}`}
            >
              <Flag flag={country} label={country.name} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
