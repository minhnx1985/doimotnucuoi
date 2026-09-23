import { expect, test } from '@playwright/test'

const viewports = [
  { name: '360', width: 360, height: 800 },
  { name: '390', width: 390, height: 844 },
  { name: '430', width: 430, height: 932 },
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
    const documentary = await page.locator('.documentary').evaluate((section) => {
      const imageFigure = section.querySelector('.documentary__image')
      const image = imageFigure.querySelector('img')
      const caption = imageFigure.querySelector('figcaption')
      const quote = section.querySelector('blockquote')
      const sectionRect = section.getBoundingClientRect()
      const figureRect = imageFigure.getBoundingClientRect()
      const imageRect = image.getBoundingClientRect()
      const captionRect = caption.getBoundingClientRect()
      const quoteRect = quote.getBoundingClientRect()
      return {
        columns: getComputedStyle(section).gridTemplateColumns.split(' ').length,
        sectionWidth: sectionRect.width,
        figureWidth: figureRect.width,
        figureX: figureRect.x,
        imageRatio: imageRect.width / imageRect.height,
        naturalRatio: image.naturalWidth / image.naturalHeight,
        quoteWidth: quoteRect.width,
        quoteX: quoteRect.x,
        quoteBottom: quoteRect.bottom,
        figureTop: figureRect.top,
        imageBottom: imageRect.bottom,
        captionTop: captionRect.top,
      }
    })
    if (viewport.width <= 850) {
      expect(documentary.columns).toBe(1)
      expect(documentary.quoteBottom).toBeLessThan(documentary.figureTop)
      expect(documentary.quoteWidth).toBeGreaterThan(viewport.width - 60)
      expect(documentary.figureWidth).toBeGreaterThan(viewport.width - 60)
      expect(documentary.captionTop).toBeGreaterThanOrEqual(documentary.imageBottom)
      expect(documentary.imageRatio).toBeCloseTo(documentary.naturalRatio, 2)
    } else {
      expect(documentary.columns).toBe(2)
      expect(documentary.figureX).toBeLessThan(documentary.quoteX)
    }
    expect(errors).toEqual([])
  })
}

test('purchase links are consistent and sample PDF is lazy', async ({ page }) => {
  await page.goto('/')
  const links = page.locator('.purchase-link')
  await expect(links).toHaveCount(3)
  for (let index = 0; index < 3; index += 1) {
    await expect(links.nth(index)).toHaveAttribute('href', 'https://nhanam.vn')
  }
  await expect(page.locator('.hero-purchase')).toHaveText('ĐẶT MUA SÁCH')
  await expect(page.locator('.site-header .purchase-link')).toHaveText('Tìm mua tại Nhã Nam')
  await expect(page.locator('.final-cta .purchase-link')).toHaveText('Tìm mua tại Nhã Nam')
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

for (const viewport of viewports.filter(({ name }) => ['360', '390', '430', '768', '1440'].includes(name))) {
  test(`captures documentary section at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    const documentary = page.locator('.documentary')
    await documentary.scrollIntoViewIfNeeded()
    for (const reveal of await documentary.locator('.reveal').all()) await expect(reveal).toHaveClass(/is-visible/)
    await documentary.screenshot({ path: `qa/documentary-${viewport.width}x${viewport.height}.png` })
  })
}