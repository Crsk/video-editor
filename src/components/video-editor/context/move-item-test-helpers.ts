import { Track } from '../types'
import { applyGravityToTrack } from './gravity'

// Pure function for test: mimics moveItemToTrack logic but returns new tracks array
export function moveItemToTrackForTest(
  tracks: Track[],
  sourceClipIndex: number,
  itemIndex: number,
  targetClipIndex: number,
  newStartFrame: number
): Track[] {
  const sourceTrack = tracks[sourceClipIndex]
  const targetTrack = tracks[targetClipIndex]
  const movingItem = { ...sourceTrack.items[itemIndex], from: newStartFrame }

  // Check for collision in target track
  const hasCollision = targetTrack.items.some(item => {
    const itemStart = item.from
    const itemEnd = item.from + item.durationInFrames
    const movingEnd = newStartFrame + movingItem.durationInFrames
    return !(movingEnd <= itemStart || newStartFrame >= itemEnd)
  })

  let newTargetItems
  if (hasCollision) {
    // Place after last item
    const last = targetTrack.items[targetTrack.items.length - 1]
    const forcedStart = last ? last.from + last.durationInFrames : 0
    newTargetItems = [...targetTrack.items, { ...movingItem, from: forcedStart }]
  } else {
    newTargetItems = [...targetTrack.items, movingItem]
  }

  // Remove from source
  const newSourceItems = sourceTrack.items.filter((_, idx) => idx !== itemIndex)

  // Apply gravity to both tracks
  const gravitatedSourceItems = applyGravityToTrack(newSourceItems)
  const gravitatedTargetItems = applyGravityToTrack(newTargetItems)

  return tracks.map((track, idx) => {
    if (idx === sourceClipIndex) return { ...track, items: gravitatedSourceItems }
    if (idx === targetClipIndex) return { ...track, items: gravitatedTargetItems }
    return track
  })
}
