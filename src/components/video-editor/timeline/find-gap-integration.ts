// Integration for robust gap-finding in the Remotion timeline drag-and-drop
import { findNextAvailableGap } from '../context/find-gap'
import { Clip } from '../types'

/**
 * Returns the next available position for an clip in a track, given the desired start frame and duration.
 * Used in drag-and-drop and snapping logic.
 */
export function getSnappedDropPosition({
  clips,
  desiredStartFrame,
  durationInFrames,
  ignoreClipId,
  snapToGrid = 1
}: {
  clips: Clip[]
  desiredStartFrame: number
  durationInFrames: number
  ignoreClipId?: string
  snapToGrid?: number
}): number | null {
  // Snap to grid first
  const snapped = Math.round(desiredStartFrame / snapToGrid) * snapToGrid
  // Find the next available gap
  return findNextAvailableGap(clips, snapped, durationInFrames, ignoreClipId)
}
