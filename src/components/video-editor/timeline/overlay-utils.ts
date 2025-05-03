import { Clip } from '../types'

export interface ResizeOverlayRectParams {
  mode: 'left' | 'right'
  currentClip: Clip
  mouseX: number
  pixelsPerSecond: number
  minDurationSeconds: number
  trackRect: DOMRect | null
  containerRect: DOMRect
  scrollLeft: number
}

export function getResizeOverlayRect({
  mode,
  currentClip,
  mouseX,
  pixelsPerSecond,
  minDurationSeconds,
  trackRect,
  containerRect,
  scrollLeft
}: ResizeOverlayRectParams) {
  let left = 0
  let width = 0
  if (mode === 'left') {
    const originalRightX = ((currentClip.from + currentClip.durationInFrames) / 30) * pixelsPerSecond
    width = originalRightX - mouseX
    left = mouseX
    if (width < minDurationSeconds * pixelsPerSecond) {
      width = minDurationSeconds * pixelsPerSecond
      left = originalRightX - width
    }
  } else {
    left = (currentClip.from / 30) * pixelsPerSecond
    width = mouseX - left
    if (width < minDurationSeconds * pixelsPerSecond) width = minDurationSeconds * pixelsPerSecond
  }
  let overlayTop = containerRect.top
  if (trackRect) {
    overlayTop = trackRect.top
  }
  return {
    left: Math.round(containerRect.left + left - scrollLeft),
    top: Math.round(overlayTop),
    width: Math.round(width),
    height: 28,
    label: currentClip.type.charAt(0).toUpperCase() + currentClip.type.slice(1)
  }
}
