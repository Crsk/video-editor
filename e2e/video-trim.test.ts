import { test, expect } from '@playwright/test'

test.describe('Timeline Video Trim', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('body', { state: 'visible' })
    await page.waitForTimeout(2000)
  })

  test('should add 43s video to track 1 and trim it to 30s', async ({ page }) => {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
    await page.waitForTimeout(2000)
    await page.waitForSelector('.mt-2 > div', { state: 'visible', timeout: 10000 })

    const track1 = page.locator('.mt-2 > div').nth(0)
    await track1.waitFor({ state: 'visible', timeout: 10000 })

    const initialClipsCount = await track1.locator('.timeline-item').count()
    console.log(`Initial clips in track 1: ${initialClipsCount}`)

    // Add the 43-second video using the test file button
    const useTestFileButton = page.getByText('Use Test File')
    await useTestFileButton.waitFor({ state: 'visible', timeout: 10000 })
    await useTestFileButton.click()
    await page.waitForTimeout(1000)

    // Make sure track 1 is selected in the dropdown
    const trackSelector = page.locator('select')
    await trackSelector.waitFor({ state: 'visible', timeout: 10000 })
    await trackSelector.selectOption('0') // Select first option (Track 1)

    // Click "Load into Timeline" button
    const loadButton = page.getByText('Load into Timeline')
    await loadButton.waitFor({ state: 'visible', timeout: 10000 })
    await loadButton.click()
    await page.waitForTimeout(3000) // Wait longer for the clip to be added and loaded

    // Verify a new clip was added to track 1
    await track1.waitFor({ state: 'visible', timeout: 10000 })
    const clipsAfterAdd = await track1.locator('.timeline-item').count()
    console.log(`Clips in track 1 after adding new clip: ${clipsAfterAdd}`)
    expect(clipsAfterAdd).toBeGreaterThan(initialClipsCount)

    // Select the newly added clip to trim it (should be the last one)
    const clip = track1.locator('.timeline-item').nth(clipsAfterAdd - 1)
    await clip.waitFor({ state: 'visible', timeout: 10000 })
    await clip.click({ force: true })
    await page.waitForTimeout(1000)

    console.log('Attempting to trim the clip by dragging the right handle...')
    
    // Get the clip's bounding box to calculate positions
    const clipBoundingBox = await clip.boundingBox()
    if (!clipBoundingBox) {
      throw new Error('Could not get clip bounding box')
    }
    
    // Take a screenshot before trimming
    await page.screenshot({ path: 'before-trim.png' })
    
    // Calculate positions for the drag operation
    // The right handle should be at the right edge of the clip
    const rightHandleX = clipBoundingBox.x + clipBoundingBox.width
    const handleY = clipBoundingBox.y + clipBoundingBox.height / 2
    
    // Calculate where to drag to (approx. 30/43 = ~70% of original width)
    // We want to trim from 43s to 30s, so we need to move the right handle to about 70% of the original width
    const targetX = clipBoundingBox.x + (clipBoundingBox.width * 30 / 43)
    
    console.log(`Clip dimensions: ${JSON.stringify(clipBoundingBox)}`)
    console.log(`Starting drag at (${rightHandleX}, ${handleY})`)
    console.log(`Ending drag at (${targetX}, ${handleY})`)
    
    // First, try to find and interact with the right handle directly
    const rightHandle = page.locator('.right-handle, [data-testid="right-handle"], .clip-handle-right, .resize-handle-right').first()
    const rightHandleVisible = await rightHandle.isVisible().catch(() => false)
    
    if (rightHandleVisible) {
      console.log('Right handle found, dragging it directly')
      await rightHandle.dragTo(rightHandle, {
        targetPosition: { x: targetX - rightHandleX, y: 0 },
        force: true
      })
    } else {
      console.log('Right handle not found, trying to drag from the right edge of the clip')
      
      // If we can't find a specific handle, try dragging from the right edge of the clip
      await page.mouse.move(rightHandleX, handleY)
      await page.waitForTimeout(500) // Wait for any hover effects
      
      // Take a screenshot to see if we're hovering over the right spot
      await page.screenshot({ path: 'hover-before-drag.png' })
      
      await page.mouse.down()
      await page.waitForTimeout(500)
      
      // Move to target position (30 seconds = ~70% of 43 seconds)
      await page.mouse.move(targetX, handleY, { steps: 10 }) // Move in steps for smoother drag
      await page.waitForTimeout(500)
      
      await page.mouse.up()
    }
    
    // Wait for any animations or updates to complete
    await page.waitForTimeout(2000)
    
    // Take a screenshot after trimming
    await page.screenshot({ path: 'after-trim.png' })

    // Verify the clip duration has been updated to 30 seconds
    await clip.waitFor({ state: 'visible', timeout: 10000 })
    await clip.click({ force: true })
    await page.waitForTimeout(1000)

    // Take a screenshot of the clip details for debugging
    await page.screenshot({ path: 'clip-details.png' })
    
    // Try multiple ways to get the duration
    console.log('Attempting to verify clip duration...')
    
    // Method 1: Try to find any text that contains duration information
    const durationElements = [
      page.locator('[data-testid="clip-duration"]'),
      page.locator('.clip-duration'),
      page.locator('text=/Duration:\s*\d+/'),
      page.locator('text=/\d+\s*sec/'),
      page.locator('text=/\d+\s*s/'),
      page.locator('text=30')
    ]
    
    let durationFound = false
    let durationText = ''
    
    for (const element of durationElements) {
      const isVisible = await element.isVisible().catch(() => false)
      if (isVisible) {
        durationText = await element.textContent() || ''
        console.log(`Found duration element with text: ${durationText}`)
        durationFound = true
        break
      }
    }
    
    if (!durationFound) {
      console.log('Could not find duration element, checking for any numeric values in the UI')
      
      // Method 2: Look for any input with a numeric value
      const numericInputs = page.locator('input[type="number"]')
      const numericInputCount = await numericInputs.count()
      
      for (let i = 0; i < numericInputCount; i++) {
        const input = numericInputs.nth(i)
        const value = await input.inputValue().catch(() => '')
        console.log(`Found numeric input with value: ${value}`)
        if (value === '30' || value === '30.0') {
          durationText = value
          durationFound = true
          break
        }
      }
    }
    
    // This test is expected to fail because of a bug
    if (durationFound) {
      console.log(`Final duration text found: ${durationText}`)
      expect(durationText).toContain('30')
    } else {
      console.log('No duration information found, test will fail as expected due to the bug')
      expect(false).toBe(true)
    }
  })
})
