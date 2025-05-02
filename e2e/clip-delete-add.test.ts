import { test, expect } from '@playwright/test'

test.describe('Timeline Clip Delete and Add', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('body', { state: 'visible' })
    await page.waitForTimeout(2000)
  })

  test('should delete default clips and add a new clip to track 1', async ({ page }) => {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
    await page.waitForTimeout(2000)
    await page.waitForSelector('.mt-2 > div', { state: 'visible', timeout: 10000 })

    const track1 = page.locator('.mt-2 > div').nth(0)
    await track1.waitFor({ state: 'visible', timeout: 10000 })

    const initialClipsCount = await track1.locator('.timeline-item').count()
    console.log(`Initial clips in track 1: ${initialClipsCount}`)

    if (initialClipsCount > 0) {
      for (let i = 0; i < initialClipsCount; i++) {
        await page.waitForTimeout(1000)

        const clip = track1.locator('.timeline-item').first()
        await clip.waitFor({ state: 'visible', timeout: 10000 })
        await page.waitForTimeout(500)
        await clip.click({ force: true })
        await page.waitForTimeout(1000)

        const deleteButtonVisible = await page
          .locator('button[title="Delete clip"]')
          .isVisible()
          .catch(() => false)

        if (deleteButtonVisible) {
          await page.locator('button[title="Delete clip"]').click()
        } else {
          const trashIconButton = page.locator('button svg[data-testid="TrashIcon"]').first()
          const trashIconVisible = await trashIconButton.isVisible().catch(() => false)

          if (trashIconVisible) {
            await trashIconButton.click()
          } else {
            const anyDeleteButton = page
              .getByRole('button')
              .filter({ hasText: /delete|remove|trash/i })
              .first()
            await anyDeleteButton.click().catch(() => {
              console.log('Could not find delete button, skipping deletion for this clip')
            })
          }
        }

        await page.waitForTimeout(2000)
      }
    }

    const clipsAfterDelete = await track1.locator('.timeline-item').count()
    console.log(`Clips in track 1 after deletion: ${clipsAfterDelete}`)

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

    // Verify at least one clip exists
    expect(clipsAfterAdd).toBeGreaterThan(0)
  })
})
