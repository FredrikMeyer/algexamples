import { test, expect } from '@playwright/test'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const SCREENSHOTS_DIR = join(import.meta.dirname, 'screenshots')

test.beforeAll(async () => {
  await mkdir(SCREENSHOTS_DIR, { recursive: true })
})

const pages = [
  { name: 'homepage', path: '/' },
  { name: 'examples-listing', path: '/examples/' },
  { name: 'twisted-cubic-detail', path: '/examples/twisted-cubic' },
  { name: 'varieties-filter', path: '/varieties/' },
  { name: 'tag-projective-space', path: '/tags/projective-space' },
]

for (const { name, path } of pages) {
  test(`screenshot: ${name}`, async ({ page }) => {
    await page.goto(path)
    // Match the path with an optional trailing slash since the app may redirect
    const normalised = path.replace(/\/$/, '')
    await expect(page).toHaveURL(
      new RegExp(normalised.replace(/\//g, '\\/') + '\\/?$'),
    )
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, `${name}.png`),
      fullPage: true,
    })
  })
}

test('screenshot: sidebar-collapsed', async ({ page }) => {
  await page.goto('/')
  // networkidle ensures the client bundle has loaded and React has hydrated
  await page.waitForLoadState('networkidle')
  await page.click('aside button[aria-label="Collapse sidebar"]')
  await page.waitForTimeout(500) // CSS transition is 200ms
  await page.screenshot({
    path: join(SCREENSHOTS_DIR, 'sidebar-collapsed.png'),
    fullPage: true,
  })
})
