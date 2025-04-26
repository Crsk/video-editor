import { Item } from '../types'

export interface ResizeOverlayRectParams {
  mode: 'left' | 'right'
  currentItem: Item
  mouseX: number
  pixelsPerSecond: number
  minDurationSeconds: number
  trackRect: DOMRect | null
  containerRect: DOMRect
  scrollLeft: number
}

export function getResizeOverlayRect({
  mode,
  currentItem,
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
    const originalRightX = ((currentItem.from + currentItem.durationInFrames) / 30) * pixelsPerSecond
    width = originalRightX - mouseX
    left = mouseX
    if (width < minDurationSeconds * pixelsPerSecond) {
      width = minDurationSeconds * pixelsPerSecond
      left = originalRightX - width
    }
  } else {
    left = (currentItem.from / 30) * pixelsPerSecond
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
    label: currentItem.type.charAt(0).toUpperCase() + currentItem.type.slice(1)
  }
}
