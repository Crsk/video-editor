import { test, expect } from '@playwright/test'

test.setTimeout(60000)

test.describe('Timeline Zoom and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid="track-0"]', { state: 'visible' })
    await page.waitForTimeout(2000)
  })

  test('should zoom in and out of the timeline correctly', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)

    const useTestFileButton = page.getByText('Use Test File')
    await useTestFileButton.click()
    await page.waitForTimeout(500)

    const trackSelector = page.locator('select')
    await trackSelector.waitFor({ state: 'visible', timeout: 10000 })
    await trackSelector.selectOption('0')
    await page.waitForTimeout(2000)

    const track1 = page.locator('[data-testid="track-0"]')
    const clipsCount = await track1.locator('[data-testid^="clip-"]').count()
    expect(clipsCount).toBeGreaterThan(0)

    const clip = track1.locator('[data-testid^="clip-"]').first()
    const initialClipBox = await clip.boundingBox()
    if (!initialClipBox) throw new Error('Could not get initial clip bounding box')

    const initialWidth = initialClipBox.width
    console.log(`Initial clip width: ${initialWidth}px`)

    const zoomInButton = page.locator('[data-testid="zoom-in"]')
    const zoomOutButton = page.locator('[data-testid="zoom-out"]')

    if (!(await zoomInButton.isVisible())) {
      const zoomInButtonAlt = page.locator('button:has-text("Zoom In"), button:has-text("+")')
      const zoomOutButtonAlt = page.locator('button:has-text("Zoom Out"), button:has-text("-")')

      if (await zoomInButtonAlt.isVisible()) {
        await zoomInButtonAlt.click()
        await page.waitForTimeout(500)
      }

      if (await zoomOutButtonAlt.isVisible()) {
        await zoomOutButtonAlt.click()
        await page.waitForTimeout(500)
      }
    } else {
      await zoomInButton.click()
      await page.waitForTimeout(500)
      await zoomOutButton.click()
      await page.waitForTimeout(500)
    }

    console.log('Testing zoom in...')

    const zoomWidths = [initialWidth]

    for (let i = 0; i < 5; i++) {
      if (await zoomInButton.isVisible()) {
        await zoomInButton.click()
      } else {
        await page.locator('button:has-text("Zoom In"), button:has-text("+")').click()
      }
      await page.waitForTimeout(500)

      const currentClipBox = await clip.boundingBox()
      if (!currentClipBox) throw new Error(`Could not get clip bounding box after zoom in #${i + 1}`)

      zoomWidths.push(currentClipBox.width)
      console.log(`Clip width after zoom in #${i + 1}: ${currentClipBox.width}px`)
    }

    for (let i = 1; i < zoomWidths.length; i++) {
      expect(zoomWidths[i]).toBeGreaterThan(zoomWidths[i - 1])
      console.log(`Verified: Zoom in #${i} increased width from ${zoomWidths[i - 1]}px to ${zoomWidths[i]}px`)
    }

    const zoomedInWidth = zoomWidths[zoomWidths.length - 1]
    console.log(`Final clip width after zooming in: ${zoomedInWidth}px`)

    expect(zoomedInWidth).toBeGreaterThan(initialWidth * 1.5)
    console.log(
      `Verified: Final zoom in width (${zoomedInWidth}px) is at least 50% larger than initial width (${initialWidth}px)`
    )

    const timeRulerAfterZoomIn = page.locator('[data-testid="time-ruler"]')
    const timeMarkersAfterZoomIn = await timeRulerAfterZoomIn.locator('div[class*="text-center"]').all()

    if (timeMarkersAfterZoomIn.length >= 2) {
      const firstMarkerBox = await timeMarkersAfterZoomIn[0].boundingBox()
      const secondMarkerBox = await timeMarkersAfterZoomIn[1].boundingBox()

      if (firstMarkerBox && secondMarkerBox) {
        const markerDistance = Math.abs(secondMarkerBox.x - firstMarkerBox.x)
        console.log(`Distance between first two time markers after zoom in: ${markerDistance}px`)
        expect(markerDistance).toBeGreaterThan(50)
      }
    }

    console.log('Testing zoom out...')

    const zoomOutWidths = [zoomedInWidth]

    for (let i = 0; i < 8; i++) {
      if (await zoomOutButton.isVisible()) {
        await zoomOutButton.click()
      } else {
        await page.locator('button:has-text("Zoom Out"), button:has-text("-")').click()
      }
      await page.waitForTimeout(500)

      const currentClipBox = await clip.boundingBox()
      if (!currentClipBox) throw new Error(`Could not get clip bounding box after zoom out #${i + 1}`)

      zoomOutWidths.push(currentClipBox.width)
      console.log(`Clip width after zoom out #${i + 1}: ${currentClipBox.width}px`)
    }

    for (let i = 1; i < zoomOutWidths.length; i++) {
      expect(zoomOutWidths[i]).toBeLessThanOrEqual(zoomOutWidths[i - 1])
      console.log(
        `Verified: Zoom out #${i} width ${zoomOutWidths[i]}px is not larger than previous ${zoomOutWidths[i - 1]}px`
      )
    }

    const zoomedOutWidth = zoomOutWidths[zoomOutWidths.length - 1]
    console.log(`Final clip width after zooming out: ${zoomedOutWidth}px`)

    expect(zoomedOutWidth).toBeLessThan(zoomedInWidth * 0.5)
    console.log(
      `Verified: Final zoom out width (${zoomedOutWidth}px) is at least 50% smaller than max zoom in width (${zoomedInWidth}px)`
    )

    const timeRulerAfterZoomOut = page.locator('[data-testid="time-ruler"]')
    const timeMarkersAfterZoomOut = await timeRulerAfterZoomOut.locator('div[class*="text-center"]').all()

    if (timeMarkersAfterZoomOut.length >= 2) {
      const firstMarkerBox = await timeMarkersAfterZoomOut[0].boundingBox()
      const secondMarkerBox = await timeMarkersAfterZoomOut[1].boundingBox()

      if (firstMarkerBox && secondMarkerBox) {
        const markerDistance = Math.abs(secondMarkerBox.x - firstMarkerBox.x)
        console.log(`Distance between first two time markers after zoom out: ${markerDistance}px`)
      }
    }

    console.log('Testing extreme zoom in...')

    const extremeZoomWidths = [zoomedOutWidth]

    for (let i = 0; i < 10; i++) {
      if (await zoomInButton.isVisible()) {
        await zoomInButton.click()
      } else {
        await page.locator('button:has-text("Zoom In"), button:has-text("+")').click()
      }
      await page.waitForTimeout(500)

      const currentClipBox = await clip.boundingBox()
      if (!currentClipBox) throw new Error(`Could not get clip bounding box after extreme zoom in #${i + 1}`)

      extremeZoomWidths.push(currentClipBox.width)
      console.log(`Clip width after extreme zoom in #${i + 1}: ${currentClipBox.width}px`)

      if (i > 0 && Math.abs(extremeZoomWidths[i + 1] - extremeZoomWidths[i]) < 1) {
        console.log(`Detected max zoom level at zoom in #${i + 1}`)
        break
      }
    }

    const timelineContainer = page.locator('[data-testid="timeline-scroll-container"]')
    const containerWidth = await timelineContainer.evaluate(el => el.scrollWidth)
    console.log(`Timeline container scroll width at max zoom: ${containerWidth}px`)

    expect(containerWidth).toBeGreaterThan(1000)

    console.log('Testing horizontal scrolling...')

    const initialScrollLeft = await timelineContainer.evaluate(el => el.scrollLeft)
    console.log(`Initial scroll position: ${initialScrollLeft}px`)

    await timelineContainer.evaluate(el => (el.scrollLeft = 500))
    await page.waitForTimeout(1000)

    const newScrollLeft = await timelineContainer.evaluate(el => el.scrollLeft)
    console.log(`New scroll position: ${newScrollLeft}px`)

    expect(newScrollLeft).toBeGreaterThan(initialScrollLeft)

    const isClipVisibleAfterScroll = await clip.isVisible()
    expect(isClipVisibleAfterScroll).toBe(true)
    console.log(`Verified: Clip remains visible after horizontal scrolling`)

    const timeRuler = page.locator('[data-testid="time-ruler"]')
    const timeMarkers = await timeRuler.locator('div[class*="text-center"]').all()

    expect(timeMarkers.length).toBeGreaterThan(0)
    console.log(`Found ${timeMarkers.length} time markers at final zoom level`)

    const visibleMarkers = await Promise.all(
      timeMarkers.slice(0, Math.min(5, timeMarkers.length)).map(marker => marker.isVisible())
    )

    const visibleMarkersCount = visibleMarkers.filter(visible => visible).length
    console.log(`${visibleMarkersCount} out of first 5 time markers are visible`)
    expect(visibleMarkersCount).toBeGreaterThan(0)
  })
})
