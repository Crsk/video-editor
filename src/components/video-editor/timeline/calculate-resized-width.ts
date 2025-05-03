type CalculateResizedWidthParams = {
  mode: 'left' | 'right'
  mouseX: number
  ClipStartX: number
  pixelsPerSecond: number
  minDurationSeconds: number
  maxDurationSeconds?: number
  originalDurationSeconds?: number
}

export function calculateResizedWidth({
  mode,
  mouseX,
  ClipStartX,
  pixelsPerSecond,
  minDurationSeconds,
  maxDurationSeconds,
  originalDurationSeconds
}: CalculateResizedWidthParams): number {
  let newWidthPixels = 0
  if (mode === 'right') {
    newWidthPixels = mouseX - ClipStartX
  } else {
    // For left, width = originalRightX - mouseX
    newWidthPixels = ClipStartX + maxDurationSeconds! * pixelsPerSecond - mouseX
  }
  // Enforce minimum width
  const minWidth = minDurationSeconds * pixelsPerSecond
  if (newWidthPixels < minWidth) return minWidth

  // Check if we should enforce original duration limit
  if (originalDurationSeconds) {
    const originalWidth = originalDurationSeconds * pixelsPerSecond
    if (newWidthPixels > originalWidth) return originalWidth
  }

  // Check other max duration constraints
  if (maxDurationSeconds) {
    const maxWidth = maxDurationSeconds * pixelsPerSecond
    if (newWidthPixels > maxWidth) return maxWidth
  }

  return newWidthPixels
}
