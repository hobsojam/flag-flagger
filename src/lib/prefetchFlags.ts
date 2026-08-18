import { countries } from '../data/countries'

/**
 * Warms the browser's HTTP cache for flag background-images that aren't
 * small enough to be inlined into the CSS bundle (~40 of 195 flags are
 * served as separate files by Vite). Without this, the first time one of
 * those flags is shown, the CSS background-image silently stays blank
 * until the fetch completes — no loading state, no error if it's slow.
 *
 * Reads URLs straight from the stylesheet's CSSOM rules rather than
 * resolving computed style on a live probe element — a connected element
 * with a background-image triggers the browser's own fetch for it, which
 * would double every request alongside the explicit fetch() below.
 */
export function prefetchFlagAssets(): void {
  const usedCodes = new Set(countries.map((c) => c.code))
  const urls = new Set<string>()

  for (const sheet of document.styleSheets) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue // cross-origin stylesheet, can't read rules
    }

    for (const rule of rules) {
      if (!(rule instanceof CSSStyleRule)) continue
      const selector = rule.selectorText
      if (!selector?.startsWith('.fi-')) continue
      if (!usedCodes.has(selector.slice(4))) continue

      const match = rule.style.backgroundImage.match(/url\(["']?(.+?)["']?\)/)
      if (match && !match[1].startsWith('data:')) {
        urls.add(match[1])
      }
    }
  }

  for (const url of urls) {
    fetch(url).catch(() => {
      // Best-effort warmup — a failed prefetch just means no cache benefit,
      // the flag still loads normally (if more slowly) when actually shown.
    })
  }
}
