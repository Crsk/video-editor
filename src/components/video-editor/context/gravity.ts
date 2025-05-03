import { Clip } from '../types'

// Shift all clips left to fill gaps (gravity)
export function applyGravityToTrack(clips: Clip[]): Clip[] {
  if (clips.length === 0) return []
  // Sort by start frame
  const sorted = [...clips].sort((a, b) => a.from - b.from)
  let nextStart = 0
  return sorted.map(clip => {
    const shifted = { ...clip, from: nextStart }
    nextStart += clip.durationInFrames
    return shifted
  })
}
