// Integration for robust gap-finding in the Remotion timeline drag-and-drop
import { findNextAvailableGap } from '../context/find-gap'
import { Item } from '../types'

/**
 * Returns the next available position for an item in a track, given the desired start frame and duration.
 * Used in drag-and-drop and snapping logic.
 */
export function getSnappedDropPosition({
  items,
  desiredStartFrame,
  durationInFrames,
  ignoreItemId,
  snapToGrid = 1
}: {
  items: Item[]
  desiredStartFrame: number
  durationInFrames: number
  ignoreItemId?: string
  snapToGrid?: number
}): number | null {
  // Snap to grid first
  const snapped = Math.round(desiredStartFrame / snapToGrid) * snapToGrid
  // Find the next available gap
  return findNextAvailableGap(items, snapped, durationInFrames, ignoreItemId)
}
