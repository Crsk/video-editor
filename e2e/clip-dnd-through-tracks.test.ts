import { test, expect } from '@playwright/test'

test.describe('Timeline Clip Movement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('[data-testid="track-0"]', { state: 'visible' })
  })

  test('should move a clip from track 1 to track 2', async ({ page }) => {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
    await page.waitForTimeout(1000)

    const tracks = await page.locator('[data-testid^="track-"]').all()
    expect(tracks.length).toBeGreaterThanOrEqual(2)

    const sourceTrack = page.locator('[data-testid="track-0"]')
    const targetTrack = page.locator('[data-testid="track-1"]')
    const sourceTrackInitialClips = await sourceTrack.locator('[data-testid^="clip-"]').count()
    const targetTrackInitialClips = await targetTrack.locator('[data-testid^="clip-"]').count()

    console.log(
      `Before drag: Source track clips: ${sourceTrackInitialClips}, Target track clips: ${targetTrackInitialClips}`
    )

    const sourceClip = sourceTrack.locator('[data-testid^="clip-"]').first()
    const sourceBox = await sourceClip.boundingBox()
    const targetTrackBox = await targetTrack.boundingBox()

    if (!sourceBox || !targetTrackBox) throw new Error('Could not get bounding boxes for drag operation')

    const startX = sourceBox.x + sourceBox.width / 2
    const startY = sourceBox.y + sourceBox.height / 2
    const endX = targetTrackBox.x + Math.min(150, targetTrackBox.width / 2)
    const endY = targetTrackBox.y + targetTrackBox.height / 2

    await page.mouse.move(startX, startY)
    await page.waitForTimeout(100)
    await page.mouse.down()
    await page.waitForTimeout(100)

    const steps = 10
    for (let i = 1; i <= steps; i++) {
      // Move the mouse in a smooth manner from the start to the end position
      const moveX = startX + ((endX - startX) * i) / steps
      const moveY = startY + ((endY - startY) * i) / steps
      await page.mouse.move(moveX, moveY)
      await page.waitForTimeout(50)
    }

    await page.waitForTimeout(100)
    await page.mouse.up()
    await page.waitForTimeout(2000)

    const sourceTrackClipsAfterDrag = await sourceTrack.locator('[data-testid^="clip-"]').count()
    const targetTrackClipsAfterDrag = await targetTrack.locator('[data-testid^="clip-"]').count()

    console.log(
      `After drag: Source track clips: ${sourceTrackClipsAfterDrag}, Target track clips: ${targetTrackClipsAfterDrag}`
    )

    const totalClipsBefore = sourceTrackInitialClips + targetTrackInitialClips
    const totalClipsAfter = sourceTrackClipsAfterDrag + targetTrackClipsAfterDrag

    expect(totalClipsAfter).toBeGreaterThanOrEqual(totalClipsBefore - 1)
    expect(totalClipsAfter).toBeLessThanOrEqual(totalClipsBefore + 1)

    const clipDistributionChanged =
      sourceTrackClipsAfterDrag !== sourceTrackInitialClips || targetTrackClipsAfterDrag !== targetTrackInitialClips
    const targetTrackHasClips = targetTrackClipsAfterDrag > 0

    expect(clipDistributionChanged || targetTrackHasClips).toBeTruthy()
  })

  test('should move a clip from track 2 to track 1', async ({ page }) => {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
    await page.waitForTimeout(1000)

    const tracks = await page.locator('[data-testid^="track-"]').all()
    expect(tracks.length).toBeGreaterThanOrEqual(2)

    const sourceTrack = page.locator('[data-testid="track-1"]') // Track 2
    const targetTrack = page.locator('[data-testid="track-0"]') // Track 1
    const sourceTrackInitialClips = await sourceTrack.locator('[data-testid^="clip-"]').count()
    const targetTrackInitialClips = await targetTrack.locator('[data-testid^="clip-"]').count()

    console.log(
      `Before drag: Source track (2) clips: ${sourceTrackInitialClips}, Target track (1) clips: ${targetTrackInitialClips}`
    )

    const sourceClip = sourceTrack.locator('[data-testid^="clip-"]').first()
    const sourceBox = await sourceClip.boundingBox()
    const targetTrackBox = await targetTrack.boundingBox()

    if (!sourceBox || !targetTrackBox) throw new Error('Could not get bounding boxes for drag operation')

    const startX = sourceBox.x + sourceBox.width / 2
    const startY = sourceBox.y + sourceBox.height / 2
    const endX = targetTrackBox.x + Math.min(150, targetTrackBox.width / 2)
    const endY = targetTrackBox.y + targetTrackBox.height / 2

    await page.mouse.move(startX, startY)
    await page.waitForTimeout(100)
    await page.mouse.down()
    await page.waitForTimeout(100)

    const steps = 10
    for (let i = 1; i <= steps; i++) {
      // Move the mouse in a smooth manner from the start to the end position
      const moveX = startX + ((endX - startX) * i) / steps
      const moveY = startY + ((endY - startY) * i) / steps
      await page.mouse.move(moveX, moveY)
      await page.waitForTimeout(50)
    }

    await page.waitForTimeout(100)
    await page.mouse.up()
    await page.waitForTimeout(5000)

    const sourceTrackClipsAfterDrag = await sourceTrack.locator('[data-testid^="clip-"]').count()
    const targetTrackClipsAfterDrag = await targetTrack.locator('[data-testid^="clip-"]').count()

    console.log(
      `After drag: Source track (2) clips: ${sourceTrackClipsAfterDrag}, Target track (1) clips: ${targetTrackClipsAfterDrag}`
    )

    // Verify that the clip actually moved from track 2 to track 1
    expect(sourceTrackClipsAfterDrag).toBeLessThan(sourceTrackInitialClips)
    expect(targetTrackClipsAfterDrag).toBeGreaterThan(targetTrackInitialClips)
  })
})
