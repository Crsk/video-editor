import { test, expect } from '@playwright/test'

test.setTimeout(60000)

test.describe('Timeline Clip Delete and Add', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('body', { state: 'visible' })
    await page.waitForTimeout(2000)
  })

  test('should delete default clips and add a new clip to track 1', async ({ page }) => {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
    await page.waitForTimeout(2000)
    await page.waitForSelector('[data-testid="track-0"]', { state: 'visible', timeout: 10000 })

    const track1 = page.locator('[data-testid="track-0"]')
    await track1.waitFor({ state: 'visible', timeout: 10000 })

    const initialClipsCount = await track1.locator('[data-testid^="clip-"]').count()
    console.log(`Initial clips in track 1: ${initialClipsCount}`)

    if (initialClipsCount > 0) {
      for (let i = 0; i < initialClipsCount; i++) {
        console.log(`Attempting to delete clip ${i + 1} of ${initialClipsCount}`)

        // Get the current count before deletion
        const currentCount = await track1.locator('[data-testid^="clip-"]').count()
        console.log(`Current clip count before deletion: ${currentCount}`)

        // If we've already deleted all clips, break out of the loop
        if (currentCount === 0) {
          console.log('No more clips to delete')
          break
        }

        // Select the first clip
        const clip = track1.locator('[data-testid^="clip-"]').first()
        await clip.waitFor({ state: 'visible', timeout: 10000 })
        await page.waitForTimeout(500)
        await clip.click({ force: true })
        await page.waitForTimeout(1000)

        // Try to find the delete button directly
        let deleteButtonVisible = await page
          .locator('button:has-text("Delete Clip")')
          .isVisible()
          .catch(() => false)

        // If delete button is not visible, try to open the settings
        if (!deleteButtonVisible) {
          console.log('Delete button not visible, trying to open settings')
          const clipSettingsButton = await page.locator('button:has-text("Clip Settings")').isVisible()

          if (clipSettingsButton) {
            console.log('Found settings button, clicking it')
            await page.locator('button:has-text("Clip Settings")').click()
            await page.waitForTimeout(500)

            // Now check for delete button again
            deleteButtonVisible = await page
              .locator('button:has-text("Delete Clip")')
              .isVisible()
              .catch(() => false)
          }
        }

        // Click the delete button if found
        if (deleteButtonVisible) {
          console.log('Found delete button, clicking it')
          await page.locator('button:has-text("Delete Clip")').click()
        } else {
          // If we can't find the delete button, fail the test
          console.error('Could not find delete button after trying all options')
          expect(deleteButtonVisible).toBe(true)
        }

        // Wait for deletion to complete
        await page.waitForTimeout(2000)

        // Verify the clip was actually deleted
        const countAfterThisDeletion = await track1.locator('[data-testid^="clip-"]').count()
        console.log(`Clip count after this deletion: ${countAfterThisDeletion}`)

        // Expect the count to be reduced by 1
        expect(countAfterThisDeletion).toBe(currentCount - 1)
      }
    }

    const clipsAfterDelete = await track1.locator('[data-testid^="clip-"]').count()
    console.log(`Clips in track 1 after deletion: ${clipsAfterDelete}`)

    // Verify all clips were deleted
    expect(clipsAfterDelete).toBe(0)

    const useTestFileButton = page.getByText('Use Test File')
    await useTestFileButton.waitFor({ state: 'visible', timeout: 10000 })
    await useTestFileButton.click()
    await page.waitForTimeout(1000)

    // Make sure track 1 is selected in the dropdown
    const trackSelector = page.locator('select')
    await trackSelector.waitFor({ state: 'visible', timeout: 10000 })
    await trackSelector.selectOption('0') // Select first option (Track 1)

    // Wait for the loading state to appear and disappear
    const loadingText = page.getByText('Loading...')
    try {
      await loadingText.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
      await loadingText.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {})
    } catch (error) {
      console.log('Loading state might not be visible, continuing test')
    }

    // Wait for any network activity to settle
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(1000)

    // Verify a new clip was added to track 1
    await track1.waitFor({ state: 'visible', timeout: 10000 })

    // Wait for the clip to appear with retries
    let clipsAfterAdd = 0
    for (let attempt = 0; attempt < 5; attempt++) {
      clipsAfterAdd = await track1.locator('[data-testid^="clip-"]').count()
      console.log(`Attempt ${attempt + 1}: Clips in track 1 after adding new clip: ${clipsAfterAdd}`)

      if (clipsAfterAdd > 0) break

      await page.waitForTimeout(1000)
    }

    // Verify at least one clip exists
    expect(clipsAfterAdd).toBeGreaterThan(0)
  })
})
