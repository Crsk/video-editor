import { Track } from '../types'
import { applyGravityToTrack } from './gravity'

// Pure function for test: mimics moveClipToTrack logic but returns new tracks array
export function moveClipToTrackForTest(
  tracks: Track[],
  sourceClipIndex: number,
  ClipIndex: number,
  targetClipIndex: number,
  newStartFrame: number
): Track[] {
  const sourceTrack = tracks[sourceClipIndex]
  const targetTrack = tracks[targetClipIndex]
  const movingClip = { ...sourceTrack.clips[ClipIndex], from: newStartFrame }

  // Check for collision in target track
  const hasCollision = targetTrack.clips.some(clip => {
    const ClipStart = clip.from
    const ClipEnd = clip.from + clip.durationInFrames
    const movingEnd = newStartFrame + movingClip.durationInFrames
    return !(movingEnd <= ClipStart || newStartFrame >= ClipEnd)
  })

  let newTargetClips
  if (hasCollision) {
    // Place after last clip
    const last = targetTrack.clips[targetTrack.clips.length - 1]
    const forcedStart = last ? last.from + last.durationInFrames : 0
    newTargetClips = [...targetTrack.clips, { ...movingClip, from: forcedStart }]
  } else {
    newTargetClips = [...targetTrack.clips, movingClip]
  }

  // Remove from source
  const newSourceClips = sourceTrack.clips.filter((_, idx) => idx !== ClipIndex)

  // Apply gravity to both tracks
  const gravitatedSourceClips = applyGravityToTrack(newSourceClips)
  const gravitatedTargetClips = applyGravityToTrack(newTargetClips)

  return tracks.map((track, idx) => {
    if (idx === sourceClipIndex) return { ...track, clips: gravitatedSourceClips }
    if (idx === targetClipIndex) return { ...track, clips: gravitatedTargetClips }
    return track
  })
}
