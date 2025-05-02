import { test, expect } from '@playwright/test'

test.setTimeout(60000)

test.describe('Video Original Duration Limit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('body', { state: 'visible' })
    await page.waitForTimeout(2000)
  })

  test('should prevent extending video clips beyond original duration', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)
    
    const track1 = page.locator('.mt-2 > div').nth(0)
    await track1.waitFor({ state: 'visible', timeout: 10000 })

    const use43sFileButton = page.getByText('Use 43s File')
    await use43sFileButton.click()
    await page.waitForTimeout(500)

    const trackSelector = page.locator('select')
    await trackSelector.selectOption('0')

    const loadButton = page.getByText('Load into Timeline')
    await loadButton.click()
    await page.waitForTimeout(2000)

    const clipsCount = await track1.locator('.timeline-item').count()
    const clip = track1.locator('.timeline-item').nth(clipsCount - 1)
    await clip.click({ force: true })
    await page.waitForTimeout(500)

    const initialClipBox = await clip.boundingBox()
    if (!initialClipBox) throw new Error('Could not get initial clip bounding box')
    
    const initialWidth = initialClipBox.width
    console.log(`Initial clip width: ${initialWidth}px`)
    
    const zoomOutButton = page.locator('button:has-text("Zoom Out"), [data-testid="zoom-out"], button:has-text("-")')
    if (await zoomOutButton.isVisible().catch(() => false)) {
      for (let i = 0; i < 3; i++) {
        await zoomOutButton.click()
        await page.waitForTimeout(200)
      }
    }
    
    await page.waitForTimeout(500)
    
    const rightEdgeX = initialClipBox.x + initialClipBox.width
    const edgeY = initialClipBox.y + initialClipBox.height / 2
    
    try {
      await page.mouse.move(rightEdgeX - 2, edgeY)
      await page.waitForTimeout(500)
      
      await page.mouse.down()
      await page.waitForTimeout(200)
      
      await page.mouse.move(rightEdgeX + 100, edgeY, { steps: 10 })
      await page.waitForTimeout(200)
      
      await page.mouse.up()
      await page.waitForTimeout(1000)
    } catch (error) {
      console.log(`Error during right resize: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    const clipAfterRightResize = await clip.boundingBox()
    if (!clipAfterRightResize) throw new Error('Could not get clip bounding box after right resize')
    
    console.log(`Clip width after right resize attempt: ${clipAfterRightResize.width}px`)
    
    const widthDifferenceRight = Math.abs(clipAfterRightResize.width - initialWidth)
    console.log(`Width difference after right resize: ${widthDifferenceRight}px`)
    
    const maxAllowedExtension = 5
    
    try {
      await page.mouse.move(rightEdgeX - 2, edgeY)
      await page.waitForTimeout(500)
      
      await page.mouse.down()
      await page.waitForTimeout(200)
      
      await page.mouse.move(rightEdgeX + 200, edgeY, { steps: 20 })
      await page.waitForTimeout(200)
      
      await page.mouse.up()
      await page.waitForTimeout(1000)
    } catch (error) {
      console.log(`Error during second right resize: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    const clipAfterSecondRightResize = await clip.boundingBox()
    if (!clipAfterSecondRightResize) throw new Error('Could not get clip bounding box after second right resize')
    
    console.log(`Clip width after second right resize attempt: ${clipAfterSecondRightResize.width}px`)
    
    const widthDifferenceSecondRight = clipAfterSecondRightResize.width - clipAfterRightResize.width
    console.log(`Width difference after second right resize: ${widthDifferenceSecondRight}px`)
    
    expect(widthDifferenceSecondRight).toBeLessThanOrEqual(maxAllowedExtension)
    
    await page.waitForTimeout(1000)
    
    const finalWidth = clipAfterSecondRightResize.width
    const leftEdgeX = clipAfterSecondRightResize.x
    
    try {
      await page.mouse.move(leftEdgeX + 2, edgeY)
      await page.waitForTimeout(500)
      
      await page.mouse.down()
      await page.waitForTimeout(200)
      
      await page.mouse.move(leftEdgeX - 100, edgeY, { steps: 10 })
      await page.waitForTimeout(200)
      
      await page.mouse.up()
      await page.waitForTimeout(1000)
    } catch (error) {
      console.log(`Error during left resize: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    const clipAfterLeftResize = await clip.boundingBox()
    if (!clipAfterLeftResize) throw new Error('Could not get clip bounding box after left resize')
    
    console.log(`Clip width after left resize attempt: ${clipAfterLeftResize.width}px`)
    
    const widthDifferenceLeft = clipAfterLeftResize.width - finalWidth
    console.log(`Width difference after left resize: ${widthDifferenceLeft}px`)
    
    expect(widthDifferenceLeft).toBeLessThanOrEqual(maxAllowedExtension)
    
    await page.waitForTimeout(1000)
    
    try {
      await clip.click({ force: true })
      await page.waitForTimeout(500)
      
      const clipCenter = leftEdgeX + clipAfterLeftResize.width / 2
      await page.mouse.move(clipCenter, edgeY)
      await page.waitForTimeout(500)
      
      await page.mouse.down()
      await page.waitForTimeout(200)
      
      await page.mouse.move(clipCenter - 50, edgeY, { steps: 5 })
      await page.waitForTimeout(200)
      
      await page.mouse.up()
      await page.waitForTimeout(1000)
    } catch (error) {
      console.log(`Error during drag: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    const clipAfterDrag = await clip.boundingBox()
    if (!clipAfterDrag) throw new Error('Could not get clip bounding box after drag')
    
    console.log(`Clip position after drag: x=${clipAfterDrag.x}, width=${clipAfterDrag.width}px`)
    
    const widthDifferenceDrag = Math.abs(clipAfterDrag.width - clipAfterLeftResize.width)
    console.log(`Width difference after drag: ${widthDifferenceDrag}px`)
    
    expect(widthDifferenceDrag).toBeLessThanOrEqual(maxAllowedExtension)
  })
})
