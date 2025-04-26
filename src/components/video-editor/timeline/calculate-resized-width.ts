type CalculateResizedWidthParams = {
  mode: 'left' | 'right'
  mouseX: number
  itemStartX: number
  pixelsPerSecond: number
  minDurationSeconds: number
  maxDurationSeconds?: number
}

export function calculateResizedWidth({
  mode,
  mouseX,
  itemStartX,
  pixelsPerSecond,
  minDurationSeconds,
  maxDurationSeconds
}: CalculateResizedWidthParams): number {
  let newWidthPixels = 0
  if (mode === 'right') {
    newWidthPixels = mouseX - itemStartX
  } else {
    // For left, width = originalRightX - mouseX
    newWidthPixels = itemStartX + maxDurationSeconds! * pixelsPerSecond - mouseX
  }
  // Enforce minimum width
  const minWidth = minDurationSeconds * pixelsPerSecond
  if (newWidthPixels < minWidth) return minWidth
  if (maxDurationSeconds) {
    const maxWidth = maxDurationSeconds * pixelsPerSecond
    if (newWidthPixels > maxWidth) return maxWidth
  }
  return newWidthPixels
}
