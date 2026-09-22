import { expect, test } from '@playwright/test'

const viewports = [
  { name: '360', width: 360, height: 800 },
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1440', width: 1440, height: 1000 },
]

for (const viewport of viewports) {
  test(`layout ${viewport.name}`, async ({ page }) => {
    const errors = []
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expect(page.locator('h1')).toHaveText('Đợi một nụ cười')
    await expect(page.locator('.cover')).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(overflow).toBeFalsy()
    expect(errors).toEqual([])
  })
}

test('purchase links are consistent and sample PDF is lazy', async ({ page }) => {
  await page.goto('/')
  const links = page.locator('.purchase-link')
  await expect(links).toHaveCount(3)
  for (let index = 0; index < 3; index += 1) {
    await expect(links.nth(index)).toHaveAttribute('href', 'https://nhanam.vn')
    await expect(links.nth(index)).toHaveText('Tìm mua tại Nhã Nam')
  }
  await expect(page.locator('[data-pdf-frame]')).not.toHaveAttribute('src', /.+/)
  await page.locator('[data-open-reader]').click()
  await expect(page.locator('.reader')).toBeVisible()
  await expect(page.locator('[data-pdf-frame]')).toHaveAttribute('src', /read-sample\.pdf/)
  await page.locator('[data-close-reader]').click()
  await expect(page.locator('.reader')).not.toBeVisible()
})

test('keyboard focus reaches primary action', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(page.locator('.site-header .purchase-link')).toBeFocused()
})

test('reduced motion disables transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const duration = await page.locator('.reveal').first().evaluate((element) => getComputedStyle(element).transitionDuration)
  expect(duration).toBe('0s')
})

test('captures required screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.screenshot({ path: 'qa/mobile-390x844.png', fullPage: true })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await page.screenshot({ path: 'qa/desktop-1440x1000.png', fullPage: true })
})