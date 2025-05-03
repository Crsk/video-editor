import { Track } from '../types'

const FPS = 30

/**
 * Zoom level configuration for timeline
 */
export interface ZoomLevel {
  secondsPerMarker: number
  markersOnScreen: number
  label: string
}

/**
 * Calculate the maximum end time across all tracks
 * @param tracks All timeline tracks
 * @param filterType Optional type to filter by (e.g., 'video', 'audio')
 * @returns Maximum end time in seconds
 */
export function calculateMaxEndTime(tracks: Track[], filterType?: string): number {
  return tracks
    .flatMap(t => t.clips)
    .filter(clip => !filterType || clip.type === filterType)
    .reduce((max, clip) => {
      const endTime = (clip.from + clip.durationInFrames) / FPS
      return Math.max(max, endTime)
    }, 0)
}

/**
 * Calculate the total timeline duration considering all factors
 * @param durationInSeconds Duration from video tracks in seconds
 * @param tracks All timeline tracks
 * @param minimumDuration Minimum timeline duration in seconds
 * @returns Total timeline duration in seconds
 */
export function calculateTotalTimelineDuration(
  durationInSeconds: number,
  tracks: Track[],
  minimumDuration: number = 10
): number {
  const maxEndTimeAllTracks = calculateMaxEndTime(tracks)

  return Math.max(durationInSeconds, maxEndTimeAllTracks, minimumDuration)
}

/**
 * Generate time markers for the timeline
 * @param totalDuration Total timeline duration in seconds
 * @param secondsPerMarker Seconds between each marker
 * @param minVisibleMarkers Minimum number of markers to display
 * @returns Array of time markers in seconds
 */
export function generateTimeMarkers(
  totalDuration: number,
  secondsPerMarker: number,
  markersOnScreen: number
): number[] {
  const timeMarkers: number[] = []

  // Calculate how many markers we need to cover the entire timeline
  const requiredMarkers = Math.ceil(totalDuration / secondsPerMarker) + 1

  // Ensure we have enough markers for the visible area and the entire timeline
  const minVisibleMarkers = Math.max(
    requiredMarkers,
    Math.ceil(markersOnScreen * 2) // Double the markers to ensure we have enough for the visible area
  )

  for (let i = 0; i < minVisibleMarkers; i++) {
    const seconds = i * secondsPerMarker
    timeMarkers.push(seconds)
  }

  return timeMarkers
}

/**
 * Calculate the total timeline width in pixels
 * @param timeMarkers Array of time markers
 * @param totalDuration Total timeline duration in seconds
 * @param pixelsPerSecond Pixels per second ratio
 * @param containerWidth Container width in pixels
 * @returns Total timeline width in pixels
 */
export function calculateTimelineWidth(
  timeMarkers: number[],
  totalDuration: number,
  pixelsPerSecond: number,
  containerWidth: number
): number {
  return Math.max(
    (timeMarkers.length > 0 ? timeMarkers[timeMarkers.length - 1] : totalDuration) * pixelsPerSecond,
    containerWidth
  )
}

/**
 * Calculate pixels per second based on zoom level and container width
 * @param containerWidth Width of the container in pixels
 * @param zoomLevel Current zoom level configuration
 * @returns Pixels per second ratio
 */
export function calculatePixelsPerSecond(containerWidth: number, zoomLevel: ZoomLevel): number {
  return containerWidth / (zoomLevel.secondsPerMarker * zoomLevel.markersOnScreen)
}

/**
 * Calculate time in seconds from a mouse click position
 * @param clientX Client X position of the mouse click
 * @param containerRect Bounding client rect of the timeline container
 * @param scrollLeft Scroll left position of the timeline container
 * @param pixelsPerSecond Pixels per second ratio
 * @param maxDuration Maximum duration in seconds (to clamp the result)
 * @returns Time in seconds
 */
export function calculateTimeFromClick(
  clientX: number,
  containerRect: DOMRect,
  scrollLeft: number,
  pixelsPerSecond: number,
  maxDuration: number
): number {
  const relativeX = clientX - containerRect.left + scrollLeft
  const newTimeInSeconds = relativeX / pixelsPerSecond

  return Math.max(0, Math.min(newTimeInSeconds, maxDuration))
}

/**
 * Calculate the position where video content ends
 * @param maxEndTimeVideoTracks Maximum end time for video tracks in seconds
 * @param pixelsPerSecond Pixels per second ratio
 * @returns Position in pixels
 */
export function calculateVideoEndPosition(maxEndTimeVideoTracks: number, pixelsPerSecond: number): number {
  return maxEndTimeVideoTracks * pixelsPerSecond
}

/**
 * Calculate the width of the non-playable region
 * @param totalTimelineWidth Total timeline width in pixels
 * @param videoEndPosition Position where video content ends in pixels
 * @returns Width of the non-playable region in pixels
 */
export function calculateNonPlayableWidth(totalTimelineWidth: number, videoEndPosition: number): number {
  return totalTimelineWidth - videoEndPosition
}
