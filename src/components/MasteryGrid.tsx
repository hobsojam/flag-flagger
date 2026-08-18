import { countries } from '../data/countries'
import { createRecord, effectiveConfidence, type ProgressMap } from '../domain/progress'
import { Flag } from './Flag'

interface MasteryGridProps {
  progress: ProgressMap
}

function tierClass(seen: number, confidence: number): string {
  if (seen === 0) return 'border-gray-300 dark:border-gray-700'
  if (confidence >= 0.7) return 'border-green-500'
  if (confidence >= 0.3) return 'border-yellow-500'
  return 'border-red-500'
}

export function MasteryGrid({ progress }: MasteryGridProps) {
  const now = Date.now()

  return (
    <div className="grid w-full grid-cols-6 gap-2 sm:grid-cols-8">
      {countries.map((country) => {
        const record = progress[country.code] ?? createRecord(country.code)
        const confidence = effectiveConfidence(record, now)
        const status =
          record.seen === 0 ? 'not seen yet' : `${Math.round(confidence * 100)}% confidence`

        return (
          <div
            key={country.code}
            title={`${country.name} — ${status}`}
            className={`overflow-hidden rounded border-2 ${tierClass(record.seen, confidence)}`}
          >
            <Flag code={country.code} label={country.name} />
          </div>
        )
      })}
    </div>
  )
}
