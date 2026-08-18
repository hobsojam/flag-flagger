import type { GroupStat, SessionSummary as SessionSummaryData } from '../domain/session'

interface SessionSummaryProps {
  summary: SessionSummaryData
  onPlayAgain: () => void
  onEndSession: () => void
}

function formatLabel(group: GroupStat): string {
  const label = group.dimension === 'layout' ? group.key.replace(/-/g, ' ') : group.key
  return `${label} (${Math.round(group.accuracy * 100)}%, ${group.correct}/${group.total})`
}

export function SessionSummary({ summary, onPlayAgain, onEndSession }: SessionSummaryProps) {
  const accuracyPercent = Math.round(summary.accuracy * 100)

  return (
    <div className="flex w-full flex-col items-center gap-6 text-center">
      <div>
        <h2 className="text-2xl font-semibold">Session complete</h2>
        <p className="text-gray-500">
          {summary.correct}/{summary.total} correct ({accuracyPercent}%)
        </p>
      </div>

      {(summary.strongest || summary.weakest) && (
        <div className="flex flex-col gap-1 text-sm">
          {summary.strongest && (
            <p>
              Strongest: <span className="font-medium">{formatLabel(summary.strongest)}</span>
            </p>
          )}
          {summary.weakest && (
            <p>
              Could improve: <span className="font-medium">{formatLabel(summary.weakest)}</span>
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onPlayAgain}
          className="rounded-lg bg-gray-900 px-6 py-2.5 font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
        >
          Play again
        </button>
        <button
          onClick={onEndSession}
          className="rounded-lg border-2 border-gray-300 px-6 py-2.5 font-medium hover:border-gray-400 dark:border-gray-700"
        >
          End session
        </button>
      </div>
    </div>
  )
}
