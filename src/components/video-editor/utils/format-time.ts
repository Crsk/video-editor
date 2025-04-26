/**
 * Formats time in seconds to a readable format for timeline markers
 * For seconds less than 60, shows as 0s, 1s, 2s, etc.
 * For seconds >= 60, shows as 1:00, 1:20, etc.
 *
 * @param totalSeconds - Time in seconds
 * @returns Formatted time string
 */
export function formatTimeCode(totalSeconds: number): string {
  // For seconds less than 60, show as 0s, 1s, 2s, etc.
  if (totalSeconds < 60) return `${Math.floor(totalSeconds)}s`

  // For seconds >= 60, show as 1:00, 1:20, etc.
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Formats time as mm:ss.ms for detailed time display
 *
 * @param totalSeconds - Time in seconds
 * @returns Formatted time string with milliseconds
 */
export const formatTimeDisplay = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const milliseconds = Math.floor((totalSeconds % 1) * 10) // Only show 1 decimal place
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds}`
}
