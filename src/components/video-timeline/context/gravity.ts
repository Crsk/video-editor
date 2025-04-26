import { Item } from '../types'

// Shift all items left to fill gaps (gravity)
export function applyGravityToTrack(items: Item[]): Item[] {
  if (items.length === 0) return []
  // Sort by start frame
  const sorted = [...items].sort((a, b) => a.from - b.from)
  let nextStart = 0
  return sorted.map(item => {
    const shifted = { ...item, from: nextStart }
    nextStart += item.durationInFrames
    return shifted
  })
}
