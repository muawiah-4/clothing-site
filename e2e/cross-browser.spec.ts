import type { Page } from '@playwright/test'
import { expect, expectFocusInside, test } from './fixtures'

// Broad smoke over the key flows, run in Chromium and WebKit (see
// playwright.config.ts). The fixture fails any test that logs a console error,
// throws, or trips the Content-Security-Policy.

const grid = (page: Page) => page.locator('#collection')

async function openPiece(page: Page, name: string) {
  await grid(page).getByRole('button', { name, exact: true }).click()
  const panel = page.getByRole('dialog', { name: `${name} — purchase` })
  await expectFocusInside(panel)
  return panel
}

test('nav links scroll to their sections', async ({ page }) => {
  await page.goto('/')
  const nav = page.getByRole('banner').getByRole('navigation')
  for (const [label, id] of [
    ['Shop', 'collection'],
    ['Contact', 'contact'],
  ] as const) {
    await nav.getByRole('button', { name: label, exact: true }).click()
    // Lenis smooth-scrolls; wait for the section to reach the viewport top
    await expect
      .poll(() => page.locator(`#${id}`).evaluate((el) => Math.abs(el.getBoundingClientRect().top)), {
        timeout: 10_000,
      })
      .toBeLessThan(200)
  }
})

test('collection: gender tabs, category, search and sort', async ({ page }) => {
  await page.goto('/')
  const section = grid(page)
  const card = (name: string) => section.getByRole('button', { name, exact: true })
  await expect(card('Nocturne Coat')).toBeVisible()

  await section.getByRole('button', { name: 'Women', exact: true }).click()
  await expect(card('Liquid Silk Gown')).toBeVisible()
  await expect(card('Nocturne Coat')).toHaveCount(0)
  await section.getByRole('button', { name: 'All', exact: true }).click()

  await section.getByRole('group', { name: 'Filter by category' }).getByRole('button', { name: 'Eveningwear' }).click()
  await expect(card('Onyx Tuxedo')).toBeVisible()
  await expect(card('Nocturne Coat')).toHaveCount(0)
  await section.getByRole('button', { name: 'All categories' }).click()

  const search = section.getByRole('searchbox', { name: 'Search the collection' })
  await search.fill('silk')
  await expect(card('Liquid Silk Gown')).toBeVisible()
  await expect(card('Nocturne Coat')).toHaveCount(0)
  await search.fill('')

  await section.getByRole('combobox', { name: 'Sort by' }).selectOption('price-asc')
  const names = section.getByRole('heading', { level: 3 })
  await expect(names.first()).toBeVisible()
  const ascFirst = await names.first().textContent()
  await section.getByRole('combobox', { name: 'Sort by' }).selectOption('price-desc')
  await expect(names.first()).not.toHaveText(ascFirst ?? '')
})

test('buy panel: gallery thumbnails, size validation, add to bag', async ({ page }) => {
  await page.goto('/')
  const panel = await openPiece(page, 'Nocturne Coat')

  const photos = panel.getByRole('group', { name: 'Photos' })
  const front = photos.getByRole('button', { name: 'Show front' })
  await front.click()
  await expect(front).toHaveAttribute('aria-pressed', 'true')
  await expect(photos.getByRole('button', { name: 'Show full look' })).toHaveAttribute('aria-pressed', 'false')

  // no size picked yet
  await panel.getByRole('button', { name: 'Add to Bag' }).click()
  await expect(panel.getByRole('alert')).toBeVisible()

  await panel.getByRole('button', { name: 'S', exact: true }).click()
  await panel.getByRole('button', { name: 'Add to Bag' }).click()
  await expect(panel.getByRole('button', { name: 'View bag' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open bag, 1 item' })).toBeVisible()
})

test('bag: quantity, remove, demo order through the API, reload persistence', async ({ page }) => {
  // Orders really decrement stock, so pick each piece's deepest size from the
  // API: repeated runs against one database never hit a sold-out size.
  const stock = (await (await page.request.get('/api/stock')).json()) as Record<string, Record<string, number>>
  const deepest = (id: string) => Object.entries(stock[id]).sort((a, b) => b[1] - a[1])[0][0]
  const coat = deepest('nocturne')
  const tux = deepest('onyx-tuxedo')

  await page.goto('/')
  for (const [name, size] of [
    ['Nocturne Coat', coat],
    ['Onyx Tuxedo', tux],
  ]) {
    const panel = await openPiece(page, name)
    await panel.getByRole('button', { name: size, exact: true }).click()
    await panel.getByRole('button', { name: 'Add to Bag' }).click()
    await expect(panel.getByRole('button', { name: 'View bag' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
  }

  await page.reload()
  await page.getByRole('button', { name: 'Open bag, 2 items' }).click()
  const bag = page.getByRole('dialog', { name: 'Your bag' })
  await expectFocusInside(bag)

  await bag.getByRole('button', { name: `Increase quantity of Nocturne Coat, size ${coat}` }).click()
  await expect(page.getByRole('button', { name: 'Open bag, 3 items' })).toBeAttached()
  await bag.getByRole('button', { name: `Remove Onyx Tuxedo, size ${tux}` }).click()
  await expect(bag.getByText('Onyx Tuxedo')).toHaveCount(0)

  const order = page.waitForResponse((r) => r.url().endsWith('/api/orders') && r.request().method() === 'POST')
  await bag.getByRole('button', { name: 'Place demo order' }).click()
  expect((await order).status()).toBe(201)
  await expect(bag.getByRole('heading', { name: 'Demo order placed.' })).toBeFocused()

  await page.reload()
  await expect(page.getByRole('button', { name: 'Open bag', exact: true })).toBeVisible()
})

test('wishlist: save, survive reload, view, remove', async ({ page }) => {
  await page.goto('/')
  await grid(page).getByRole('button', { name: 'Save Ivory Tailleur' }).click()
  await page.reload()
  await expect(grid(page).getByRole('button', { name: 'Save Ivory Tailleur' })).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('button', { name: 'Saved (1)' }).click()
  const saved = page.getByRole('dialog', { name: 'Saved pieces' })
  await expectFocusInside(saved)
  await saved.getByRole('button', { name: 'Remove Ivory Tailleur from saved' }).click()
  await expect(saved.getByText('Ivory Tailleur')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(saved).toBeHidden()
  await expect(page.getByRole('button', { name: 'Saved (0)' })).toBeFocused()
})

test('Escape closes panels and Tab stays trapped inside', async ({ page }) => {
  await page.goto('/')
  const panel = await openPiece(page, 'Alpine Shearling')
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab')
    expect(await panel.evaluate((d) => d.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
})

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test('menu opens, navigates and closes', async ({ page }) => {
    await page.goto('/')
    const open = page.getByRole('button', { name: 'Open menu' })
    await open.click()
    const menu = page.getByRole('dialog', { name: 'Site navigation' })
    await expectFocusInside(menu)
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(open).toBeFocused()

    await open.click()
    await menu.getByRole('button', { name: 'Contact', exact: true }).click()
    await expect(menu).toBeHidden()
    await expect
      .poll(() => page.locator('#contact').evaluate((el) => Math.abs(el.getBoundingClientRect().top)), {
        timeout: 10_000,
      })
      .toBeLessThan(200)
  })
})

test('focus returns to the clicked trigger when a panel closes (Safari focus-on-click)', async ({ page }) => {
  await page.goto('/')
  // A real mouse click: Safari doesn't focus a button it clicks.
  const trigger = grid(page).getByRole('button', { name: 'Nocturne Coat', exact: true })
  await trigger.click()
  const panel = page.getByRole('dialog', { name: 'Nocturne Coat — purchase' })
  await expectFocusInside(panel)
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(trigger).toBeFocused()

  const saved = page.getByRole('button', { name: 'Saved (0)' })
  await saved.click()
  await expectFocusInside(page.getByRole('dialog', { name: 'Saved pieces' }))
  await page.keyboard.press('Escape')
  await expect(saved).toBeFocused()
})
