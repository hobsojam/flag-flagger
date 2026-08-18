// Generates src/data/countries.ts by combining:
//  - the curated code/name list below (SEED)
//  - continent + area, fetched from the mledoze/countries public dataset
//  - colorCount, computed from the flag-icons SVG each country already ships
//  - layout, auto-detected from SVG rect geometry for simple striped flags,
//    with a manually curated override list for cross/canton/diagonal/emblem
//    designs that geometry alone can't reliably classify.
//
// Re-run with: node scripts/generate-flag-metadata.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const FLAGS_DIR = path.join(ROOT, 'node_modules/flag-icons/flags/4x3')
const OUTPUT = path.join(ROOT, 'src/data/countries.ts')

const SEED = [
  { code: 'af', name: 'Afghanistan' },
  { code: 'al', name: 'Albania' },
  { code: 'dz', name: 'Algeria' },
  { code: 'ad', name: 'Andorra' },
  { code: 'ao', name: 'Angola' },
  { code: 'ag', name: 'Antigua and Barbuda' },
  { code: 'ar', name: 'Argentina' },
  { code: 'am', name: 'Armenia' },
  { code: 'au', name: 'Australia' },
  { code: 'at', name: 'Austria' },
  { code: 'az', name: 'Azerbaijan' },
  { code: 'bs', name: 'Bahamas' },
  { code: 'bh', name: 'Bahrain' },
  { code: 'bd', name: 'Bangladesh' },
  { code: 'bb', name: 'Barbados' },
  { code: 'by', name: 'Belarus' },
  { code: 'be', name: 'Belgium' },
  { code: 'bz', name: 'Belize' },
  { code: 'bj', name: 'Benin' },
  { code: 'bt', name: 'Bhutan' },
  { code: 'bo', name: 'Bolivia' },
  { code: 'ba', name: 'Bosnia and Herzegovina' },
  { code: 'bw', name: 'Botswana' },
  { code: 'br', name: 'Brazil' },
  { code: 'bn', name: 'Brunei' },
  { code: 'bg', name: 'Bulgaria' },
  { code: 'bf', name: 'Burkina Faso' },
  { code: 'bi', name: 'Burundi' },
  { code: 'cv', name: 'Cabo Verde' },
  { code: 'kh', name: 'Cambodia' },
  { code: 'cm', name: 'Cameroon' },
  { code: 'ca', name: 'Canada' },
  { code: 'cf', name: 'Central African Republic' },
  { code: 'td', name: 'Chad' },
  { code: 'cl', name: 'Chile' },
  { code: 'cn', name: 'China' },
  { code: 'co', name: 'Colombia' },
  { code: 'km', name: 'Comoros' },
  { code: 'cg', name: 'Congo' },
  { code: 'cd', name: 'DR Congo' },
  { code: 'cr', name: 'Costa Rica' },
  { code: 'ci', name: "Cote d'Ivoire" },
  { code: 'hr', name: 'Croatia' },
  { code: 'cu', name: 'Cuba' },
  { code: 'cy', name: 'Cyprus' },
  { code: 'cz', name: 'Czechia' },
  { code: 'dk', name: 'Denmark' },
  { code: 'dj', name: 'Djibouti' },
  { code: 'dm', name: 'Dominica' },
  { code: 'do', name: 'Dominican Republic' },
  { code: 'ec', name: 'Ecuador' },
  { code: 'eg', name: 'Egypt' },
  { code: 'sv', name: 'El Salvador' },
  { code: 'gq', name: 'Equatorial Guinea' },
  { code: 'er', name: 'Eritrea' },
  { code: 'ee', name: 'Estonia' },
  { code: 'sz', name: 'Eswatini' },
  { code: 'et', name: 'Ethiopia' },
  { code: 'fj', name: 'Fiji' },
  { code: 'fi', name: 'Finland' },
  { code: 'fr', name: 'France' },
  { code: 'ga', name: 'Gabon' },
  { code: 'gm', name: 'Gambia' },
  { code: 'ge', name: 'Georgia' },
  { code: 'de', name: 'Germany' },
  { code: 'gh', name: 'Ghana' },
  { code: 'gr', name: 'Greece' },
  { code: 'gd', name: 'Grenada' },
  { code: 'gt', name: 'Guatemala' },
  { code: 'gn', name: 'Guinea' },
  { code: 'gw', name: 'Guinea-Bissau' },
  { code: 'gy', name: 'Guyana' },
  { code: 'ht', name: 'Haiti' },
  { code: 'hn', name: 'Honduras' },
  { code: 'hu', name: 'Hungary' },
  { code: 'is', name: 'Iceland' },
  { code: 'in', name: 'India' },
  { code: 'id', name: 'Indonesia' },
  { code: 'ir', name: 'Iran' },
  { code: 'iq', name: 'Iraq' },
  { code: 'ie', name: 'Ireland' },
  { code: 'il', name: 'Israel' },
  { code: 'it', name: 'Italy' },
  { code: 'jm', name: 'Jamaica' },
  { code: 'jp', name: 'Japan' },
  { code: 'jo', name: 'Jordan' },
  { code: 'kz', name: 'Kazakhstan' },
  { code: 'ke', name: 'Kenya' },
  { code: 'ki', name: 'Kiribati' },
  { code: 'kw', name: 'Kuwait' },
  { code: 'kg', name: 'Kyrgyzstan' },
  { code: 'la', name: 'Laos' },
  { code: 'lv', name: 'Latvia' },
  { code: 'lb', name: 'Lebanon' },
  { code: 'ls', name: 'Lesotho' },
  { code: 'lr', name: 'Liberia' },
  { code: 'ly', name: 'Libya' },
  { code: 'li', name: 'Liechtenstein' },
  { code: 'lt', name: 'Lithuania' },
  { code: 'lu', name: 'Luxembourg' },
  { code: 'mg', name: 'Madagascar' },
  { code: 'mw', name: 'Malawi' },
  { code: 'my', name: 'Malaysia' },
  { code: 'mv', name: 'Maldives' },
  { code: 'ml', name: 'Mali' },
  { code: 'mt', name: 'Malta' },
  { code: 'mh', name: 'Marshall Islands' },
  { code: 'mr', name: 'Mauritania' },
  { code: 'mu', name: 'Mauritius' },
  { code: 'mx', name: 'Mexico' },
  { code: 'fm', name: 'Micronesia' },
  { code: 'md', name: 'Moldova' },
  { code: 'mc', name: 'Monaco' },
  { code: 'mn', name: 'Mongolia' },
  { code: 'me', name: 'Montenegro' },
  { code: 'ma', name: 'Morocco' },
  { code: 'mz', name: 'Mozambique' },
  { code: 'mm', name: 'Myanmar' },
  { code: 'na', name: 'Namibia' },
  { code: 'nr', name: 'Nauru' },
  { code: 'np', name: 'Nepal' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'ni', name: 'Nicaragua' },
  { code: 'ne', name: 'Niger' },
  { code: 'ng', name: 'Nigeria' },
  { code: 'kp', name: 'North Korea' },
  { code: 'mk', name: 'North Macedonia' },
  { code: 'no', name: 'Norway' },
  { code: 'om', name: 'Oman' },
  { code: 'pk', name: 'Pakistan' },
  { code: 'pw', name: 'Palau' },
  { code: 'pa', name: 'Panama' },
  { code: 'pg', name: 'Papua New Guinea' },
  { code: 'py', name: 'Paraguay' },
  { code: 'pe', name: 'Peru' },
  { code: 'ph', name: 'Philippines' },
  { code: 'pl', name: 'Poland' },
  { code: 'pt', name: 'Portugal' },
  { code: 'qa', name: 'Qatar' },
  { code: 'ro', name: 'Romania' },
  { code: 'ru', name: 'Russia' },
  { code: 'rw', name: 'Rwanda' },
  { code: 'kn', name: 'Saint Kitts and Nevis' },
  { code: 'lc', name: 'Saint Lucia' },
  { code: 'vc', name: 'Saint Vincent and the Grenadines' },
  { code: 'ws', name: 'Samoa' },
  { code: 'sm', name: 'San Marino' },
  { code: 'st', name: 'Sao Tome and Principe' },
  { code: 'sa', name: 'Saudi Arabia' },
  { code: 'sn', name: 'Senegal' },
  { code: 'rs', name: 'Serbia' },
  { code: 'sc', name: 'Seychelles' },
  { code: 'sl', name: 'Sierra Leone' },
  { code: 'sg', name: 'Singapore' },
  { code: 'sk', name: 'Slovakia' },
  { code: 'si', name: 'Slovenia' },
  { code: 'sb', name: 'Solomon Islands' },
  { code: 'so', name: 'Somalia' },
  { code: 'za', name: 'South Africa' },
  { code: 'kr', name: 'South Korea' },
  { code: 'ss', name: 'South Sudan' },
  { code: 'es', name: 'Spain' },
  { code: 'lk', name: 'Sri Lanka' },
  { code: 'sd', name: 'Sudan' },
  { code: 'sr', name: 'Suriname' },
  { code: 'se', name: 'Sweden' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'sy', name: 'Syria' },
  { code: 'tw', name: 'Taiwan' },
  { code: 'tj', name: 'Tajikistan' },
  { code: 'tz', name: 'Tanzania' },
  { code: 'th', name: 'Thailand' },
  { code: 'tl', name: 'Timor-Leste' },
  { code: 'tg', name: 'Togo' },
  { code: 'to', name: 'Tonga' },
  { code: 'tt', name: 'Trinidad and Tobago' },
  { code: 'tn', name: 'Tunisia' },
  { code: 'tr', name: 'Turkey' },
  { code: 'tm', name: 'Turkmenistan' },
  { code: 'tv', name: 'Tuvalu' },
  { code: 'ug', name: 'Uganda' },
  { code: 'ua', name: 'Ukraine' },
  { code: 'ae', name: 'United Arab Emirates' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'us', name: 'United States' },
  { code: 'uy', name: 'Uruguay' },
  { code: 'uz', name: 'Uzbekistan' },
  { code: 'vu', name: 'Vanuatu' },
  { code: 'va', name: 'Vatican City' },
  { code: 've', name: 'Venezuela' },
  { code: 'vn', name: 'Vietnam' },
  { code: 'ye', name: 'Yemen' },
  { code: 'zm', name: 'Zambia' },
  { code: 'zw', name: 'Zimbabwe' },
]

// Layouts that geometry can't reliably infer (crosses, cantons, diagonals,
// central emblems). Anything not listed here falls through to the
// rect-geometry auto-detector, and then to 'other' if that finds nothing.
const MANUAL_LAYOUT = {
  // Nordic / geometric crosses
  dk: 'cross',
  fi: 'cross',
  is: 'cross',
  no: 'cross',
  se: 'cross',
  ch: 'cross',
  ge: 'cross',
  do: 'cross',

  // Plain field + pattern confined to a corner canton
  us: 'canton',
  lr: 'canton',
  au: 'canton',
  nz: 'canton',
  fj: 'canton',
  tv: 'canton',
  ws: 'canton',
  my: 'canton',
  mh: 'canton',

  // Plain field dominated by a single centered symbol
  jp: 'central-emblem',
  bd: 'central-emblem',
  pw: 'central-emblem',
  tr: 'central-emblem',
  tn: 'central-emblem',
  kr: 'central-emblem',
  br: 'central-emblem',
  ne: 'central-emblem',
  bn: 'central-emblem',

  // Diagonal splits/bands
  tz: 'diagonal',
  na: 'diagonal',
  cd: 'diagonal',
  pg: 'diagonal',
  tl: 'diagonal',
  tt: 'diagonal',
  sc: 'diagonal',
  ki: 'diagonal',
  bi: 'diagonal', // white saltire dividing red/green triangles

  // Unique/non-rectangular or genuinely hybrid designs — deliberately 'other'
  np: 'other', // non-rectangular double pennant
  gb: 'other', // union of crosses/saltires, not a simple single cross
  za: 'other', // pall (Y-shape)
  lk: 'other', // lion emblem + hoist-side stripes
  gr: 'other', // canton cross + stripes hybrid
  vu: 'other', // pall (Y-shape); SVG draws it via stroke, geometry parser misses it
}

const CONTINENT_BY_REGION = {
  Africa: 'Africa',
  Asia: 'Asia',
  Europe: 'Europe',
  Oceania: 'Oceania',
}

function toContinent(region, subregion) {
  if (region === 'Americas') {
    return subregion === 'South America' ? 'South America' : 'North America'
  }
  return CONTINENT_BY_REGION[region] ?? 'Asia'
}

// Bounding box per subpath of an SVG path `d` string. Flags are all
// axis-aligned rects, but flag-icons authors them with different command
// styles (relative vs absolute, compound multi-rect fills), so this walks
// the actual path commands rather than pattern-matching one syntax.
function subpathBoxes(d) {
  const tokens = [...d.matchAll(/([MmHhVvLlCcSsQqTtAaZz])([^MmHhVvLlCcSsQqTtAaZz]*)/g)]
  const boxes = []
  let cx = 0
  let cy = 0
  let sx = 0
  let sy = 0
  let box = null

  const extend = (x, y) => {
    if (!box) box = { minX: x, maxX: x, minY: y, maxY: y }
    box.minX = Math.min(box.minX, x)
    box.maxX = Math.max(box.maxX, x)
    box.minY = Math.min(box.minY, y)
    box.maxY = Math.max(box.maxY, y)
  }
  const flush = () => {
    if (box) boxes.push({ w: box.maxX - box.minX, h: box.maxY - box.minY })
    box = null
  }
  const nums = (s) => (s.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []).map(Number)

  for (const [, cmd, argStr] of tokens) {
    const args = nums(argStr)
    const rel = cmd === cmd.toLowerCase()

    if (cmd === 'Z' || cmd === 'z') {
      cx = sx
      cy = sy
      flush()
      continue
    }

    if (cmd === 'M' || cmd === 'm') {
      flush()
      cx = rel ? cx + args[0] : args[0]
      cy = rel ? cy + args[1] : args[1]
      sx = cx
      sy = cy
      extend(cx, cy)
      // Extra coordinate pairs after the first are implicit linetos.
      for (let i = 2; i + 1 < args.length; i += 2) {
        cx = rel ? cx + args[i] : args[i]
        cy = rel ? cy + args[i + 1] : args[i + 1]
        extend(cx, cy)
      }
      continue
    }

    if (cmd === 'H' || cmd === 'h') {
      for (const v of args) {
        cx = rel ? cx + v : v
        extend(cx, cy)
      }
      continue
    }

    if (cmd === 'V' || cmd === 'v') {
      for (const v of args) {
        cy = rel ? cy + v : v
        extend(cx, cy)
      }
      continue
    }

    if (cmd === 'L' || cmd === 'l') {
      for (let i = 0; i + 1 < args.length; i += 2) {
        cx = rel ? cx + args[i] : args[i]
        cy = rel ? cy + args[i + 1] : args[i + 1]
        extend(cx, cy)
      }
      continue
    }

    if (cmd === 'A' || cmd === 'a') {
      // rx ry x-rot large-arc sweep x y — only the trailing x,y is a point.
      for (let i = 0; i + 6 < args.length + 1; i += 7) {
        cx = rel ? cx + args[i + 5] : args[i + 5]
        cy = rel ? cy + args[i + 6] : args[i + 6]
        extend(cx, cy)
      }
      continue
    }

    // C/S/Q/T and anything else: treat remaining numbers as x,y pairs.
    // Approximate (includes control points), fine for a bounding box.
    for (let i = 0; i + 1 < args.length; i += 2) {
      cx = rel ? cx + args[i] : args[i]
      cy = rel ? cy + args[i + 1] : args[i + 1]
      extend(cx, cy)
    }
  }

  flush()
  return boxes
}

function parseRectBoxes(svg) {
  const boxes = []
  for (const pathMatch of svg.matchAll(/<path\b([^>]*)\/?>/g)) {
    const attrs = pathMatch[1]
    const dMatch = attrs.match(/\bd="([^"]+)"/)
    if (!dMatch) continue
    boxes.push(...subpathBoxes(dMatch[1]))
  }
  return boxes
}

function detectLayout(svg) {
  const boxes = parseRectBoxes(svg)
  const horizontalBands = boxes.filter((b) => b.w >= 560 && b.h < 260)
  const verticalBands = boxes.filter((b) => b.h >= 440 && b.w < 260)

  // Bicolor flags are often drawn as a full-canvas background rect plus a
  // single overlay band (e.g. Poland: white background + one red bottom
  // band), rather than two separate half-height rects — that only yields
  // one detectable band, so lower the bar when a full-canvas rect exists.
  const hasFullCanvas = boxes.some((b) => b.w >= 600 && b.h >= 440)
  const threshold = hasFullCanvas ? 1 : 2

  if (horizontalBands.length >= threshold && horizontalBands.length >= verticalBands.length) {
    return 'horizontal-stripes'
  }
  if (verticalBands.length >= threshold && verticalBands.length > horizontalBands.length) {
    return 'vertical-stripes'
  }
  return 'other'
}

const CANVAS_AREA = 640 * 480

// Raw distinct fill() values wildly overcount flags with detailed emblems —
// Mexico's coat of arms alone uses 60+ shading colors in the SVG, which
// isn't what "how many colors is this flag" means to a quiz taker. Instead,
// sum each color's total shape area and only count colors that cover a
// visually meaningful fraction of the flag, so fine emblem shading drops
// out but genuine field/stripe/canton colors survive.
function countColors(svg) {
  const areaByColor = new Map()
  const add = (fill, area) => {
    const value = fill.toLowerCase()
    if (value === 'none') return
    areaByColor.set(value, (areaByColor.get(value) ?? 0) + area)
  }

  const pathsById = new Map()

  for (const pathMatch of svg.matchAll(/<path\b([^>]*)\/?>/g)) {
    const attrs = pathMatch[1]
    const dMatch = attrs.match(/\bd="([^"]+)"/)
    if (!dMatch) continue
    const boxes = subpathBoxes(dMatch[1])
    const rawArea = boxes.reduce((sum, b) => sum + b.w * b.h, 0)

    // A stroked line (e.g. the US flag's stripes) has ~zero geometric area
    // of its own — the stroke-width is what makes it visually thick.
    const strokeWidthMatch = attrs.match(/\bstroke-width="([\d.]+)"/)
    const strokeWidth = strokeWidthMatch ? Number(strokeWidthMatch[1]) : 0
    const strokeArea = boxes.reduce(
      (sum, b) => sum + (b.w + strokeWidth) * (b.h + strokeWidth),
      0,
    )

    const fillMatch = attrs.match(/\bfill="([^"]+)"/)
    if (fillMatch) add(fillMatch[1], rawArea)
    const strokeMatch = attrs.match(/\bstroke="([^"]+)"/)
    if (strokeMatch) add(strokeMatch[1], strokeArea)

    const idMatch = attrs.match(/\bid="([^"]+)"/)
    if (idMatch) pathsById.set(idMatch[1], { fill: fillMatch?.[1], rawArea })
  }

  for (const circleMatch of svg.matchAll(/<circle\b([^>]*)\/?>/g)) {
    const attrs = circleMatch[1]
    const fillMatch = attrs.match(/\bfill="([^"]+)"/)
    const rMatch = attrs.match(/\br="([\d.]+)"/)
    if (!fillMatch || !rMatch) continue
    add(fillMatch[1], Math.PI * Number(rMatch[1]) ** 2)
  }

  // <use> instances (e.g. China/Vanuatu's repeated stars) reference a
  // template path defined once at its native (often tiny) size, then scale
  // it up via a transform matrix — resolve that scale to get real area.
  for (const useMatch of svg.matchAll(/<use\b([^>]*)\/?>/g)) {
    const attrs = useMatch[1]
    const hrefMatch = attrs.match(/(?:xlink:href|href)="#([^"]+)"/)
    const template = hrefMatch && pathsById.get(hrefMatch[1])
    if (!template) continue

    const fillMatch = attrs.match(/\bfill="([^"]+)"/)
    const fill = fillMatch?.[1] ?? template.fill
    if (!fill) continue

    const matrixMatch = attrs.match(
      /matrix\(\s*([\d.-]+)[ ,]+([\d.-]+)[ ,]+([\d.-]+)[ ,]+([\d.-]+)/,
    )
    const scaleMatch = attrs.match(/scale\(\s*([\d.-]+)(?:[ ,]+([\d.-]+))?/)
    let areaScale = 1
    if (matrixMatch) {
      const [, a, b, c, d] = matrixMatch.map(Number)
      areaScale = Math.abs(a * d - b * c)
    } else if (scaleMatch) {
      const sx = Number(scaleMatch[1])
      const sy = scaleMatch[2] !== undefined ? Number(scaleMatch[2]) : sx
      areaScale = Math.abs(sx * sy)
    }

    add(fill, template.rawArea * areaScale)
  }

  const threshold = CANVAS_AREA * 0.03
  return [...areaByColor.values()].filter((area) => area >= threshold).length
}

async function main() {
  const areaRes = await fetch(
    'https://raw.githubusercontent.com/mledoze/countries/master/countries.json',
  )
  const areaData = await areaRes.json()
  const areaByCode = new Map(areaData.map((c) => [c.cca2.toLowerCase(), c]))

  const entries = SEED.map(({ code, name }) => {
    const svg = readFileSync(path.join(FLAGS_DIR, `${code}.svg`), 'utf8')
    const geo = areaByCode.get(code)
    if (!geo) throw new Error(`No area/region data for ${code}`)

    return {
      id: `country:${code}`,
      category: 'country',
      code,
      name,
      continent: toContinent(geo.region, geo.subregion),
      colorCount: countColors(svg),
      layout: MANUAL_LAYOUT[code] ?? detectLayout(svg),
      areaKm2: Math.round(geo.area),
    }
  })

  const body = entries
    .map(
      (e) =>
        `  { id: '${e.id}', category: '${e.category}', code: '${e.code}', name: ${JSON.stringify(e.name)}, continent: '${e.continent}', colorCount: ${e.colorCount}, layout: '${e.layout}', areaKm2: ${e.areaKm2} },`,
    )
    .join('\n')

  const output = `export type Continent =
  | 'Africa'
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'Oceania'
  | 'South America'

export type FlagLayout =
  | 'horizontal-stripes'
  | 'vertical-stripes'
  | 'diagonal'
  | 'cross'
  | 'canton'
  | 'central-emblem'
  | 'other'

export interface Country {
  id: string // globally unique across flag categories, e.g. 'country:us'
  category: 'country' // more categories (e.g. 'us-state') may join this union later
  code: string // ISO 3166-1 alpha-2, lowercase, matches flag-icons class fi-<code>
  name: string
  continent: Continent
  colorCount: number
  layout: FlagLayout
  areaKm2: number
  tags?: string[]
}

// Generated by scripts/generate-flag-metadata.mjs — do not hand-edit the
// id/category/continent/colorCount/layout/areaKm2 fields, re-run the script instead.
export const countries: Country[] = [
${body}
]
`

  writeFileSync(OUTPUT, output)
  console.log(`Wrote ${entries.length} countries to ${path.relative(ROOT, OUTPUT)}`)

  const layoutCounts = {}
  for (const e of entries) layoutCounts[e.layout] = (layoutCounts[e.layout] ?? 0) + 1
  console.log('Layout distribution:', layoutCounts)
}

main()
