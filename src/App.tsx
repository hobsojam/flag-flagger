import { useState } from 'react'
import { Flag } from './components/Flag'
import { useProgress, type QuizMode } from './hooks/useProgress'
import { useStats } from './hooks/useStats'
import { buildQuestion, type Question } from './lib/quiz'

type Choice = { code: string; isCorrect: boolean } | null

function App() {
  const { nextFlag, recordAnswer: recordProgress } = useProgress()
  const [mode, setMode] = useState<QuizMode>('adaptive')
  const [question, setQuestion] = useState<Question>(() => buildQuestion(nextFlag(mode)))
  const [choice, setChoice] = useState<Choice>(null)
  const { stats, recordAnswer: recordStats, reset } = useStats()

  const accuracy =
    stats.answered === 0 ? 0 : Math.round((stats.correct / stats.answered) * 100)

  function handleAnswer(code: string) {
    if (choice) return // already answered this question
    const isCorrect = code === question.answer.code
    setChoice({ code, isCorrect })
    recordStats(isCorrect)
    recordProgress(question.answer.code, isCorrect)
  }

  function handleNext(nextMode: QuizMode = mode) {
    setChoice(null)
    setQuestion(buildQuestion(nextFlag(nextMode)))
  }

  function toggleMode() {
    const nextMode: QuizMode = mode === 'adaptive' ? 'weak' : 'adaptive'
    setMode(nextMode)
    handleNext(nextMode)
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-xl flex-col items-center gap-6 px-4 py-10">
      <header className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Flag Flagger</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMode}
            className="text-sm text-gray-500 underline decoration-dotted hover:text-gray-800"
          >
            {mode === 'adaptive' ? 'Practice weak flags' : 'Back to normal practice'}
          </button>
          <button
            onClick={reset}
            className="text-sm text-gray-500 underline decoration-dotted hover:text-gray-800"
          >
            Reset stats
          </button>
        </div>
      </header>

      {mode === 'weak' && (
        <p className="-mt-4 text-sm text-gray-500">
          Practicing your weakest flags only.
        </p>
      )}

      <dl className="grid w-full grid-cols-4 gap-2 text-center">
        <Stat label="Answered" value={stats.answered} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Streak" value={stats.streak} />
        <Stat label="Best" value={stats.bestStreak} />
      </dl>

      <div className="w-full">
        <Flag code={question.answer.code} label="Which country is this?" />
      </div>

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((option) => {
          const isSelected = choice?.code === option.code
          const isAnswer = choice && option.code === question.answer.code

          let style =
            'border-gray-300 bg-white hover:border-gray-400 dark:bg-gray-900 dark:border-gray-700'
          if (choice) {
            if (isAnswer) {
              style = 'border-green-500 bg-green-50 dark:bg-green-950'
            } else if (isSelected) {
              style = 'border-red-500 bg-red-50 dark:bg-red-950'
            } else {
              style = 'border-gray-200 opacity-60 dark:border-gray-800'
            }
          }

          return (
            <button
              key={option.code}
              onClick={() => handleAnswer(option.code)}
              disabled={!!choice}
              className={`rounded-lg border-2 px-4 py-3 text-left font-medium transition-colors ${style}`}
            >
              {option.name}
            </button>
          )
        })}
      </div>

      <div className="h-10">
        {choice && (
          <button
            onClick={() => handleNext()}
            autoFocus
            className="rounded-lg bg-gray-900 px-6 py-2 font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
          >
            Next flag →
          </button>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-gray-100 py-2 dark:bg-gray-800">
      <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="text-lg font-semibold">{value}</dd>
    </div>
  )
}

export default App
