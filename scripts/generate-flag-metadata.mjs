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

// Hand-curated alternate names accepted by typed-answer matching (see
// src/lib/match.ts). Not derivable from the SVG or the area dataset, so it
// lives here rather than being computed — keeping it in the generator (like
// MANUAL_LAYOUT) instead of a separate one-off script means a full
// regenerate can't silently wipe it out again.
const ALIASES = {
  cv: ['Cape Verde'],
  cd: ['Democratic Republic of the Congo', 'DRC', 'Congo-Kinshasa'],
  ci: ['Ivory Coast'],
  cz: ['Czech Republic'],
  sz: ['Swaziland'],
  mk: ['Macedonia'],
  tl: ['East Timor'],
  ae: ['UAE'],
  gb: ['UK', 'Great Britain'],
  us: ['USA', 'US', 'United States of America'],
  va: ['Holy See'],
  mm: ['Burma'],
  nl: ['Holland'],
  tr: ['Turkiye', 'Türkiye'],
  kp: ['DPRK', "Democratic People's Republic of Korea"],
  kr: ['Korea', 'Republic of Korea'],
  ba: ['Bosnia'],
  kn: ['St Kitts and Nevis', 'St. Kitts and Nevis', 'St Kitts'],
  lc: ['St Lucia', 'St. Lucia'],
  vc: ['St Vincent and the Grenadines', 'St Vincent', 'St. Vincent'],
  tt: ['Trinidad'],
  ag: ['Antigua'],
  pg: ['PNG'],
  fm: ['Federated States of Micronesia', 'FSM'],
  bn: ['Brunei Darussalam'],
  cg: ['Republic of the Congo', 'Congo-Brazzaville'],
  la: ['Lao PDR'],
  ir: ['Islamic Republic of Iran'],
  sy: ['Syrian Arab Republic'],
  ru: ['Russian Federation'],
  md: ['Republic of Moldova'],
  tz: ['United Republic of Tanzania'],
}

// Real official flag aspect ratios (width:height, small integer units),
// since flag-icons' art is normalized onto a uniform 4:3 (or 1:1 square)
// canvas regardless of each country's actual proportions. Compiled from the
// "List of national flags of sovereign states" Wikipedia article's
// {{sortratio}} template (height listed first there, hence the flip below)
// plus each country's own "Flag of X" article infobox for entries missing
// from that table. Not derivable from the SVG itself, so — like ALIASES —
// this lives in the generator rather than being computed.
const FLAG_RATIOS = {
  ad: [10, 7],
  ae: [2, 1],
  af: [2, 1],
  ag: [3, 2],
  al: [7, 5],
  am: [2, 1],
  ao: [3, 2],
  ar: [8, 5],
  at: [3, 2],
  au: [2, 1],
  az: [2, 1],
  ba: [2, 1],
  bb: [3, 2],
  bd: [5, 3],
  be: [15, 13],
  bf: [3, 2],
  bg: [5, 3],
  bh: [5, 3],
  bi: [5, 3],
  bj: [3, 2],
  bn: [2, 1],
  bo: [22, 15],
  br: [10, 7],
  bs: [2, 1],
  bt: [3, 2],
  bw: [3, 2],
  by: [2, 1],
  bz: [5, 3],
  ca: [2, 1],
  cd: [4, 3],
  cf: [5, 3],
  cg: [3, 2],
  ch: [1, 1],
  ci: [3, 2],
  cl: [3, 2],
  cm: [3, 2],
  cn: [3, 2],
  co: [3, 2],
  cr: [5, 3],
  cu: [2, 1],
  cv: [3, 2],
  cy: [3, 2],
  cz: [3, 2],
  de: [5, 3],
  dj: [3, 2],
  dk: [37, 28],
  dm: [2, 1],
  do: [3, 2],
  dz: [3, 2],
  ec: [3, 2],
  ee: [11, 7],
  eg: [3, 2],
  er: [2, 1],
  es: [3, 2],
  et: [2, 1],
  fi: [18, 11],
  fj: [2, 1],
  fm: [19, 10],
  fr: [3, 2],
  ga: [4, 3],
  gb: [2, 1],
  gd: [5, 3],
  ge: [3, 2],
  gh: [3, 2],
  gm: [3, 2],
  gn: [3, 2],
  gq: [3, 2],
  gr: [3, 2],
  gt: [8, 5],
  gw: [2, 1],
  gy: [5, 3],
  hn: [2, 1],
  hr: [2, 1],
  ht: [5, 3],
  hu: [2, 1],
  id: [3, 2],
  ie: [2, 1],
  il: [11, 8],
  in: [3, 2],
  iq: [3, 2],
  ir: [7, 4],
  is: [25, 18],
  it: [3, 2],
  jm: [2, 1],
  jo: [2, 1],
  jp: [3, 2],
  ke: [3, 2],
  kg: [5, 3],
  kh: [3, 2],
  ki: [2, 1],
  km: [5, 3],
  kn: [3, 2],
  kp: [2, 1],
  kr: [3, 2],
  kw: [2, 1],
  kz: [2, 1],
  la: [3, 2],
  lb: [3, 2],
  lc: [2, 1],
  li: [5, 3],
  lk: [2, 1],
  lr: [19, 10],
  ls: [3, 2],
  lt: [5, 3],
  lu: [5, 3],
  lv: [2, 1],
  ly: [2, 1],
  ma: [3, 2],
  mc: [5, 4],
  md: [2, 1],
  me: [2, 1],
  mg: [3, 2],
  mh: [19, 10],
  mk: [2, 1],
  ml: [3, 2],
  mm: [3, 2],
  mn: [2, 1],
  mr: [3, 2],
  mt: [3, 2],
  mu: [3, 2],
  mv: [3, 2],
  mw: [3, 2],
  mx: [7, 4],
  my: [2, 1],
  mz: [3, 2],
  na: [3, 2],
  ne: [7, 6],
  ng: [2, 1],
  ni: [5, 3],
  nl: [3, 2],
  no: [11, 8],
  np: [4, 3], // non-rectangular pennant shape (~1:1.219 bounding box) -- cropping the padded 4:3 art to that portrait ratio risks mangling the design, so this one keeps the historical box on purpose (see NON_RECTANGULAR below)
  nr: [2, 1],
  nz: [2, 1],
  om: [7, 4],
  pa: [3, 2],
  pe: [3, 2],
  pg: [4, 3],
  ph: [2, 1],
  pk: [3, 2],
  pl: [8, 5],
  pt: [3, 2],
  pw: [8, 5],
  py: [20, 11],
  qa: [28, 11],
  ro: [3, 2],
  rs: [5, 3],
  ru: [3, 2],
  rw: [3, 2],
  sa: [3, 2],
  sb: [2, 1],
  sc: [2, 1],
  sd: [2, 1],
  se: [8, 5],
  sg: [3, 2],
  si: [2, 1],
  sk: [3, 2],
  sl: [3, 2],
  sm: [4, 3],
  sn: [3, 2],
  so: [3, 2],
  sr: [3, 2],
  ss: [2, 1],
  st: [2, 1],
  sv: [5, 3],
  sy: [3, 2],
  sz: [3, 2],
  td: [3, 2],
  tg: [3, 2],
  th: [3, 2],
  tj: [2, 1],
  tl: [2, 1],
  tm: [3, 2],
  tn: [3, 2],
  to: [2, 1],
  tr: [3, 2],
  tt: [5, 3],
  tv: [2, 1],
  tw: [3, 2],
  tz: [3, 2],
  ua: [3, 2],
  ug: [3, 2],
  us: [19, 10],
  uy: [3, 2],
  uz: [2, 1],
  va: [1, 1],
  vc: [3, 2],
  ve: [3, 2],
  vn: [3, 2],
  vu: [3, 2],
  ws: [2, 1],
  ye: [3, 2],
  za: [3, 2],
  zm: [3, 2],
  zw: [2, 1],
}

// Flags whose true shape isn't a rectangle at all, so no aspect ratio can
// represent them — FLAG_RATIOS still gives these a (fallback) rectangle for
// rendering, but nonRectangularFlag documents that it's an approximation.
const NON_RECTANGULAR = new Set(['np'])

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
      // rx ry x-rot large-arc sweep x y. The true extent needs solving the
      // ellipse equation — not worth it here, colorCount only needs to be
      // roughly right. Padding the endpoint by the radii is enough to stop
      // near-complete circles (start ≈ end point) collapsing to ~zero area.
      for (let i = 0; i + 6 < args.length + 1; i += 7) {
        const rx = args[i]
        const ry = args[i + 1]
        cx = rel ? cx + args[i + 5] : args[i + 5]
        cy = rel ? cy + args[i + 6] : args[i + 6]
        extend(cx - rx, cy - ry)
        extend(cx + rx, cy + ry)
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

// Resolves the area multiplier from a transform's scale/matrix component.
// Rotate/translate don't change area; skew and anything else we don't
// bother modeling — colorCount only needs to be roughly right.
function transformScale(transformStr) {
  if (!transformStr) return 1
  const matrixMatch = transformStr.match(
    /matrix\(\s*([\d.-]+)[ ,]+([\d.-]+)[ ,]+([\d.-]+)[ ,]+([\d.-]+)/,
  )
  if (matrixMatch) {
    const [, a, b, c, d] = matrixMatch.map(Number)
    return Math.abs(a * d - b * c)
  }
  const scaleMatch = transformStr.match(/scale\(\s*([\d.-]+)(?:[ ,]+([\d.-]+))?/)
  if (scaleMatch) {
    const sx = Number(scaleMatch[1])
    const sy = scaleMatch[2] !== undefined ? Number(scaleMatch[2]) : sx
    return Math.abs(sx * sy)
  }
  return 1
}

function parseAttrs(attrsStr) {
  const attrs = {}
  for (const m of attrsStr.matchAll(/([\w:-]+)="([^"]*)"/g)) attrs[m[1]] = m[2]
  return attrs
}

// Raw distinct fill() values wildly overcount flags with detailed emblems —
// Mexico's coat of arms alone uses 60+ shading colors in the SVG, which
// isn't what "how many colors is this flag" means to a quiz taker. Instead,
// sum each color's total shape area and only count colors that cover a
// visually meaningful fraction of the flag, so fine emblem shading drops
// out but genuine field/stripe/canton colors survive.
//
// This walks tags in document order tracking two things ancestor <g>
// elements commonly carry that a flat per-tag scan misses entirely:
// inherited fill (e.g. Switzerland's cross is two <path>s with no fill of
// their own inside <g fill="#fff">) and cumulative transform scale (e.g.
// South Korea's trigrams are scaled by an ancestor <g transform=scale(...)>,
// not the <use> element itself). <defs>/<clipPath> subtrees are tracked
// but not counted directly — their contents are template geometry, only
// real once referenced by a <use>.
function countColors(svg) {
  const areaByColor = new Map()
  const add = (fill, area) => {
    if (!fill) return
    const value = fill.toLowerCase()
    if (value === 'none') return
    areaByColor.set(value, (areaByColor.get(value) ?? 0) + area)
  }

  const pathsById = new Map()
  const stack = [{ fill: undefined, scale: 1, hidden: false }]
  const top = () => stack[stack.length - 1]

  const tagRe = /<(\/?)([\w:]+)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>/g
  let match
  while ((match = tagRe.exec(svg))) {
    const [, closing, rawTag, attrsStr, selfClose] = match
    const tag = rawTag.replace(/^svg:/, '')
    const tagLower = tag.toLowerCase()
    const isContainer = tagLower === 'g' || tagLower === 'defs' || tagLower === 'clippath'

    if (closing) {
      if (isContainer && stack.length > 1) stack.pop()
      continue
    }

    const attrs = parseAttrs(attrsStr)

    if (isContainer) {
      const parent = top()
      const frame = {
        fill: attrs.fill ?? parent.fill,
        scale: parent.scale * transformScale(attrs.transform),
        hidden: parent.hidden || tagLower === 'defs' || tagLower === 'clippath',
      }
      if (!selfClose) stack.push(frame)
      continue
    }

    if (tag === 'path' && attrs.d) {
      const boxes = subpathBoxes(attrs.d)
      const rawArea = boxes.reduce((sum, b) => sum + b.w * b.h, 0)
      const fill = attrs.fill ?? top().fill

      if (attrs.id) pathsById.set(attrs.id, { fill, rawArea })
      if (top().hidden) continue

      add(fill, rawArea * top().scale)

      // A stroked line (e.g. the US flag's stripes) has ~zero geometric
      // area of its own — stroke-width is what makes it visually thick.
      if (attrs.stroke) {
        const strokeWidth = Number(attrs['stroke-width'] ?? 0)
        const strokeArea = boxes.reduce(
          (sum, b) => sum + (b.w + strokeWidth) * (b.h + strokeWidth),
          0,
        )
        add(attrs.stroke, strokeArea * top().scale)
      }
      continue
    }

    if (tag === 'circle' && attrs.r) {
      if (top().hidden) continue
      const fill = attrs.fill ?? top().fill
      add(fill, Math.PI * Number(attrs.r) ** 2 * top().scale)
      continue
    }

    if (tag === 'use') {
      const href = attrs['xlink:href'] ?? attrs.href
      const template = href && pathsById.get(href.replace(/^#/, ''))
      if (!template) continue

      const fill = attrs.fill ?? template.fill ?? top().fill
      const areaScale = top().scale * transformScale(attrs.transform)
      add(fill, template.rawArea * areaScale)
      continue
    }
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

    const flagRatio = FLAG_RATIOS[code]
    if (!flagRatio) throw new Error(`No flag ratio for ${code}`)
    const [flagRatioW, flagRatioH] = flagRatio

    return {
      id: `country:${code}`,
      category: 'country',
      code,
      name,
      continent: toContinent(geo.region, geo.subregion),
      colorCount: countColors(svg),
      layout: MANUAL_LAYOUT[code] ?? detectLayout(svg),
      areaKm2: Math.round(geo.area),
      flagRatioW,
      flagRatioH,
      nonRectangularFlag: NON_RECTANGULAR.has(code) || undefined,
      aliases: ALIASES[code],
    }
  })

  const body = entries
    .map((e) => {
      const nonRectangularField = e.nonRectangularFlag ? `, nonRectangularFlag: true` : ''
      const aliasesField = e.aliases ? `, aliases: ${JSON.stringify(e.aliases)}` : ''
      return `  { id: '${e.id}', category: '${e.category}', code: '${e.code}', name: ${JSON.stringify(e.name)}, continent: '${e.continent}', colorCount: ${e.colorCount}, layout: '${e.layout}', areaKm2: ${e.areaKm2}, flagRatioW: ${e.flagRatioW}, flagRatioH: ${e.flagRatioH}${nonRectangularField}${aliasesField} },`
    })
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
  flagRatioW: number // real official flag aspect ratio, e.g. 19/10 for the US
  flagRatioH: number
  nonRectangularFlag?: true // true shape isn't a rectangle at all (e.g. Nepal) — flagRatioW/H is a fallback box, not the real shape
  tags?: string[]
  aliases?: string[] // accepted alternate names for typed-answer matching
}

// Generated by scripts/generate-flag-metadata.mjs — do not hand-edit the
// id/category/continent/colorCount/layout/areaKm2/flagRatioW/flagRatioH/nonRectangularFlag/aliases
// fields, re-run the script instead.
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
