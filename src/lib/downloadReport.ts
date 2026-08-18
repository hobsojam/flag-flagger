import { formatSlugLabel } from '../domain/focus'
import type { FlagStat, GroupStat, ProgressReport } from '../domain/report'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function pct(value: number): string {
  return `${Math.round(value * 100)}%`
}

function groupRow(group: GroupStat): string {
  const label = escapeHtml(formatSlugLabel(group.key))
  const note = group.lowSample ? ' <span class="note">low sample</span>' : ''
  return `<tr>
    <td class="key">${label}${note}</td>
    <td>${group.practicedCount}/${group.flagCount}</td>
    <td>${group.seen === 0 ? '—' : pct(group.accuracy)}</td>
    <td>${pct(group.avgConfidence)}</td>
  </tr>`
}

function groupTable(title: string, groups: GroupStat[]): string {
  if (groups.length === 0) return ''
  return `<section>
    <h2>${escapeHtml(title)}</h2>
    <table>
      <thead>
        <tr><th>Category</th><th>Practiced</th><th>Accuracy</th><th>Avg. confidence</th></tr>
      </thead>
      <tbody>${groups.map(groupRow).join('')}</tbody>
    </table>
  </section>`
}

function flagRow(flag: FlagStat): string {
  return `<tr>
    <td class="key">${escapeHtml(flag.name)}</td>
    <td>${flag.correct}/${flag.seen}</td>
    <td>${pct(flag.confidence)}</td>
  </tr>`
}

function flagTable(title: string, flags: FlagStat[]): string {
  if (flags.length === 0) return ''
  return `<section>
    <h2>${escapeHtml(title)}</h2>
    <table>
      <thead>
        <tr><th>Flag</th><th>Correct</th><th>Confidence</th></tr>
      </thead>
      <tbody>${flags.map(flagRow).join('')}</tbody>
    </table>
  </section>`
}

function neverPracticedSection(flags: FlagStat[]): string {
  if (flags.length === 0) return ''
  return `<section>
    <h2>Never practiced (${flags.length})</h2>
    <p class="unpracticed">${flags.map((f) => escapeHtml(f.name)).join(', ')}</p>
  </section>`
}

/** Pure HTML string builder — no DOM access, safe to unit test directly. */
export function renderReportHtml(report: ProgressReport): string {
  const generated = new Date(report.generatedAt).toLocaleString()

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Flag Flagger — Progress Report</title>
<style>
  :root { color-scheme: light dark; }
  body {
    font-family: system-ui, -apple-system, sans-serif;
    max-width: 720px;
    margin: 2.5rem auto;
    padding: 0 1.25rem;
    line-height: 1.5;
    color: #1f2937;
    background: #fff;
  }
  @media (prefers-color-scheme: dark) {
    body { color: #e5e7eb; background: #111827; }
    table { border-color: #374151 !important; }
    th, td { border-color: #374151 !important; }
    .card { background: #1f2937 !important; }
  }
  h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
  .subtitle { color: #6b7280; margin-top: 0; margin-bottom: 2rem; }
  h2 { font-size: 1.05rem; margin-top: 2rem; margin-bottom: 0.5rem; }
  .overview { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1.5rem; }
  .card { background: #f3f4f6; border-radius: 0.5rem; padding: 0.75rem; text-align: center; }
  .card .label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.03em; color: #6b7280; }
  .card .value { font-size: 1.25rem; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th, td { text-align: left; padding: 0.4rem 0.5rem; border-bottom: 1px solid #e5e7eb; }
  th { font-weight: 600; color: #6b7280; font-size: 0.75rem; text-transform: uppercase; }
  .key { text-transform: capitalize; }
  .note { font-size: 0.75rem; color: #9ca3af; text-transform: none; }
  .unpracticed { color: #6b7280; font-size: 0.9rem; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
  <h1>Flag Flagger — Progress Report</h1>
  <p class="subtitle">Generated ${generated}</p>

  <div class="overview">
    <div class="card"><div class="label">Flags practiced</div><div class="value">${report.practicedFlags}/${report.totalFlags}</div></div>
    <div class="card"><div class="label">Answers given</div><div class="value">${report.totalAnswers}</div></div>
    <div class="card"><div class="label">Accuracy</div><div class="value">${pct(report.overallAccuracy)}</div></div>
    <div class="card"><div class="label">Avg. confidence</div><div class="value">${pct(report.overallConfidence)}</div></div>
  </div>

  ${groupTable('By continent', report.byContinent)}
  ${groupTable('By flag layout', report.byLayout)}
  ${groupTable('By content', report.byTag)}
  ${flagTable('Strongest flags', report.strongestFlags)}
  ${flagTable('Weakest flags', report.weakestFlags)}
  ${neverPracticedSection(report.neverPracticed)}
</body>
</html>
`
}

function reportFilename(generatedAt: number): string {
  const iso = new Date(generatedAt).toISOString().slice(0, 10)
  return `flag-flagger-report-${iso}.html`
}

/** Triggers a browser download of the report as a standalone HTML file. */
export function downloadReport(report: ProgressReport): void {
  const html = renderReportHtml(report)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = reportFilename(report.generatedAt)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
