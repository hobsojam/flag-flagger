import { useState, type FormEvent } from 'react'
import { Flag } from './components/Flag'
import { useProgress } from './hooks/useProgress'
import { useStats } from './hooks/useStats'
import { isCorrectGuess } from './lib/match'
import { buildQuestion, type Question } from './lib/quiz'

type Choice = { code: string; isCorrect: boolean } | null
type Mode = 'multiple-choice' | 'typed'

function App() {
  const { nextFlag, recordAnswer: recordProgress } = useProgress()
  const [question, setQuestion] = useState<Question>(() => buildQuestion(nextFlag()))
  const [choice, setChoice] = useState<Choice>(null)
  const [mode, setMode] = useState<Mode>('multiple-choice')
  const [guess, setGuess] = useState('')
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

  function handleGuessSubmit(e: FormEvent) {
    e.preventDefault()
    if (choice || !guess.trim()) return
    const isCorrect = isCorrectGuess(guess, question.answer)
    setChoice({ code: question.answer.code, isCorrect })
    recordStats(isCorrect)
    recordProgress(question.answer.code, isCorrect)
  }

  function handleNext() {
    setChoice(null)
    setGuess('')
    setQuestion(buildQuestion(nextFlag()))
  }

  function handleModeChange(next: Mode) {
    setMode(next)
    setChoice(null)
    setGuess('')
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-xl flex-col items-center gap-6 px-4 py-10">
      <header className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Flag Flagger</h1>
        <button
          onClick={reset}
          className="text-sm text-gray-500 underline decoration-dotted hover:text-gray-800"
        >
          Reset stats
        </button>
      </header>

      <dl className="grid w-full grid-cols-4 gap-2 text-center">
        <Stat label="Answered" value={stats.answered} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Streak" value={stats.streak} />
        <Stat label="Best" value={stats.bestStreak} />
      </dl>

      <div className="flex gap-2">
        <ModeButton active={mode === 'multiple-choice'} onClick={() => handleModeChange('multiple-choice')}>
          Multiple choice
        </ModeButton>
        <ModeButton active={mode === 'typed'} onClick={() => handleModeChange('typed')}>
          Type the answer
        </ModeButton>
      </div>

      <div className="w-full">
        <Flag code={question.answer.code} label="Which country is this?" />
      </div>

      {mode === 'multiple-choice' ? (
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
      ) : (
        <form onSubmit={handleGuessSubmit} className="flex w-full flex-col gap-3">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={!!choice}
            autoFocus
            placeholder="Type the country name..."
            className={`w-full rounded-lg border-2 px-4 py-3 font-medium transition-colors focus:outline-none ${
              choice
                ? choice.isCorrect
                  ? 'border-green-500 bg-green-50 dark:bg-green-950'
                  : 'border-red-500 bg-red-50 dark:bg-red-950'
                : 'border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700'
            }`}
          />
          {choice && !choice.isCorrect && (
            <p className="text-sm text-gray-500">
              Correct answer: <span className="font-medium">{question.answer.name}</span>
            </p>
          )}
          {!choice && (
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-6 py-2 font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
            >
              Submit
            </button>
          )}
        </form>
      )}

      <div className="h-10">
        {choice && (
          <button
            onClick={handleNext}
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

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
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
