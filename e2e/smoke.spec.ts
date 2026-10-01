import { expect, test } from '@playwright/test'

test('home loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Atelier/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('opening a piece shows its buy panel', async ({ page }) => {
  await page.goto('/')
  // scoped to the collection grid: the same piece name also appears (with a
  // different accessible name) in the lookbook carousel and brand-story callout
  await page.locator('#collection').getByRole('button', { name: 'Nocturne Coat', exact: true }).click()

  const panel = page.getByRole('dialog', { name: /Nocturne Coat — purchase/ })
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('heading', { name: 'Nocturne Coat' })).toBeVisible()
})

test('adding a piece to the bag shows it in the bag', async ({ page }) => {
  await page.goto('/')
  await page.locator('#collection').getByRole('button', { name: 'Nocturne Coat', exact: true }).click()

  const panel = page.getByRole('dialog', { name: /Nocturne Coat — purchase/ })
  await panel.getByRole('button', { name: 'M', exact: true }).click()
  await panel.getByRole('button', { name: 'Add to Bag' }).click()
  await expect(panel.getByRole('button', { name: 'View bag' })).toBeVisible()

  await panel.getByRole('button', { name: 'View bag' }).click()

  const bag = page.getByRole('dialog', { name: 'Your bag' })
  await expect(bag).toBeVisible()
  await expect(bag.getByText('Nocturne Coat')).toBeVisible()
  await expect(bag.getByText('Size M')).toBeVisible()
})
