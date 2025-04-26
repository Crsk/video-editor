import { describe, it, expect } from 'vitest'
import { applyGravityToTrack } from '../gravity'
import { Item } from '../../types'

describe('applyGravityToTrack', () => {
  const make = (from: number, duration: number, id: string): Item => ({
    id,
    from,
    durationInFrames: duration,
    type: 'video',
    src: '/dummy.mp4'
  })

  it('shifts all items left to fill gaps', () => {
    const items = [make(10, 5, 'a'), make(20, 5, 'b'), make(30, 5, 'c')]
    const result = applyGravityToTrack(items)
    expect(result.map((i: Item) => i.from)).toEqual([0, 5, 10])
  })

  it('works with items already contiguous', () => {
    const items = [make(0, 5, 'a'), make(5, 5, 'b'), make(10, 5, 'c')]
    const result = applyGravityToTrack(items)
    expect(result.map((i: Item) => i.from)).toEqual([0, 5, 10])
  })

  it('works with single item', () => {
    const items = [make(20, 5, 'a')]
    const result = applyGravityToTrack(items)
    expect(result.map((i: Item) => i.from)).toEqual([0])
  })

  it('works with empty array', () => {
    expect(applyGravityToTrack([])).toEqual([])
  })

  it('preserves order and duration', () => {
    const items = [make(20, 5, 'a'), make(40, 10, 'b'), make(70, 3, 'c')]
    const result = applyGravityToTrack(items)
    expect(result.map((i: Item) => i.id)).toEqual(['a', 'b', 'c'])
    expect(result.map((i: Item) => i.from)).toEqual([0, 5, 15])
    expect(result.map((i: Item) => i.durationInFrames)).toEqual([5, 10, 3])
  })
})
