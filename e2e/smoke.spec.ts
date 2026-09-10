import { expect, test } from '@playwright/test'

test('dashboard loads with the seeded totals', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible()
  await expect(page.getByText('Mock data')).toBeVisible()
  await expect(page.getByText('Latest claims')).toBeVisible()
})

test('policies list paginates and searches', async ({ page }) => {
  await page.goto('/policies')

  await expect(page.getByRole('link', { name: 'POL-1001' })).toBeVisible()
  await expect(page.getByText('Page 1 of 2')).toBeVisible()

  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByRole('link', { name: 'POL-1011' })).toBeVisible()

  await page.getByRole('searchbox', { name: 'Search policies' }).fill('Amelia')
  await expect(page.getByRole('link', { name: 'POL-1001' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'POL-1002' })).toBeHidden()
})

test('a policy detail page shows its claims', async ({ page }) => {
  await page.goto('/policies')

  await page.getByRole('link', { name: 'POL-1001' }).click()

  await expect(page.getByRole('heading', { name: 'POL-1001', level: 1 })).toBeVisible()
  await expect(page.getByText('Held by Amelia Hart')).toBeVisible()
  await expect(page.getByRole('link', { name: 'CLM-5001' })).toBeVisible()
})

test('claims list searches by description and filters by status', async ({ page }) => {
  await page.goto('/claims')

  await expect(page.getByRole('link', { name: 'CLM-5001' })).toBeVisible()

  await page.getByRole('searchbox', { name: 'Search claims' }).fill('luggage')
  await expect(page.getByRole('link', { name: 'CLM-5006' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'CLM-5001' })).toBeHidden()

  await page.getByRole('searchbox', { name: 'Search claims' }).fill('')
  await expect(page.getByRole('link', { name: 'CLM-5001' })).toBeVisible()

  await page.getByLabel('Status').selectOption('submitted')
  await expect(page.getByRole('link', { name: 'CLM-5004' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'CLM-5008' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'CLM-5001' })).toBeHidden()
})

test('a claim can be created end to end', async ({ page }) => {
  await page.goto('/claims/new')

  await page.getByLabel(/Claim number/).fill('CLM-8001')
  await page.getByLabel(/^Policy/).selectOption({ label: 'POL-1002 — Ravi Deshmukh' })
  await page.getByLabel(/Description/).fill('Playwright smoke claim')
  await page.getByLabel(/Amount/).fill('1234.56')
  await page.getByLabel(/Status/).selectOption('submitted')

  await page.getByRole('button', { name: 'Create claim' }).click()

  await expect(page.getByRole('heading', { name: 'CLM-8001', level: 1 })).toBeVisible()
  await expect(page.getByText('Playwright smoke claim')).toBeVisible()
})

test('claim validation blocks an empty submission', async ({ page }) => {
  await page.goto('/claims/new')

  await page.getByRole('button', { name: 'Create claim' }).click()

  await expect(page.getByText('Claim number is required')).toBeVisible()
  await expect(page.getByText('Policy is required')).toBeVisible()
})
