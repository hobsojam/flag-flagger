import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Flag } from './components/Flag'
import { MasteryGrid } from './components/MasteryGrid'
import { SessionSummary } from './components/SessionSummary'
import { countries } from './data/countries'
import { summarizeSession } from './domain/session'
import { useProgress, type SelectionMode } from './hooks/useProgress'
import { SESSION_LENGTH, useSession } from './hooks/useSession'
import { useStats } from './hooks/useStats'
import { isCorrectGuess } from './lib/match'
import { prefetchFlagAssets } from './lib/prefetchFlags'
import { buildQuestion, type Question } from './lib/quiz'

type Choice = { code: string; isCorrect: boolean } | null
type View = 'quiz' | 'progress'
type RenderMode = 'flag-to-name' | 'name-to-flag'
type InputMode = 'multiple-choice' | 'typed'

function App() {
  const { progress, nextFlag, recordAnswer: recordProgress } = useProgress()
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('adaptive')
  const [question, setQuestion] = useState<Question>(() =>
    buildQuestion(nextFlag(selectionMode)),
  )
  const [choice, setChoice] = useState<Choice>(null)
  const [view, setView] = useState<View>('quiz')
  const [renderMode, setRenderMode] = useState<RenderMode>('flag-to-name')
  const [inputMode, setInputMode] = useState<InputMode>('multiple-choice')
  const [guess, setGuess] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const { stats, recordAnswer: recordStats, reset } = useStats()
  const session = useSession()

  const accuracy =
    stats.answered === 0 ? 0 : Math.round((stats.correct / stats.answered) * 100)

  useEffect(() => {
    // Runs once, off the critical path — warms the cache for flags not
    // inlined into the CSS bundle so they're less likely to show blank
    // the first time the quiz picks one.
    const schedule = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200))
    schedule(prefetchFlagAssets)
  }, [])

  function handleAnswer(code: string) {
    if (choice) return // already answered this question
    const isCorrect = code === question.answer.code
    setChoice({ code, isCorrect })
    recordStats(isCorrect)
    recordProgress(question.answer.id, isCorrect)
    if (session.active) session.recordAnswer(question.answer.id, isCorrect)
  }

  function handleGuessSubmit(e: FormEvent) {
    e.preventDefault()
    if (choice || !guess.trim()) return
    const isCorrect = isCorrectGuess(guess, question.answer)
    setChoice({ code: question.answer.code, isCorrect })
    recordStats(isCorrect)
    recordProgress(question.answer.id, isCorrect)
    if (session.active) session.recordAnswer(question.answer.id, isCorrect)
  }

  function handleNext(nextSelectionMode: SelectionMode = selectionMode) {
    // The 10th answer already made session.isComplete true, but the user
    // hasn't seen the summary yet — reveal it now instead of fetching
    // another question, so the feedback for that last flag stays visible
    // until they choose to move on.
    if (session.isComplete) {
      setShowSummary(true)
      return
    }
    setChoice(null)
    setGuess('')
    setQuestion(buildQuestion(nextFlag(nextSelectionMode)))
  }

  function toggleSelectionMode() {
    const next: SelectionMode = selectionMode === 'adaptive' ? 'weak' : 'adaptive'
    setSelectionMode(next)
    handleNext(next)
  }

  function startSession() {
    session.start()
    setShowSummary(false)
    setChoice(null)
    setGuess('')
    setQuestion(buildQuestion(nextFlag(selectionMode)))
  }

  function endSession() {
    session.stop()
    setShowSummary(false)
    setChoice(null)
    setGuess('')
    setQuestion(buildQuestion(nextFlag(selectionMode)))
  }

  function handleRenderModeChange(next: RenderMode) {
    if (next === renderMode) return
    setRenderMode(next)
    setChoice(null)
    setGuess('')
  }

  function handleInputModeChange(next: InputMode) {
    if (next === inputMode) return
    setInputMode(next)
    setChoice(null)
    setGuess('')
  }

  const showMultipleChoice = renderMode === 'name-to-flag' || inputMode === 'multiple-choice'

  const feedback = choice
    ? choice.isCorrect
      ? `Correct! ${question.answer.name}.`
      : `Incorrect. The correct answer is ${question.answer.name}.`
    : ''

  return (
    <div className="mx-auto flex min-h-svh max-w-xl flex-col items-center gap-6 px-4 py-10">
      <header className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h1 className="whitespace-nowrap text-xl font-semibold sm:text-2xl">Flag Flagger</h1>
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
          <button
            onClick={() => (session.active ? endSession() : startSession())}
            className="rounded px-1 py-1.5 text-sm text-gray-500 underline decoration-dotted hover:text-gray-800"
          >
            {session.active ? 'End session' : 'Start session'}
          </button>
          <button
            onClick={toggleSelectionMode}
            className="rounded px-1 py-1.5 text-sm text-gray-500 underline decoration-dotted hover:text-gray-800"
          >
            {selectionMode === 'adaptive' ? 'Practice weak flags' : 'Back to normal practice'}
          </button>
          <button
            onClick={() => setView(view === 'quiz' ? 'progress' : 'quiz')}
            className="rounded px-1 py-1.5 text-sm text-gray-500 underline decoration-dotted hover:text-gray-800"
          >
            {view === 'quiz' ? 'View progress' : 'Back to quiz'}
          </button>
          <button
            onClick={reset}
            className="rounded px-1 py-1.5 text-sm text-gray-500 underline decoration-dotted hover:text-gray-800"
          >
            Reset stats
          </button>
        </div>
      </header>

      <main className="flex w-full flex-col items-center gap-6">
        {view === 'quiz' && (
          <>
            {selectionMode === 'weak' && (
              <p className="-mt-4 text-sm text-gray-500">Practicing your weakest flags only.</p>
            )}
            {session.active && (
              <p className="-mt-4 text-sm text-gray-500">
                Session: {session.answers.length}/{SESSION_LENGTH}
              </p>
            )}

            <div className="flex flex-wrap justify-center gap-2">
              <ModeButton
                active={renderMode === 'flag-to-name'}
                onClick={() => handleRenderModeChange('flag-to-name')}
              >
                Flag → Name
              </ModeButton>
              <ModeButton
                active={renderMode === 'name-to-flag'}
                onClick={() => handleRenderModeChange('name-to-flag')}
              >
                Name → Flag
              </ModeButton>
              {renderMode === 'flag-to-name' && (
                <>
                  <ModeButton
                    active={inputMode === 'multiple-choice'}
                    onClick={() => handleInputModeChange('multiple-choice')}
                  >
                    Multiple choice
                  </ModeButton>
                  <ModeButton
                    active={inputMode === 'typed'}
                    onClick={() => handleInputModeChange('typed')}
                  >
                    Type the answer
                  </ModeButton>
                </>
              )}
            </div>
          </>
        )}

        <dl className="grid w-full grid-cols-4 gap-2 text-center">
          <Stat label="Answered" value={stats.answered} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
          <Stat label="Streak" value={stats.streak} />
          <Stat label="Best" value={stats.bestStreak} />
        </dl>

        {view === 'progress' ? (
          <MasteryGrid progress={progress} />
        ) : showSummary ? (
          <SessionSummary
            summary={summarizeSession(session.answers, countries)}
            onPlayAgain={startSession}
            onEndSession={endSession}
          />
        ) : (
          <>
            <p role="status" aria-live="polite" className="sr-only">
              {feedback}
            </p>

            {renderMode === 'flag-to-name' ? (
              <div className="w-full">
                <Flag code={question.answer.code} label="Which country is this?" />
              </div>
            ) : (
              <p className="text-3xl font-semibold">{question.answer.name}</p>
            )}

            {showMultipleChoice ? (
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
                      className={`rounded-lg border-2 transition-colors ${style}`}
                    >
                      {renderMode === 'flag-to-name' ? (
                        <span className="block px-4 py-3 text-left font-medium">{option.name}</span>
                      ) : (
                        <div className="p-2">
                          <Flag code={option.code} label={option.name} />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ) : (
              <form onSubmit={handleGuessSubmit} className="flex w-full flex-col gap-3">
                <label htmlFor="typed-answer" className="sr-only">
                  Country name
                </label>
                <input
                  id="typed-answer"
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
                    className="rounded-lg bg-gray-900 px-6 py-2.5 font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
                  >
                    Submit
                  </button>
                )}
              </form>
            )}

            <div className="h-10">
              {choice && (
                <button
                  onClick={() => handleNext()}
                  autoFocus
                  className="rounded-lg bg-gray-900 px-6 py-2.5 font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
                >
                  {session.isComplete ? 'See summary' : 'Next flag →'}
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-gray-100 py-2 dark:bg-gray-800">
      <dt className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">
        {label}
      </dt>
      <dd className="text-lg font-semibold">{value}</dd>
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
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  )
}

export default App
