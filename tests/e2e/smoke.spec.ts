import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('loads the jukebox and opens a track', async ({ page }) => {
  const errors: string[] = []
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Earth Information Jukebox/i })).toBeVisible()
  await page.getByRole('button', { name: /Tidal Memory/i }).click()
  await expect(page.getByRole('heading', { name: 'Tidal Memory' })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Playhead position' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Play' })).toBeEnabled()
  await page.getByRole('button', { name: 'Play' }).click()
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
  expect(errors).toEqual([])
})

test('has no serious accessibility violations on the landing page', async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations.filter(violation => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([])
})
