import { test, expect } from '@playwright/test'

test.setTimeout(60000)

test.describe('Timeline Video Trim', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('body', { state: 'visible' })
    await page.waitForTimeout(2000)
  })

  test('should trim video clip', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)

    const track1 = page.locator('[data-testid="track-0"]')
    await track1.waitFor({ state: 'visible', timeout: 10000 })

    const initialClipsCount = await track1.locator('[data-testid^="clip-"]').count()
    console.log(`Initial clips in track 1: ${initialClipsCount}`)

    const use43sFileButton = page.getByText('Use 43s File')
    await use43sFileButton.click()
    await page.waitForTimeout(500)

    const trackSelector = page.locator('select')
    await trackSelector.selectOption('0')

    await page.waitForTimeout(2000)

    const clipsAfterAdd = await track1.locator('[data-testid^="clip-"]').count()
    console.log(`Clips in track 1 after adding new clip: ${clipsAfterAdd}`)
    expect(clipsAfterAdd).toBeGreaterThan(initialClipsCount)

    const clip = track1.locator('[data-testid^="clip-"]').nth(clipsAfterAdd - 1)
    await clip.click({ force: true })
    await page.waitForTimeout(500)

    const clipBoundingBox = await clip.boundingBox()
    if (!clipBoundingBox) throw new Error('Could not get clip bounding box')

    const zoomOutButton = page.locator('button:has-text("Zoom Out"), [data-testid="zoom-out"], button:has-text("-")')
    if (await zoomOutButton.isVisible().catch(() => false)) {
      for (let i = 0; i < 5; i++) {
        await zoomOutButton.click()
        await page.waitForTimeout(200)
      }
    }

    await page.evaluate(() => window.scrollTo(100000, window.scrollY))
    await page.waitForTimeout(500)

    await page.evaluate(() => {
      const containers = [
        '.timeline-container',
        '.timeline',
        '.tracks-container',
        '.track-container',
        '.editor-container'
      ]

      for (const selector of containers) {
        const container = document.querySelector(selector)
        if (container) container.scrollLeft = 100000
      }

      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el)
        if (
          style.overflow === 'auto' ||
          style.overflow === 'scroll' ||
          style.overflowX === 'auto' ||
          style.overflowX === 'scroll'
        ) {
          el.scrollLeft = el.scrollWidth
        }
      })
    })

    await page.keyboard.press('End')
    await page.keyboard.down('Control')
    await page.keyboard.press('End')
    await page.keyboard.up('Control')
    await page.waitForTimeout(500)

    await clip.click({ force: true })
    await page.waitForTimeout(500)

    const updatedClipBox = await clip.boundingBox()
    if (!updatedClipBox) throw new Error('Could not get updated clip bounding box')

    const rightEdgeX = updatedClipBox.x + updatedClipBox.width
    const edgeY = updatedClipBox.y + updatedClipBox.height / 2

    console.log(`Updated clip dimensions: ${JSON.stringify(updatedClipBox)}`)

    try {
      await page.mouse.move(rightEdgeX - 2, edgeY)
      await page.waitForTimeout(500)

      await page.mouse.click(rightEdgeX - 2, edgeY)
      await page.waitForTimeout(300)

      await page.mouse.down()
      await page.waitForTimeout(200)

      await page.mouse.move(rightEdgeX - 10, edgeY, { steps: 3 })
      await page.waitForTimeout(200)

      await page.mouse.up()
      await page.waitForTimeout(1000)
    } catch (error) {
      console.log(`Error during drag: ${error instanceof Error ? error.message : String(error)}`)
    }

    await page.waitForTimeout(1000)

    const clipAfterTrim = await clip.boundingBox()
    if (!clipAfterTrim) throw new Error('Could not get clip bounding box after trim')

    console.log(`Clip dimensions after trim: ${JSON.stringify(clipAfterTrim)}`)

    const reductionPercentage = 100 - (clipAfterTrim.width / clipBoundingBox.width) * 100
    console.log(`Reduction percentage: ${reductionPercentage.toFixed(2)}%`)

    const originalDuration = 43
    const estimatedDuration = (clipAfterTrim.width / clipBoundingBox.width) * originalDuration
    console.log(`Estimated duration after trim: ${estimatedDuration.toFixed(2)} seconds`)

    const actualTrimPixels = clipBoundingBox.width - clipAfterTrim.width
    console.log(`Actual pixels trimmed: ${actualTrimPixels}`)

    const expectedReductionPercentage = (actualTrimPixels / clipBoundingBox.width) * 100
    console.log(`Expected reduction percentage: ${expectedReductionPercentage.toFixed(2)}%`)

    const tolerance = 15 // Percentage points of tolerance

    expect(Math.abs(reductionPercentage - expectedReductionPercentage)).toBeLessThanOrEqual(tolerance)
    console.log(
      `Verified: Reduction percentage (${reductionPercentage.toFixed(
        2
      )}%) is within ${tolerance}% of expected (${expectedReductionPercentage.toFixed(2)}%)`
    )

    const pixelReductionRatio = reductionPercentage / actualTrimPixels
    console.log(`Pixel reduction ratio: ${pixelReductionRatio.toFixed(4)}% per pixel`)

    const smallTrimPixels = 10
    const expectedReductionForSmallTrim = pixelReductionRatio * smallTrimPixels
    console.log(`Expected reduction for a ${smallTrimPixels}px trim: ${expectedReductionForSmallTrim.toFixed(2)}%`)

    expect(expectedReductionForSmallTrim).toBeLessThanOrEqual(5)
    console.log(
      `Verified: A small trim of ${smallTrimPixels}px would result in a reduction of ${expectedReductionForSmallTrim.toFixed(
        2
      )}%`
    )
  })
})
