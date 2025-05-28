import { describe, it, expect } from 'vitest'
import { applyGravityToTrack } from '../gravity'
import { Clip } from '../../types'

describe('applyGravityToTrack', () => {
  const make = (from: number, duration: number, id: string): Clip => ({
    id,
    from,
    durationInFrames: duration,
    type: 'video',
    src: '/dummy.mp4'
  })

  it('shifts all clips left to fill gaps', () => {
    const clips = [make(10, 5, 'a'), make(20, 5, 'b'), make(30, 5, 'c')]
    const result = applyGravityToTrack(clips)
    expect(result.map((i: Clip) => i.from)).toEqual([0, 5, 10])
  })

  it('works with clips already contiguous', () => {
    const clips = [make(0, 5, 'a'), make(5, 5, 'b'), make(10, 5, 'c')]
    const result = applyGravityToTrack(clips)
    expect(result.map((i: Clip) => i.from)).toEqual([0, 5, 10])
  })

  it('works with single clip', () => {
    const clips = [make(20, 5, 'a')]
    const result = applyGravityToTrack(clips)
    expect(result.map((i: Clip) => i.from)).toEqual([0])
  })

  it('works with empty array', () => {
    expect(applyGravityToTrack([])).toEqual([])
  })

  it('preserves order and duration', () => {
    const clips = [make(20, 5, 'a'), make(40, 10, 'b'), make(70, 3, 'c')]
    const result = applyGravityToTrack(clips)
    expect(result.map((i: Clip) => i.id)).toEqual(['a', 'b', 'c'])
    expect(result.map((i: Clip) => i.from)).toEqual([0, 5, 15])
    expect(result.map((i: Clip) => i.durationInFrames)).toEqual([5, 10, 3])
  })
})
