export interface FlagSummary {
  extract: string
  articleUrl: string
}

const REST_BASE = 'https://en.wikipedia.org/api/rest_v1/page/summary/'
const OPENSEARCH_BASE = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&namespace=0&limit=1&origin=*&search='

const cache = new Map<string, FlagSummary | null>()

async function fetchSummaryForTitle(title: string): Promise<FlagSummary | null> {
  const res = await fetch(REST_BASE + encodeURIComponent(title))
  if (!res.ok) return null
  const data = await res.json()
  if (!data.extract) return null
  return {
    extract: data.extract,
    articleUrl: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  }
}

// Wikipedia's own redirect graph resolves the overwhelming majority of
// naming mismatches on a direct request (e.g. "Flag of Czechia" redirects
// to "Flag of the Czech Republic", "Flag of United States" to "...the
// United States"). This opensearch fallback only matters for the rare case
// a direct title has no article or redirect at all.
async function resolveTitleViaSearch(query: string): Promise<string | null> {
  const res = await fetch(OPENSEARCH_BASE + encodeURIComponent(query))
  if (!res.ok) return null
  const [, titles] = (await res.json()) as [string, string[]]
  return titles[0] ?? null
}

export async function fetchFlagSummary(countryName: string): Promise<FlagSummary | null> {
  if (cache.has(countryName)) return cache.get(countryName) ?? null

  const directTitle = `Flag of ${countryName}`
  let summary = await fetchSummaryForTitle(directTitle)

  if (!summary) {
    const resolvedTitle = await resolveTitleViaSearch(directTitle)
    if (resolvedTitle && resolvedTitle !== directTitle) {
      summary = await fetchSummaryForTitle(resolvedTitle)
    }
  }

  cache.set(countryName, summary)
  return summary
}
