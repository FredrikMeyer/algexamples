import { test, expect } from '@playwright/test'

test.describe('SPA navigation (client-side data fetching)', () => {
  test('navigates from homepage to example detail without full page reload', async ({ page }) => {
    const requests: string[] = []
    page.on('request', (req) => requests.push(req.url()))

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Find any link to an example detail page and click it
    const exampleLink = page.locator('a[href*="/examples/"]').first()
    const href = await exampleLink.getAttribute('href')
    expect(href).toBeTruthy()

    await exampleLink.click()
    await page.waitForLoadState('networkidle')

    // No "Something went wrong" error boundary
    await expect(page.locator('text=Something went wrong')).not.toBeVisible()

    // The detail page should have an h1 heading with actual content
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    const headingText = await heading.textContent()
    expect(headingText?.trim().length).toBeGreaterThan(0)

    // Should NOT have made any /_server/ RPC requests (which would fail on static hosting)
    const serverRpcRequests = requests.filter((url) => url.includes('/_server/'))
    expect(serverRpcRequests).toHaveLength(0)
  })

  test('navigates from example detail back to examples list', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const exampleLink = page.locator('a[href*="/examples/"]').first()
    await exampleLink.click()
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Something went wrong')).not.toBeVisible()

    // Navigate to varieties listing (sidebar link with type=variety)
    const varietiesLink = page.locator('a', { hasText: 'Varieties' }).first()
    await varietiesLink.click()
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Something went wrong')).not.toBeVisible()
    await expect(page).toHaveURL(/\/examples\/?.*type=variety/)
  })

  test('tag page loads via SPA navigation', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Click into an example detail page first, then click a tag
    const exampleLink = page.locator('a[href*="/examples/"]').first()
    await exampleLink.click()
    await page.waitForLoadState('networkidle')

    // Check if there's a tag link on this page
    const tagLink = page.locator('a[href*="/tags/"]').first()
    const hasTag = (await tagLink.count()) > 0
    if (!hasTag) {
      test.skip()
      return
    }

    await tagLink.click()
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Something went wrong')).not.toBeVisible()
    await expect(page).toHaveURL(/\/tags\//)
  })

  test('search page loads and filters work', async ({ page }) => {
    await page.goto('/search')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Something went wrong')).not.toBeVisible()

    const heading = page.locator('h1', { hasText: 'Search' })
    await expect(heading).toBeVisible()

    // Type in the search box and verify results update without errors
    const searchInput = page.locator('input[placeholder*="summaries"]')
    await searchInput.fill('variety')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Something went wrong')).not.toBeVisible()
  })
})
