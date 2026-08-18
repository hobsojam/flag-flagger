import type { Country } from '../data/countries'

/**
 * Warms the browser's HTTP cache for flag images that aren't small enough to
 * be inlined into the CSS bundle (~40 of 195 flag-icons flags are served as
 * separate files by Vite; every historical flag is a separate static file
 * too). Without this, the first time one of those flags is shown, its
 * background-image silently stays blank until the fetch completes — no
 * loading state, no error if it's slow.
 *
 * Reads flag-icons URLs straight from the stylesheet's CSSOM rules rather
 * than resolving computed style on a live probe element — a connected
 * element with a background-image triggers the browser's own fetch for it,
 * which would double every request alongside the explicit fetch() below.
 * Historical flags aren't part of that stylesheet, so their URLs come
 * straight from the pool's imageUrl fields instead.
 */
export function prefetchFlagAssets(pool: Country[]): void {
  const usedCodes = new Set(pool.filter((c) => !c.imageUrl).map((c) => c.code))
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

  for (const c of pool) {
    if (c.imageUrl) urls.add(`${import.meta.env.BASE_URL}${c.imageUrl}`)
  }

  for (const url of urls) {
    fetch(url).catch(() => {
      // Best-effort warmup — a failed prefetch just means no cache benefit,
      // the flag still loads normally (if more slowly) when actually shown.
    })
  }
}
