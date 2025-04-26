import { describe, it, expect } from 'vitest'
import { Item } from '../../types'
import { moveItemToTrackForTest } from '../move-item-test-helpers'

describe('moveItemToTrack (collision handling)', () => {
  const make = (from: number, duration: number, id: string): Item => ({
    id,
    from,
    durationInFrames: duration,
    type: 'video',
    src: '/dummy.mp4'
  })

  it('places item next to last if colliding on cross-track move', () => {
    // Track 0: item at 0-10
    // Track 1: item at 0-10, item at 10-10
    const tracks = [
      { name: 'A', items: [make(0, 10, 'a')] },
      { name: 'B', items: [make(0, 10, 'b1'), make(10, 10, 'b2')] }
    ]
    // Try to move 'a' from track 0 to track 1 at start=5 (would collide with b1)
    const result = moveItemToTrackForTest(tracks, 0, 0, 1, 5)
    // Should place after b2 (at 20)
    expect(result[1].items.map(i => ({ id: i.id, from: i.from }))).toEqual([
      { id: 'b1', from: 0 },
      { id: 'b2', from: 10 },
      { id: 'a', from: 20 }
    ])
    // Source track should be empty
    expect(result[0].items).toEqual([])
  })
})
