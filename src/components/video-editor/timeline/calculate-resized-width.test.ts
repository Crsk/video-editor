import { describe, it, expect } from 'vitest'
import { calculateResizedWidth } from './calculate-resized-width'

describe('calculateResizedWidth', () => {
  const pixelsPerSecond = 100
  const minDurationSeconds = 2
  const maxDurationSeconds = 10

  it('calculates width for right resize within bounds', () => {
    const width = calculateResizedWidth({
      mode: 'right',
      mouseX: 500,
      itemStartX: 200,
      pixelsPerSecond,
      minDurationSeconds,
      maxDurationSeconds
    })
    expect(width).toBe(300)
  })

  it('enforces minimum width for right resize', () => {
    const width = calculateResizedWidth({
      mode: 'right',
      mouseX: 210,
      itemStartX: 200,
      pixelsPerSecond,
      minDurationSeconds,
      maxDurationSeconds
    })
    expect(width).toBe(minDurationSeconds * pixelsPerSecond)
  })

  it('calculates width lower than original when shrinking a little (right resize)', () => {
    // Original width: 300 (mouseX: 500, itemStartX: 200)
    const originalWidth = calculateResizedWidth({
      mode: 'right',
      mouseX: 500,
      itemStartX: 200,
      pixelsPerSecond,
      minDurationSeconds,
      maxDurationSeconds
    })
    // Shrink by 50px
    const shrunkWidth = calculateResizedWidth({
      mode: 'right',
      mouseX: 450,
      itemStartX: 200,
      pixelsPerSecond,
      minDurationSeconds,
      maxDurationSeconds
    })
    expect(shrunkWidth).toBeLessThan(originalWidth)
    expect(shrunkWidth).toBe(250)
    // Should not go below min width
    const minWidth = minDurationSeconds * pixelsPerSecond
    const tooSmallWidth = calculateResizedWidth({
      mode: 'right',
      mouseX: 100,
      itemStartX: 200,
      pixelsPerSecond,
      minDurationSeconds,
      maxDurationSeconds
    })
    expect(tooSmallWidth).toBe(minWidth)
  })

  it('enforces maximum width for right resize', () => {
    const width = calculateResizedWidth({
      mode: 'right',
      mouseX: 2000,
      itemStartX: 200,
      pixelsPerSecond,
      minDurationSeconds,
      maxDurationSeconds
    })
    expect(width).toBe(maxDurationSeconds * pixelsPerSecond)
  })

  it('calculates width for left resize within bounds', () => {
    // For left: width = itemStartX + maxDurationSeconds * pixelsPerSecond - mouseX
    const width = calculateResizedWidth({
      mode: 'left',
      mouseX: 200,
      itemStartX: 200,
      pixelsPerSecond,
      minDurationSeconds,
      maxDurationSeconds
    })
    expect(width).toBe(200 + maxDurationSeconds * pixelsPerSecond - 200)
  })

  it('enforces minimum width for left resize', () => {
    const width = calculateResizedWidth({
      mode: 'left',
      mouseX: 2000,
      itemStartX: 200,
      pixelsPerSecond,
      minDurationSeconds,
      maxDurationSeconds
    })
    expect(width).toBe(minDurationSeconds * pixelsPerSecond)
  })

  it('enforces maximum width for left resize', () => {
    const width = calculateResizedWidth({
      mode: 'left',
      mouseX: -5000,
      itemStartX: 200,
      pixelsPerSecond,
      minDurationSeconds,
      maxDurationSeconds
    })
    expect(width).toBe(maxDurationSeconds * pixelsPerSecond)
  })
})
