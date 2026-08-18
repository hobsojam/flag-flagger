// One-off authoring tool for adding a historical flag to the app.
//
// flag-icons (the npm package src/data/countries.ts is generated from) ships
// zero historical-flag artwork, so historical entries are sourced
// individually from Wikimedia Commons instead. This script resolves a
// Commons file title to its direct SVG URL + license via the Commons API,
// downloads it into public/historical-flags/<code>.svg, and prints a
// Country-shaped object skeleton to hand-edit and paste into
// src/data/historicalFlags.ts.
//
// It does NOT search or guess titles — pass the exact title only after
// verifying by hand (browse https://commons.wikimedia.org/w/index.php?search=<query>)
// that it (a) resolves to a real file, (b) depicts the intended historical
// flag and not a redirect to a current/different flag (this happens more
// often than you'd expect — e.g. "Flag of Czechoslovakia.svg" currently
// redirects to the modern Czech Republic flag), and (c) is public domain or
// otherwise freely licensed. The script prints the resolved license for a
// final manual check; it does not verify license text itself.
//
// Usage: node scripts/fetch-historical-flags.mjs "Flag of the Soviet Union.svg" su

import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, '../public/historical-flags')
const USER_AGENT = 'flag-flagger-research/1.0 (https://github.com/hobsojam/flag-flagger)'
// Matches the lowercase-letters(-digits) convention every existing
// historical `code` follows — also rules out path separators / traversal
// segments, since `code` feeds directly into a filesystem path below.
const CODE_PATTERN = /^[a-z][a-z0-9]*$/

const [, , title, code] = process.argv
if (!title || !code) {
  console.error('Usage: node scripts/fetch-historical-flags.mjs "<exact Commons File: title>" <code>')
  process.exit(1)
}
if (!CODE_PATTERN.test(code)) {
  console.error(`Invalid code "${code}" — must be lowercase letters/digits only (e.g. "su", "css").`)
  process.exit(1)
}

const fileTitle = `File:${title}`
const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url|extmetadata|size&format=json`
const apiRes = await fetch(apiUrl, { headers: { 'User-Agent': USER_AGENT } })
const apiData = await apiRes.json()
const page = Object.values(apiData.query.pages)[0]

if (page.missing !== undefined) {
  console.error(`MISSING: "${title}" does not exist on Commons — search and verify the exact title first.`)
  process.exit(1)
}

const info = page.imageinfo[0]
console.log('Title:', page.title)
console.log('License:', info.extmetadata?.LicenseShortName?.value ?? '(unknown — verify manually)')
console.log('Dimensions:', `${info.width} x ${info.height}`)

const svgRes = await fetch(info.url, { headers: { 'User-Agent': USER_AGENT } })
const svgBody = await svgRes.text()
const outPath = path.resolve(OUT_DIR, `${code}.svg`)
// Defense in depth alongside CODE_PATTERN above: refuse to write outside
// OUT_DIR even if some future change loosens that pattern.
if (!outPath.startsWith(OUT_DIR + path.sep)) {
  console.error(`Refusing to write outside ${OUT_DIR}: ${outPath}`)
  process.exit(1)
}
writeFileSync(outPath, svgBody)
console.log('Saved:', outPath)

const flagName = page.title.replace(/^File:Flag of (the )?/, '').replace(/\.svg$/, '')
console.log(`
Paste into src/data/historicalFlags.ts and fill in the judgment-call fields
(continent/colorCount/layout/tags/areaKm2/aliases/sensitive):
{
  id: 'historical:${code}',
  category: 'historical',
  code: '${code}',
  name: '${flagName}',
  continent: 'TODO',
  colorCount: 0, // TODO
  layout: 'TODO', // horizontal-stripes | vertical-stripes | diagonal | cross | canton | central-emblem | other
  areaKm2: 0, // TODO
  flagRatioW: ${info.width},
  flagRatioH: ${info.height},
  imageUrl: 'historical-flags/${code}.svg',
},
Then add a row to public/historical-flags/ATTRIBUTION.md.
`)
