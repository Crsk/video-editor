import { test, expect } from '@playwright/test'

test.setTimeout(60000)

test.describe('Timeline Video Trim', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('body', { state: 'visible' })
    await page.waitForTimeout(2000)
  })

  test('should demonstrate bug where small trim causes large reduction with 43s video', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)
    
    const track1 = page.locator('.mt-2 > div').nth(0)
    await track1.waitFor({ state: 'visible', timeout: 10000 })

    const initialClipsCount = await track1.locator('.timeline-item').count()
    console.log(`Initial clips in track 1: ${initialClipsCount}`)

    const use43sFileButton = page.getByText('Use 43s File')
    await use43sFileButton.click()
    await page.waitForTimeout(500)

    const trackSelector = page.locator('select')
    await trackSelector.selectOption('0')

    const loadButton = page.getByText('Load into Timeline')
    await loadButton.click()
    await page.waitForTimeout(2000)

    const clipsAfterAdd = await track1.locator('.timeline-item').count()
    console.log(`Clips in track 1 after adding new clip: ${clipsAfterAdd}`)
    expect(clipsAfterAdd).toBeGreaterThan(initialClipsCount)

    const clip = track1.locator('.timeline-item').nth(clipsAfterAdd - 1)
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
        if (style.overflow === 'auto' || style.overflow === 'scroll' || 
            style.overflowX === 'auto' || style.overflowX === 'scroll') {
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
    
    const reductionPercentage = 100 - ((clipAfterTrim.width / clipBoundingBox.width) * 100)
    console.log(`Reduction percentage: ${reductionPercentage.toFixed(2)}%`)
    
    const originalDuration = 43
    const estimatedDuration = (clipAfterTrim.width / clipBoundingBox.width) * originalDuration
    console.log(`Estimated duration after trim: ${estimatedDuration.toFixed(2)} seconds`)
    
    if (estimatedDuration < 20) {
      console.log('BUG DETECTED: Small trim caused clip to be drastically reduced!')
      expect(estimatedDuration).toBeGreaterThan(20)
    } else {
      console.log('Bug fixed - the duration was not drastically reduced')
    }
  })
})
