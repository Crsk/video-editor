import { describe, expect, it } from 'vitest'
import { findNextAvailableGap } from '../find-gap'
import { Clip } from '../../types'

describe('findNextAvailableGap', () => {
  it('gravity: fills earliest start gap even if desired is later', () => {
    const make = (from: number, duration: number, id: string): Clip => ({
      id,
      from,
      durationInFrames: duration,
      type: 'video',
      src: '/dummy.mp4',
      url: '/dummy.mp4'
    })
    // Clips at 10-20 and 30-40, gap at 0-10 and 20-30
    const clips = [make(10, 10, 'a'), make(30, 10, 'b')]
    // Try to drop at 25, but earliest gap is at 0
    expect(findNextAvailableGap(clips, 25, 10)).toBe(0)
  })

  it('gravity: fills earliest available gap between clips', () => {
    const make = (from: number, duration: number, id: string): Clip => ({
      id,
      from,
      durationInFrames: duration,
      type: 'video',
      src: '/dummy.mp4',
      url: '/dummy.mp4'
    })
    // Clips at 0-10 and 20-30, gap at 10-20
    const clips = [make(0, 10, 'a'), make(20, 10, 'b')]
    // Try to drop at 25, but earliest gap is at 10
    expect(findNextAvailableGap(clips, 25, 10)).toBe(10)
  })

  it('gravity: returns null if no gap fits', () => {
    const make = (from: number, duration: number, id: string): Clip => ({
      id,
      from,
      durationInFrames: duration,
      type: 'video',
      src: '/dummy.mp4',
      url: '/dummy.mp4'
    })
    // Clips fill the whole timeline
    const clips = [make(0, 10, 'a'), make(10, 10, 'b')]
    expect(findNextAvailableGap(clips, 0, 10)).toBe(null)
  })

  const make = (from: number, duration: number, id: string): Clip => ({
    id,
    from,
    durationInFrames: duration,
    type: 'video',
    src: '/dummy.mp4',
    url: '/dummy.mp4'
  })

  it('returns earliest available gap even if desired position would fit', () => {
    const clips = [make(0, 10, 'a'), make(20, 10, 'b')]
    // Gravity: earliest gap is at 10, even though 12 would fit
    expect(findNextAvailableGap(clips, 12, 5)).toBe(10)
  })

  it('skips over a single collision', () => {
    const clips = [make(0, 10, 'a'), make(20, 10, 'b')]
    expect(findNextAvailableGap(clips, 5, 10)).toBe(10)
  })

  it('returns null if no gap available', () => {
    const clips = [make(0, 10, 'a'), make(10, 10, 'b')]
    // No gap of size 20 exists
    expect(findNextAvailableGap(clips, 5, 20)).toBe(null)
  })

  it('ignores the specified clip', () => {
    const clips = [make(0, 10, 'a'), make(10, 10, 'b')]
    expect(findNextAvailableGap(clips, 0, 10, 'a')).toBe(0)
  })
})
