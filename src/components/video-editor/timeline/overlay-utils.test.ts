import { getResizeOverlayRect } from './overlay-utils'
import { describe, it, expect } from 'vitest'

describe('getResizeOverlayRect', () => {
  const item = {
    from: 0,
    durationInFrames: 60,
    type: 'video',
    id: 'id'
  } as any
  const pixelsPerSecond = 100
  const minDurationSeconds = 2
  const containerRect = { left: 0, top: 0 } as DOMRect
  const trackRect = { top: 50 } as DOMRect
  const scrollLeft = 0

  it('calculates overlay for right resize', () => {
    const mouseX = 300
    const rect = getResizeOverlayRect({
      mode: 'right',
      currentItem: item,
      mouseX,
      pixelsPerSecond,
      minDurationSeconds,
      trackRect,
      containerRect,
      scrollLeft
    })
    expect(rect.left).toBe(0)
    expect(rect.width).toBe(300)
    expect(rect.top).toBe(50)
    expect(rect.height).toBe(28)
    expect(rect.label).toBe('Video')
  })

  it('enforces min width for right resize', () => {
    const mouseX = 50
    const rect = getResizeOverlayRect({
      mode: 'right',
      currentItem: item,
      mouseX,
      pixelsPerSecond,
      minDurationSeconds,
      trackRect,
      containerRect,
      scrollLeft
    })
    expect(rect.width).toBe(minDurationSeconds * pixelsPerSecond)
  })

  it('calculates overlay for left resize', () => {
    const mouseX = 100
    const rect = getResizeOverlayRect({
      mode: 'left',
      currentItem: item,
      mouseX,
      pixelsPerSecond,
      minDurationSeconds,
      trackRect,
      containerRect,
      scrollLeft
    })
    // Debug log
    console.log('mouseX:', mouseX, 'rect.left:', rect.left, 'rect:', rect)
    // originalRightX = (0+60)/30*100=200
    // width = 200-100=100 < min (200), so left=0, width=200
    expect(rect.left).toBe(0)
    expect(rect.width).toBe(200)
    expect(rect.top).toBe(50)
    expect(rect.height).toBe(28)
    expect(rect.label).toBe('Video')
  })
})
