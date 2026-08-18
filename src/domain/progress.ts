export interface ProgressRecord {
  id: string
  confidence: number // EMA of recent correctness, 0-1
  lastSeenAt: number // epoch ms
  seen: number
  correct: number
}

export type ProgressMap = Record<string, ProgressRecord>

export function createRecord(id: string): ProgressRecord {
  return { id, confidence: 0, lastSeenAt: 0, seen: 0, correct: 0 }
}

export function updateRecord(
  record: ProgressRecord,
  isCorrect: boolean,
  now: number,
): ProgressRecord {
  const sample = isCorrect ? 1 : 0
  const confidence =
    record.seen === 0 ? sample : record.confidence * 0.7 + sample * 0.3

  return {
    ...record,
    confidence,
    lastSeenAt: now,
    seen: record.seen + 1,
    correct: record.correct + (isCorrect ? 1 : 0),
  }
}

/**
 * Confidence decays over time since last seen, modeling forgetting.
 * Well-known flags (high confidence) decay slower than shaky ones.
 */
export function effectiveConfidence(record: ProgressRecord, now: number): number {
  if (record.seen === 0) return 0
  const daysSince = (now - record.lastSeenAt) / (1000 * 60 * 60 * 24)
  const halfLifeDays = 3 + record.confidence * 30
  return record.confidence * Math.exp(-daysSince / halfLifeDays)
}
