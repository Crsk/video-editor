import { test, expect } from '@playwright/test'

interface VideoEditor {
  tracks: Array<{
    clips: Array<{
      id: string
      type: string
      from: number
      durationInFrames: number
      src: string
    }>
    type?: string
  }>
  setTracks: (tracks: any[]) => void
}

declare global {
  interface Window {
    videoEditor?: VideoEditor
  }
}

test.setTimeout(60000)

test.describe('Timeline Clip Type Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('[data-testid="track-0"]', { state: 'visible' })
    await page.waitForTimeout(2000)
  })

  test('should prevent dragging video clip to audio track', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)

    await page.evaluate(() => {
      const tracks = window.videoEditor?.tracks || []
      if (tracks.length >= 3) {
        if (tracks[0].clips.length === 0) {
          tracks[0].clips.push({
            id: 'test-video-clip',
            type: 'video',
            from: 0,
            durationInFrames: 30,
            src: 'test-video.mp4'
          })
        } else {
          tracks[0].clips[0].type = 'video'
        }

        tracks[1].type = 'video'
        tracks[2].type = 'audio'

        if (window.videoEditor?.setTracks) {
          window.videoEditor.setTracks([...tracks])
        }
      }
    })
    await page.waitForTimeout(1000)

    const tracks = await page.locator('[data-testid^="track-"]').all()
    expect(tracks.length).toBeGreaterThanOrEqual(3)

    const videoTrack = page.locator('[data-testid="track-0"]')
    const audioTrack = page.locator('[data-testid="track-2"]')

    const videoTrackInitialClips = await videoTrack.locator('[data-testid^="clip-"]').count()
    const audioTrackInitialClips = await audioTrack.locator('[data-testid^="clip-"]').count()

    console.log(
      `Before drag: Video track clips: ${videoTrackInitialClips}, Audio track clips: ${audioTrackInitialClips}`
    )

    expect(videoTrackInitialClips).toBeGreaterThan(0)

    const videoClip = videoTrack.locator('[data-testid^="clip-"]').first()
    const sourceBox = await videoClip.boundingBox()
    const targetTrackBox = await audioTrack.boundingBox()

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
      const moveX = startX + ((endX - startX) * i) / steps
      const moveY = startY + ((endY - startY) * i) / steps
      await page.mouse.move(moveX, moveY)
      await page.waitForTimeout(50)
    }

    await page.waitForTimeout(500)

    await page.waitForTimeout(100)
    await page.mouse.up()
    await page.waitForTimeout(2000)

    const finalClipBox = await videoTrack.locator('[data-testid^="clip-"]').first().boundingBox()
    
    if (!finalClipBox) throw new Error('Could not get final clip bounding box')
    
    const originalX = sourceBox.x
    const finalX = finalClipBox.x
    const positionDifference = Math.abs(finalX - originalX)
    
    console.log(`Original clip position: ${originalX}, Final position: ${finalX}`)
    console.log(`Position difference: ${positionDifference}px`)
    
    const maxAllowedPositionChange = 5
    expect(positionDifference).toBeLessThanOrEqual(maxAllowedPositionChange)
  })

  test('should allow dragging clip to compatible track', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)

    await page.evaluate(() => {
      const tracks = window.videoEditor?.tracks || []
      if (tracks.length >= 2) {
        if (tracks[0].clips.length === 0) {
          tracks[0].clips.push({
            id: 'test-video-clip',
            type: 'video',
            from: 0,
            durationInFrames: 30,
            src: 'test-video.mp4'
          })
        } else {
          tracks[0].clips[0].type = 'video'
        }

        tracks[1].type = 'video'

        if (window.videoEditor?.setTracks) {
          window.videoEditor.setTracks([...tracks])
        }
      }
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

    expect(sourceTrackInitialClips).toBeGreaterThan(0)

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
      const moveX = startX + ((endX - startX) * i) / steps
      const moveY = startY + ((endY - startY) * i) / steps
      await page.mouse.move(moveX, moveY)
      await page.waitForTimeout(50)
    }

    await page.waitForTimeout(500)

    await page.waitForTimeout(100)
    await page.mouse.up()
    await page.waitForTimeout(2000)

    const sourceTrackClipsAfterDrag = await sourceTrack.locator('[data-testid^="clip-"]').count()
    const targetTrackClipsAfterDrag = await targetTrack.locator('[data-testid^="clip-"]').count()

    console.log(
      `After drag: Source track clips: ${sourceTrackClipsAfterDrag}, Target track clips: ${targetTrackClipsAfterDrag}`
    )

    expect(sourceTrackClipsAfterDrag).toBeLessThan(sourceTrackInitialClips)
    expect(targetTrackClipsAfterDrag).toBeGreaterThan(targetTrackInitialClips)
  })
})
