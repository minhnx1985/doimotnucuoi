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

test('gallery and press links are complete and gallery restores focus', async ({ page }) => {
  await page.goto('/')
  const galleryItems = page.locator('[data-gallery-image]')
  await expect(galleryItems).toHaveCount(15)
  await expect(page.locator('.press__item')).toHaveCount(5)
  await expect(page.locator('#press-title')).toHaveText('Báo chí viết về cuốn sách và sự kiện')
  await expect(page.locator('.gallery__item img')).toHaveCount(15)
  for (const image of await page.locator('.gallery__item img').all()) {
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBeTruthy()
    expect(await image.evaluate((element) => Math.max(element.naturalWidth, element.naturalHeight))).toBeLessThanOrEqual(1800)
  }
  for (const link of await page.locator('.press__item').all()) {
    await expect(link).toHaveAttribute('href', /^https:\/\//)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener')
  }
  await expect(page.locator('.press__item').last()).toHaveAttribute('href', /saostar\.vn\/sac-mau-cuoc-song\/tinh-yeu-cua-ba/)
  await expect(page.locator('.press__item').last()).toContainText('Tình yêu của bà trên hành trình lớn lên cùng cháu trai mắc bệnh tự kỷ')

  await galleryItems.nth(3).click()
  await expect(page.locator('.gallery-viewer')).toBeVisible()
  await expect(page.locator('[data-gallery-viewer-image]')).toHaveAttribute('src', /C4R05847\.jpg/)
  await expect(page.locator('[data-gallery-viewer-caption]')).toHaveText('Những cuộc trò chuyện bên cuốn sách')
  await page.keyboard.press('Escape')
  await expect(page.locator('.gallery-viewer')).not.toBeVisible()
  await expect(galleryItems.nth(3)).toBeFocused()
  await galleryItems.last().click()
  await expect(page.locator('[data-gallery-viewer-image]')).toHaveAttribute('src', /C4R06168\.jpg/)
  await page.locator('[data-close-gallery]').click()
  await expect(galleryItems.last()).toBeFocused()
})

for (const width of [390, 1440]) {
  test(`gallery and press presentation at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.locator('.site-header nav')).toBeVisible()
    for (const image of await page.locator('.gallery__item img').all()) {
      await image.scrollIntoViewIfNeeded()
      await image.evaluate((element) => element.decode())
    }
    for (const selector of ['.gallery', '.press']) {
      await page.locator(selector).scrollIntoViewIfNeeded()
      await page.locator(selector).screenshot({ path: `qa/${selector.slice(1)}-${width}.png` })
    }
    await page.locator('[data-gallery-image]').first().click()
    await expect(page.locator('.gallery-viewer')).toBeVisible()
    await page.locator('[data-gallery-viewer-image]').evaluate((element) => element.decode())
    await page.locator('.gallery-viewer').screenshot({ path: `qa/gallery-viewer-${width}.png` })
    await page.mouse.click(1, 1)
    await expect(page.locator('.gallery-viewer')).not.toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBeFalsy()
  })
}

test('keyboard focus reaches primary action', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
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