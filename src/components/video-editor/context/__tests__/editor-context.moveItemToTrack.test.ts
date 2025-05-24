import { describe, it, expect } from 'vitest'
import { Clip } from '../../types'
import { moveClipToTrackForTest } from '../move-item-test-helpers'

describe('moveClipToTrack (collision handling)', () => {
  const make = (from: number, duration: number, id: string): Clip => ({
    id,
    from,
    durationInFrames: duration,
    type: 'video',
    src: '/dummy.mp4',
    url: '/dummy.mp4'
  })

  it('places clip next to last if colliding on cross-track move', () => {
    // Track 0: clip at 0-10
    // Track 1: clip at 0-10, clip at 10-10
    const tracks = [
      { name: 'A', clips: [make(0, 10, 'a')] },
      { name: 'B', clips: [make(0, 10, 'b1'), make(10, 10, 'b2')] }
    ]
    // Try to move 'a' from track 0 to track 1 at start=5 (would collide with b1)
    const result = moveClipToTrackForTest(tracks, 0, 0, 1, 5)
    // Should place after b2 (at 20)
    expect(result[1].clips.map(i => ({ id: i.id, from: i.from }))).toEqual([
      { id: 'b1', from: 0 },
      { id: 'b2', from: 10 },
      { id: 'a', from: 20 }
    ])
    // Source track should be empty
    expect(result[0].clips).toEqual([])
  })
})
