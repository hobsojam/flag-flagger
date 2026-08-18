import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchFlagSummary } from './wikipedia'

function jsonResponse(body: unknown, ok = true) {
  return { ok, json: async () => body } as Response
}

describe('fetchFlagSummary', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the extract and article URL on a direct hit', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        extract: 'The flag of Testland is blue.',
        content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Flag_of_Testland' } },
      }),
    )

    const result = await fetchFlagSummary('Testland')

    expect(result).toEqual({
      extract: 'The flag of Testland is blue.',
      articleUrl: 'https://en.wikipedia.org/wiki/Flag_of_Testland',
    })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain(encodeURIComponent('Flag of Testland'))
  })

  it('falls back to opensearch when the direct title 404s', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(null, false)) // direct title miss
      .mockResolvedValueOnce(
        jsonResponse(['Flag of Fallbackland', ['Flag of the Republic of Fallbackland']]),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          extract: 'Resolved via search.',
          content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Flag_of_the_Republic_of_Fallbackland' } },
        }),
      )

    const result = await fetchFlagSummary('Fallbackland')

    expect(result?.extract).toBe('Resolved via search.')
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it('returns null when both the direct lookup and the search fallback fail', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(null, false))
      .mockResolvedValueOnce(jsonResponse(['Flag of Nowhere', []]))

    const result = await fetchFlagSummary('Nowhere')

    expect(result).toBeNull()
  })

  it('caches results so repeat lookups skip the network', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        extract: 'Cached extract.',
        content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Flag_of_Cacheland' } },
      }),
    )

    const first = await fetchFlagSummary('Cacheland')
    const second = await fetchFlagSummary('Cacheland')

    expect(first).toEqual(second)
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
