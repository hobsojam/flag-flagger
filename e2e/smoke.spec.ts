import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('loads and shows a flag with four answer options', async ({ page }) => {
  await expect(page.getByRole('img', { name: 'Which country is this?' })).toBeVisible()
  const options = page.locator('div.grid > button')
  await expect(options).toHaveCount(4)
})

test('answering advances the question and updates stats', async ({ page }) => {
  await page.locator('div.grid > button').first().click()
  await expect(page.getByRole('button', { name: 'Next flag →' })).toBeVisible()
  await expect(page.getByText('Answered').locator('..')).toContainText('1')

  await page.getByRole('button', { name: 'Next flag →' }).click()
  await expect(page.getByRole('button', { name: 'Next flag →' })).not.toBeVisible()
})

test('switches to name-to-flag mode and answers with a flag click', async ({ page }) => {
  await page.getByRole('button', { name: 'Name → Flag' }).click()
  await expect(page.getByRole('img', { name: 'Which country is this?' })).not.toBeVisible()

  const flagOptions = page.locator('div.grid > button')
  await expect(flagOptions).toHaveCount(4)
  await flagOptions.first().click()
  await expect(page.getByRole('button', { name: 'Next flag →' })).toBeVisible()
})

test('switches to typed-answer mode and shows feedback on submit', async ({ page }) => {
  await page.getByRole('button', { name: 'Type the answer' }).click()

  const input = page.getByPlaceholder('Type the country name...')
  await expect(input).toBeVisible()

  await input.fill('this is definitely not a real country')
  await page.getByRole('button', { name: 'Submit' }).click()

  await expect(page.getByText('Correct answer:')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next flag →' })).toBeVisible()
})

test('hides typed/multiple-choice toggle in name-to-flag mode', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Type the answer' })).toBeVisible()
  await page.getByRole('button', { name: 'Name → Flag' }).click()
  await expect(page.getByRole('button', { name: 'Type the answer' })).not.toBeVisible()
})

test('toggles weak-flags practice mode', async ({ page }) => {
  await page.getByRole('button', { name: 'Practice weak flags' }).click()
  await expect(page.getByText('Practicing your weakest flags only.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Back to normal practice' })).toBeVisible()
})

test('opens the mastery grid and returns to the quiz', async ({ page }) => {
  await page.getByRole('button', { name: 'View progress' }).click()
  await expect(page.getByRole('button', { name: 'Back to quiz' })).toBeVisible()
  // The grid renders one tile per country (195), each an image-role flag.
  await expect(page.getByRole('img').first()).toBeVisible()
  const gridFlags = await page.getByRole('img').count()
  expect(gridFlags).toBeGreaterThan(100)

  await page.getByRole('button', { name: 'Back to quiz' }).click()
  await expect(page.getByRole('img', { name: 'Which country is this?' })).toBeVisible()
})

test('reset stats zeroes the counters', async ({ page }) => {
  await page.locator('div.grid > button').first().click()
  await expect(page.getByText('Answered').locator('..')).toContainText('1')

  await page.getByRole('button', { name: 'Reset stats' }).click()
  await expect(page.getByText('Answered').locator('..')).toContainText('0')
})

test('configures and completes a 10-flag session and shows a summary', async ({ page }) => {
  await page.getByRole('button', { name: 'Start session' }).click()
  await expect(page.getByRole('heading', { name: 'Start a session' })).toBeVisible()
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  await expect(page.getByText('Session: 0/10')).toBeVisible()

  for (let i = 0; i < 10; i++) {
    await page.locator('div.grid > button').first().click()
    // Label switches to "See summary" on the 10th question — target the
    // wrapper instead of the exact text so this works for every iteration.
    await page.locator('div.h-10 button').click()
  }

  await expect(page.getByRole('heading', { name: 'Session complete' })).toBeVisible()
  await expect(page.getByText(/\d+\/10 correct/)).toBeVisible()

  await page.getByRole('button', { name: 'Play again' }).click()
  await expect(page.getByText('Session: 0/10')).toBeVisible()
})

test('session setup: choosing a flag count and focus area scopes the session', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Start session' }).click()
  await page.getByLabel('Number of flags').selectOption('5')
  await page.getByLabel('Focus area').selectOption('Europe')
  await page.getByRole('button', { name: 'Start', exact: true }).click()

  await expect(page.getByText('Session: 0/5 · Europe')).toBeVisible()
})

test('session setup can be cancelled without starting a session', async ({ page }) => {
  await page.getByRole('button', { name: 'Start session' }).click()
  await expect(page.getByRole('heading', { name: 'Start a session' })).toBeVisible()

  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('heading', { name: 'Start a session' })).not.toBeVisible()
  await expect(page.getByRole('img', { name: 'Which country is this?' })).toBeVisible()
})

test('ending a session returns to normal practice', async ({ page }) => {
  await page.getByRole('button', { name: 'Start session' }).click()
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  await page.locator('div.grid > button').first().click()
  await page.getByRole('button', { name: 'Next flag →' }).click()
  await expect(page.getByText('Session: 1/10')).toBeVisible()

  await page.getByRole('button', { name: 'End session' }).click()
  await expect(page.getByRole('button', { name: 'Start session' })).toBeVisible()
  await expect(page.getByText(/Session: \d+\/10/)).not.toBeVisible()
})

test('announces the answer outcome to assistive tech via a live region', async ({ page }) => {
  const status = page.getByRole('status')
  await expect(status).toHaveText('')

  await page.locator('div.grid > button').first().click()
  await expect(status).toHaveText(/^(Correct!|Incorrect\. The correct answer is) /)
})

test('typed-answer input has an accessible label, not just a placeholder', async ({ page }) => {
  await page.getByRole('button', { name: 'Type the answer' }).click()
  await expect(page.getByLabel('Country name')).toBeVisible()
})

test('mode toggle buttons expose pressed state', async ({ page }) => {
  const flagToName = page.getByRole('button', { name: 'Flag → Name' })
  const nameToFlag = page.getByRole('button', { name: 'Name → Flag' })
  await expect(flagToName).toHaveAttribute('aria-pressed', 'true')
  await expect(nameToFlag).toHaveAttribute('aria-pressed', 'false')

  await nameToFlag.click()
  await expect(flagToName).toHaveAttribute('aria-pressed', 'false')
  await expect(nameToFlag).toHaveAttribute('aria-pressed', 'true')
})

test('main content is contained in a landmark', async ({ page }) => {
  await expect(page.getByRole('main')).toBeVisible()
})

test('flag lookup: search, view a flag with its Wikipedia summary, and go back', async ({
  page,
}) => {
  await page.route('https://en.wikipedia.org/api/rest_v1/page/summary/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        extract: 'The flag of Testland is a placeholder used for e2e testing.',
        content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Flag_of_Testland' } },
      }),
    })
  })

  await page.getByRole('button', { name: 'Flag lookup' }).click()
  await page.getByLabel('Search countries').fill('germany')

  const results = page.locator('div.grid > button')
  await expect(results).toHaveCount(1)
  await results.first().click()

  await expect(page.getByRole('heading', { name: 'Germany' })).toBeVisible()
  await expect(page.getByText('placeholder used for e2e testing')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Wikipedia' })).toHaveAttribute(
    'href',
    'https://en.wikipedia.org/wiki/Flag_of_Testland',
  )
  await expect(page.getByRole('link', { name: 'CC BY-SA 4.0' })).toHaveAttribute(
    'href',
    'https://creativecommons.org/licenses/by-sa/4.0/',
  )

  await page.getByRole('button', { name: '← Back to list' }).click()
  await expect(page.getByLabel('Search countries')).toBeVisible()
})

test('flag lookup shows a message when the summary fails to load', async ({ page }) => {
  await page.route('https://en.wikipedia.org/api/rest_v1/page/summary/**', async (route) => {
    await route.fulfill({ status: 404 })
  })
  await page.route('https://en.wikipedia.org/w/api.php**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(['Flag of Germany', []]),
    })
  })

  await page.getByRole('button', { name: 'Flag lookup' }).click()
  await page.getByLabel('Search countries').fill('germany')
  await page.locator('div.grid > button').first().click()

  await expect(page.getByText("Couldn't load information for this flag.")).toBeVisible()
})
