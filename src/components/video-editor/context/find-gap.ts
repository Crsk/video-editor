import { Item } from '../types'

/**
 * Find the next available gap (frame index) in a track for an item of given duration.
 * All calculations are in frames.
 * @param items Items in the track (should be sorted by .from ascending)
 * @param desiredStartFrame Where the user wants to start the item
 * @param durationInFrames How long the item is
 * @param ignoreItemId (optional) If moving an existing item, ignore its current position
 * @returns The start frame of the next available gap, or null if none found
 */
export function findNextAvailableGap(
  items: Item[],
  desiredStartFrame: number,
  durationInFrames: number,
  ignoreItemId?: string
): number | null {
  // Filter out the item being moved if needed
  const filtered = ignoreItemId ? items.filter(i => i.id !== ignoreItemId) : items.slice()
  // Sort by start
  filtered.sort((a, b) => a.from - b.from)

  if (filtered.length === 0) {
    return desiredStartFrame
  }

  // Gravity: always fill the earliest gap, regardless of desiredStartFrame
  const first = filtered[0]
  if (durationInFrames <= first.from) {
    return 0
  }

  // Check all gaps between items for the earliest fit
  for (let i = 0; i < filtered.length - 1; i++) {
    const current = filtered[i]
    const next = filtered[i + 1]
    const gapStart = current.from + current.durationInFrames
    const gapEnd = next.from
    const gapSize = gapEnd - gapStart
    if (gapSize >= durationInFrames) {
      return gapStart
    }
  }

  // After last item: only allow if desiredStartFrame is after the last item
  const last = filtered[filtered.length - 1]
  if (desiredStartFrame >= last.from + last.durationInFrames) {
    return desiredStartFrame
  }
  return null
}
