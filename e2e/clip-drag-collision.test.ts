import { test, expect } from '@playwright/test'

test.setTimeout(60000)

test.describe('Clip Drag Collision', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('.mt-2 > div', { state: 'visible' })
    await page.waitForTimeout(2000)
  })

  test('should return clip to original position when dragged over another clip', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)
    
    // Get the first track
    const track = page.locator('.mt-2 > div').nth(0)
    await track.waitFor({ state: 'visible', timeout: 10000 })

    // Add two clips to the same track
    for (let i = 0; i < 2; i++) {
      const use43sFileButton = page.getByText('Use 43s File')
      await use43sFileButton.click()
      await page.waitForTimeout(500)

      const trackSelector = page.locator('select')
      await trackSelector.selectOption('0')

      const loadButton = page.getByText('Load into Timeline')
      await loadButton.click()
      await page.waitForTimeout(2000)
    }

    // Verify we have at least 2 clips
    const clipsCount = await track.locator('.timeline-item').count()
    expect(clipsCount).toBeGreaterThanOrEqual(2)
    console.log(`Number of clips in track: ${clipsCount}`)

    // Get the first and second clips
    const firstClip = track.locator('.timeline-item').nth(0)
    const secondClip = track.locator('.timeline-item').nth(1)
    
    // Get initial positions
    const firstClipBox = await firstClip.boundingBox()
    const secondClipBox = await secondClip.boundingBox()
    
    if (!firstClipBox || !secondClipBox) throw new Error('Could not get clip bounding boxes')
    
    const initialFirstClipX = firstClipBox.x
    const initialFirstClipWidth = firstClipBox.width
    
    console.log(`Initial first clip position: x=${initialFirstClipX}, width=${initialFirstClipWidth}px`)
    console.log(`Second clip position: x=${secondClipBox.x}, width=${secondClipBox.width}px`)
    
    // Try to drag the first clip over the second clip
    try {
      const startX = firstClipBox.x + firstClipBox.width / 2
      const startY = firstClipBox.y + firstClipBox.height / 2
      const endX = secondClipBox.x + secondClipBox.width / 2 // Target the middle of the second clip
      const endY = startY
      
      // Start the drag operation
      await page.mouse.move(startX, startY)
      await page.waitForTimeout(100)
      await page.mouse.down()
      await page.waitForTimeout(100)
      
      // Move the mouse in a smooth manner from the start to the end position
      const steps = 10
      for (let i = 1; i <= steps; i++) {
        const moveX = startX + ((endX - startX) * i) / steps
        const moveY = startY + ((endY - startY) * i) / steps
        await page.mouse.move(moveX, moveY)
        await page.waitForTimeout(50)
      }
      
      await page.waitForTimeout(100)
      await page.mouse.up()
      await page.waitForTimeout(2000)
    } catch (error) {
      console.log(`Error during drag: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    // Check if the first clip returned to its original position
    const finalFirstClipBox = await firstClip.boundingBox()
    if (!finalFirstClipBox) throw new Error('Could not get final first clip bounding box')
    
    const finalFirstClipX = finalFirstClipBox.x
    const finalFirstClipWidth = finalFirstClipBox.width
    
    console.log(`Final first clip position: x=${finalFirstClipX}, width=${finalFirstClipWidth}px`)
    
    // Calculate position difference
    const positionDifference = Math.abs(finalFirstClipX - initialFirstClipX)
    console.log(`Position difference: ${positionDifference}px`)
    
    // Verify that the clip position didn't change significantly (returned to original position)
    const maxAllowedPositionChange = 5
    expect(positionDifference).toBeLessThanOrEqual(maxAllowedPositionChange)
    
    // Verify that the clip width didn't change
    const widthDifference = Math.abs(finalFirstClipWidth - initialFirstClipWidth)
    expect(widthDifference).toBeLessThanOrEqual(maxAllowedPositionChange)
  })
})
